import { NextRequest, NextResponse } from "next/server";
import {
  snowflakePool,
  executeQuery,
  ensureConnectionContext,
} from "@/lib/snowflake";
import { getServerConfig } from "@/lib/server-config";
import { createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { retryQuery } from '@/lib/retry';
import { cache, CacheTTL, generateCacheKey } from '@/lib/cache';

/**
/**
 * GET /api/dq/critical-failed-records
 * Fetches count of critical failed records for CURRENT_DATE
 * Falls back to most recent date if no data for today
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const endpoint = `/api/dq/critical-failed-records?date=${dateParam || 'default'}`;

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
          error: "Not connected to Snowflake. Please connect first.",
        },
        { status: 401 }
      );
    }

    const connection = await snowflakePool.getConnection(config);
    await ensureConnectionContext(connection, config);

    // 1. Aggregate Critical Failed Records for the Target Date
    const query = `
      SELECT 
          COUNT(f.FAILURE_ID) as critical_failed_records,
          MAX(r.START_TS) as last_scan_ts,
          MAX(r.RUN_ID) as latest_run_id
      FROM DATA_QUALITY_DB.DQ_METRICS.DQ_FAILED_RECORDS f
      JOIN DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL r ON f.RUN_ID = r.RUN_ID
      WHERE f.IS_CRITICAL = TRUE
        AND r.START_TS::DATE = ${dateFilter}
        AND r.RUN_STATUS LIKE 'COMPLETED%'
    `;

    const queryResult = await executeQuery(connection, query);
    let criticalFailedRecords = 0;
    let runTimestamp = null;
    let latestRunId = null;

    if (
      queryResult.rows.length > 0 &&
      queryResult.rows[0][0] !== null
    ) {
      criticalFailedRecords = queryResult.rows[0][0];
      runTimestamp = queryResult.rows[0][1];
      latestRunId = queryResult.rows[0][2];
    }

    const result = {
      criticalFailedRecords: Number(criticalFailedRecords),
      summaryDate: runTimestamp,
      runId: latestRunId
    };
    cache.set(cacheKey, result, CacheTTL.QUICK_METRICS);
    logger.logApiResponse(endpoint, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: { cached: false, timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    logger.error("Error fetching critical failed records", error, { endpoint });
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
