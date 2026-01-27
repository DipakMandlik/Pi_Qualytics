import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/server-config';

export const runtime = 'nodejs';

/**
 * GET /api/governance/slas
 * Lists all configured SLAs.
 */
export async function GET(request: NextRequest) {
    try {
        const config = getServerConfig();
        if (!config) return NextResponse.json({ success: false, error: 'Not connected' }, { status: 401 });

        const { snowflakePool, executeQueryObjects, executeQuery } = await import('@/lib/snowflake');
        const connection = await snowflakePool.getConnection(config);

        await executeQuery(connection, `USE DATABASE DATA_QUALITY_DB`);
        await executeQuery(connection, `USE SCHEMA DQ_CONFIG`);

        // Get SLAs
        const sql = `
      SELECT *
      FROM DQ_SLA_CONFIG
      ORDER BY CREATED_AT DESC
    `;
        const rows = await executeQueryObjects(connection, sql);

        return NextResponse.json({ success: true, data: rows });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/governance/slas
 * Creates or Updates an SLA.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dataset, type, threshold, window, enabled } = body;

        // Validation
        if (!dataset || !type || !threshold) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const config = getServerConfig();
        if (!config) return NextResponse.json({ success: false, error: 'Not connected' }, { status: 401 });

        const { snowflakePool, executeQuery } = await import('@/lib/snowflake');
        const connection = await snowflakePool.getConnection(config);

        await executeQuery(connection, `USE DATABASE DATA_QUALITY_DB`);
        await executeQuery(connection, `USE SCHEMA DQ_CONFIG`);

        // Insert (Assuming create only for V1, or replace)
        // We'll use INSERT for now, or update if exists? 
        // Let's assume unique SLA per dataset+type?
        // Using MERGE is safer.

        const mergeSql = `
      MERGE INTO DQ_SLA_CONFIG AS target
      USING (SELECT ? as D, ? as T, ? as V, ? as W, ? as E) AS source
      ON target.DATASET_NAME = source.D AND target.SLA_TYPE = source.T
      WHEN MATCHED THEN
        UPDATE SET THRESHOLD_VALUE = source.V, WINDOW_HOURS = source.W, ENABLED = source.E
      WHEN NOT MATCHED THEN
        INSERT (DATASET_NAME, SLA_TYPE, THRESHOLD_VALUE, WINDOW_HOURS, ENABLED, DATABASE_NAME, SCHEMA_NAME)
        VALUES (source.D, source.T, source.V, source.W, source.E, 'BANKING_DW', 'BRONZE')
    `;

        await executeQuery(connection, mergeSql, [dataset, type, threshold, window || 24, enabled ?? true]);

        // Audit
        const auditSql = `
      INSERT INTO DQ_GOVERNANCE_AUDIT (ENTITY_TYPE, ENTITY_ID, ACTION, CHANGED_BY, NEW_VALUE)
      SELECT 'SLA', ?, 'UPDATE', 'SYSTEM_USER', PARSE_JSON(?)
    `;
        await executeQuery(connection, auditSql, [`${dataset}-${type}`, JSON.stringify(body)]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error saving SLA:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
