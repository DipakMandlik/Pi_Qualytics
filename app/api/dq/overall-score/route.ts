import { NextRequest, NextResponse } from 'next/server';
import { snowflakePool, executeQuery, ensureConnectionContext } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';
import { createErrorResponse } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { retryQuery } from '@/lib/retry';
import { cache, CacheTTL, generateCacheKey } from '@/lib/cache';

/**
 * GET /api/dq/overall-score
 * Fetches overall DQ score calculated as average of all DQ_SCORE values for CURRENT_DATE
 * Also returns yesterday's score for comparison
 * 
 * Optimizations:
 * - Cached for 60 seconds
 * - Retry logic for transient failures
 * - Structured error handling
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  // If date is provided, validate it
  let targetDate = 'CURRENT_DATE';
  if (dateParam) {
    // Simple validation YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      targetDate = `'${dateParam}'::DATE`;
    }
  }

  const endpoint = `/api/dq/overall-score?date=${dateParam || 'today'}`;

  try {
    logger.logApiRequest(endpoint, 'GET');

    // Try to get from cache
    const cacheKey = generateCacheKey(endpoint);
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const duration = Date.now() - startTime;
      logger.logApiResponse(endpoint, true, duration);
      return NextResponse.json({
        success: true,
        data: cachedData,
        metadata: {
          cached: true,
          timestamp: new Date().toISOString(),
          queryTime: 0,
        },
      });
    }

    // Get config from server-side storage
    const config = getServerConfig();
    if (!config) {
      logger.warn('No Snowflake configuration found', { endpoint });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: 'Not connected to Snowflake',
            userMessage: 'Please connect to Snowflake first.',
          },
        },
        { status: 401 }
      );
    }

    const connection = await snowflakePool.getConnection(config);
    await ensureConnectionContext(connection, config);

    // Fetch data with retry logic
    const queryStartTime = Date.now();

    const result = await retryQuery(async () => {
      // 1. Aggregate Score for the Target Date
      // Weighted Average Strategy: Total Passed / Total Checks across all runs
      const query = `
        SELECT 
            SUM(TOTAL_CHECKS) as daily_checks,
            SUM(FAILED_CHECKS) as daily_failed,
            MAX(START_TS) as last_scan_ts,
            MAX(RUN_ID) as latest_run_id
        FROM DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL
        WHERE START_TS::DATE = ${targetDate}
        AND RUN_STATUS LIKE 'COMPLETED%'
      `;

      const result = await executeQuery(connection, query);

      if (result.rows.length === 0 || result.rows[0][0] === null) {
        return {
          hasData: false,
          overallScore: 0,
          previousScore: null,
          scoreDifference: undefined,
          summaryDate: null
        };
      }

      const totalChecks = Number(result.rows[0][0] || 0);
      const failedChecks = Number(result.rows[0][1] || 0);
      const lastRunTs = result.rows[0][2];
      const latestRunId = result.rows[0][3];

      const passedChecks = Math.max(0, totalChecks - failedChecks);
      const overallScore = totalChecks > 0 ? (passedChecks / totalChecks) : 0;

      return {
        overallScore: overallScore, // API expects 0.0 - 1.0
        previousScore: null,
        scoreDifference: undefined,
        summaryDate: lastRunTs,
        hasData: true,
        runId: latestRunId
      };
    }, 'overall-score');

    const queryTime = Date.now() - queryStartTime;
    logger.logQuery('Overall DQ Score', queryTime, 1);

    // Cache the result
    cache.set(cacheKey, result, CacheTTL.KPI_METRICS);

    const duration = Date.now() - startTime;
    logger.logApiResponse(endpoint, true, duration);

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        cached: false,
        timestamp: new Date().toISOString(),
        queryTime,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching overall DQ score', error, { endpoint });
    logger.logApiResponse(endpoint, false, duration);

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

