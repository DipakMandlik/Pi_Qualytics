import { NextRequest, NextResponse } from 'next/server';
import { snowflakePool } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const config = getServerConfig();
        if (!config) {
            return NextResponse.json(
                { success: false, error: { message: 'Not connected to Snowflake' } },
                { status: 401 }
            );
        }

        const conn = await snowflakePool.getConnection(config);
        logger.logApiRequest('/api/dq/run-scan', 'POST');

        // Execute SP for full scan
        // CALL DATA_QUALITY_DB.DQ_ENGINE.SP_EXECUTE_DQ_CHECKS(NULL, NULL, 'FULL');
        const result = await new Promise((resolve, reject) => {
            conn.execute({
                sqlText: `CALL DATA_QUALITY_DB.DQ_ENGINE.SP_EXECUTE_DQ_CHECKS(NULL, NULL, 'FULL')`,
                complete: (err: any, stmt: any, rows: any) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            });
        });

        logger.logApiResponse('/api/dq/run-scan', true, 0); // simplified logging
        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        logger.error('Error running scan', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}
