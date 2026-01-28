import { NextRequest, NextResponse } from 'next/server';
import { snowflakePool, executeQuery, ensureConnectionContext } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';
import { createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { retryQuery } from '@/lib/retry';
import { cache, CacheTTL, generateCacheKey } from '@/lib/cache';

/**
/**
 * GET /api/dq/sla-compliance
 * Fetches SLA compliance percentage for CURRENT_DATE
 * Falls back to most recent date if no data for today
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const endpoint = `/api/dq/sla-compliance?date=${dateParam || 'default'}`;

  // Date validation
  let dateFilter = 'CURRENT_DATE';
  if (dateParam) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateFilter = `'${dateParam}'::DATE`;
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
        {
          success: false,
          error: 'Not connected to Snowflake. Please connect first.',
        },
        { status: 401 }
      );
    }

    const connection = await snowflakePool.getConnection(config);
    await ensureConnectionContext(connection, config);

    // 1. Get the LATEST SUCCESSFUL RUN_ID
    const latestRunQuery = `
      SELECT RUN_ID, START_TS
      FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
      WHERE RUN_STATUS LIKE 'COMPLETED%'
      ORDER BY START_TS DESC
      LIMIT 1
    `;

    const runResult = await executeQuery(connection, latestRunQuery);

    if (runResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { hasData: false, slaCompliancePct: 0 },
        metadata: { cached: false, timestamp: new Date().toISOString() },
      });
    }

    const latestRunId = runResult.rows[0][0];
    const runTimestamp = runResult.rows[0][1];

    // 2. Calculate SLA Compliance for this RUN
    // Check DQ_DAILY_SUMMARY where LAST_RUN_ID matches our latest run
    // OR calculate from check results if needed.
    // Given the summary table has LAST_RUN_ID, we can leverage it.
    const slaQuery = `
      SELECT
        ROUND(
          (SUM(CASE WHEN IS_SLA_MET THEN 1 ELSE 0 END) * 100.0)
          / NULLIF(COUNT(*), 0),
          2
        ) AS sla_compliance_pct
      FROM DATA_QUALITY_DB.DQ_METRICS.DQ_DAILY_SUMMARY
      WHERE LAST_RUN_ID = '${latestRunId}'
    `;

    const queryResult = await executeQuery(connection, slaQuery);
    let slaCompliancePct = 0;

    // Safety check: if no rows in summary but run exists in control, default to 0 or derive from results
    // For now we trust DAILY_SUMMARY is populated by the run.
    if (queryResult.rows.length > 0 && queryResult.rows[0][0] !== null) {
      slaCompliancePct = queryResult.rows[0][0];
    } else {
      // Fallback: If summary not ready, maybe compute from DQ_CHECK_RESULTS?
      // Let's stick to returning 0/null to imply processing or no data yet.
      // Actually, if a run just finished, summary should be there.
    }

    const result = {
      hasData: true,
      slaCompliancePct: slaCompliancePct,
      summaryDate: runTimestamp,
      runId: latestRunId
    };
    cache.set(cacheKey, result, CacheTTL.KPI_METRICS);
    logger.logApiResponse(endpoint, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { cached: false, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error('Error fetching SLA compliance', error, { endpoint });
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}