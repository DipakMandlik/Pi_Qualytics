import { NextRequest, NextResponse } from 'next/server';
import { snowflakePool, executeQuery, ensureConnectionContext } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';
import { createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { retryQuery } from '@/lib/retry';
import { cache, CacheTTL, generateCacheKey } from '@/lib/cache';

/**
/**
 * GET /api/dq/total-checks
 * Fetches total checks executed for CURRENT_DATE
 * Falls back to most recent date if no data for today
 * 
 * Optimized with caching and retry logic
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const endpoint = `/api/dq/total-checks?date=${dateParam || 'default'}`;

  // Date validation / SQL injection protection
  let dateFilter = 'CURRENT_DATE';
  if (dateParam) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateFilter = `'${dateParam}'::DATE`;
    }
  }

  try {
    logger.logApiRequest(endpoint, 'GET');

    // Check cache first
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
      // 1. Aggregate Total Checks for the Target Date
      const query = `
        SELECT 
          SUM(TOTAL_CHECKS) as daily_total,
          MAX(START_TS) as last_scan_ts,
          MAX(RUN_ID) as latest_run_id
        FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
        WHERE START_TS::DATE = ${dateFilter}
          AND RUN_STATUS LIKE 'COMPLETED%'
      `;

      const result = await executeQuery(connection, query);

      if (result.rows.length === 0 || result.rows[0][0] === null) {
        return {
          hasData: false,
          totalChecks: 0,
          checkDate: null,
          lastExecution: null
        };
      }

      const totalChecks = result.rows[0][0] || 0;
      const lastRunTs = result.rows[0][1];
      const latestRunId = result.rows[0][2];

      return {
        hasData: true,
        totalChecks: Number(totalChecks),
        checkDate: lastRunTs, // Using latest timestamp as date reference
        lastExecution: lastRunTs,
        runId: latestRunId
      };
    }, 'total-checks');

    cache.set(cacheKey, result, CacheTTL.KPI_METRICS);
    logger.logApiResponse(endpoint, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { cached: false, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Error fetching total checks', error, { endpoint });
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

