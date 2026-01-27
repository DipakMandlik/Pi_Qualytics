import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/server-config';

export const runtime = 'nodejs';

/**
 * GET /api/governance/audit
 * Lists audit logs.
 */
export async function GET(request: NextRequest) {
    try {
        const config = getServerConfig();
        if (!config) return NextResponse.json({ success: false, error: 'Not connected' }, { status: 401 });

        const { snowflakePool, executeQueryObjects, executeQuery } = await import('@/lib/snowflake');
        const connection = await snowflakePool.getConnection(config);

        await executeQuery(connection, `USE DATABASE DATA_QUALITY_DB`);
        await executeQuery(connection, `USE SCHEMA DQ_CONFIG`);

        const sql = `
      SELECT *
      FROM DQ_GOVERNANCE_AUDIT
      ORDER BY CHANGED_AT DESC
      LIMIT 100
    `;
        const rows = await executeQueryObjects(connection, sql);

        return NextResponse.json({ success: true, data: rows });

    } catch (error: any) {
        if (error.message?.includes('does not exist')) {
            return NextResponse.json({ success: true, data: [] });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
