import { NextRequest, NextResponse } from 'next/server';
import { snowflakePool, executeQuery, ensureConnectionContext } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';
import { createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { retryQuery } from '@/lib/retry';
import { cache, CacheTTL, generateCacheKey } from '@/lib/cache';

/**
/**
 * GET /api/dq/failed-checks
 * Fetches total failed checks for CURRENT_DATE
 * Falls back to most recent date if no data for today
 * 
 * Optimized with caching and retry logic
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const endpoint = `/api/dq/failed-checks?date=${dateParam || 'default'}`;

  // Date validation
  let dateFilter = 'CURRENT_DATE';
  let prevDateFilter = `DATEADD(day, -1, CURRENT_DATE)`;

  if (dateParam) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateFilter = `'${dateParam}'::DATE`;
      prevDateFilter = `DATEADD(day, -1, '${dateParam}'::DATE)`;
    }
  }

  try {
    logger.logApiRequest(endpoint, 'GET');

    const cacheKey = generateCacheKey(endpoint);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      logger.logApiResponse(endpoint, true, Date.now() - startTime);
      return NextResponse.json({
        success: true,
        data: cachedData,
        metadata: { cached: true, timestamp: new Date().toISOString() },
      });
    }

    const config = getServerConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_FAILED', message: 'Not connected', userMessage: 'Please connect to Snowflake first.' } },
        { status: 401 }
      );
    }

    const connection = await snowflakePool.getConnection(config);
    await ensureConnectionContext(connection, config);

    const result = await retryQuery(async () => {
      // 1. Aggregate Failed Checks for the Target Date
      const query = `
        SELECT 
          SUM(FAILED_CHECKS) as daily_failed,
          MAX(START_TS) as last_scan_ts,
          MAX(RUN_ID) as latest_run_id
        FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
        WHERE START_TS::DATE = ${dateFilter}
          AND RUN_STATUS LIKE 'COMPLETED%'
      `;

      const result = await executeQuery(connection, query);

      if (result.rows.length === 0 || result.rows[0][0] === null) {
        return { hasData: false, totalFailedChecks: 0, failedChecksDifference: 0 };
      }

      const totalFailedChecks = result.rows[0][0] || 0;
      const lastRunTs = result.rows[0][1];
      const latestRunId = result.rows[0][2];

      // No trend analysis for now as we are scoping to single run
      // Ideally we would fetch the PREVIOUS date and compare.

      return {
        hasData: true,
        totalFailedChecks: Number(totalFailedChecks),
        failedChecksDifference: 0,
        summaryDate: lastRunTs,
        runId: latestRunId
      };
    }, 'failed-checks');

    cache.set(cacheKey, result, CacheTTL.KPI_METRICS);
    logger.logApiResponse(endpoint, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { cached: false, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Error fetching failed checks', error, { endpoint });
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}