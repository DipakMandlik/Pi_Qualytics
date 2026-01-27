import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/server-config';

export const runtime = 'nodejs';

/**
 * GET /api/dq/datasets
 * Fetches available datasets (tables) from BANKING_DW.BRONZE schema
 * with metadata (rowCount, created, lastAltered)
 */
export async function GET(request: NextRequest) {
  try {
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

    const { snowflakePool, executeQueryObjects } = await import('@/lib/snowflake');

    const connection = await snowflakePool.getConnection(config);

    // Use BANKING_DW database and BRONZE schema
    // In strict mode, we might want to parameterized this or take from config
    // But existing code hardcoded it, so we stick to it but ensure dynamic query
    // Actually getServerConfig logic prioritized defaults.

    // Use BANKING_DW database and BRONZE schema
    // Ensure we await the context switch using executeQuery (which returns a Promise)
    // Raw connection.execute does not return a promise by default in the SDK
    const { executeQuery } = await import('@/lib/snowflake');

    await executeQuery(connection, 'USE DATABASE BANKING_DW');
    await executeQuery(connection, 'USE SCHEMA BRONZE');

    // Fetch table names that match the pattern STG_% (or all)
    // STG_% was in previous internal implementation.
    // Query INFORMATION_SCHEMA for metadata
    const query = `
      SELECT 
        TABLE_NAME, 
        ROW_COUNT, 
        CREATED, 
        LAST_ALTERED 
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'BRONZE'
        AND TABLE_CATALOG = 'BANKING_DW'
        AND TABLE_NAME LIKE 'STG_%'
      ORDER BY TABLE_NAME
    `;

    // executeQueryObjects returns rows as objects (UPPERCASE keys)
    const rows = await executeQueryObjects(connection, query);

    const datasets = rows.map((row: any) => ({
      name: row.TABLE_NAME,
      rowCount: row.ROW_COUNT || 0,
      created: row.CREATED,
      lastAltered: row.LAST_ALTERED,
      schema: 'BRONZE',
      database: 'BANKING_DW'
    }));

    return NextResponse.json({
      success: true,
      data: datasets,
      rowCount: datasets.length,
    });
  } catch (error: any) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch datasets',
      },
      { status: 500 }
    );
  }
}
