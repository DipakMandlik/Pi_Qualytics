
import { NextRequest, NextResponse } from "next/server";
import { snowflakePool, executeQuery } from "../../../lib/snowflake";
import { getServerConfig } from "../../../lib/server-config";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const config = getServerConfig();
        const connection = await snowflakePool.getConnection(config || undefined);


        // 1. Check Tables
        const lookForTables = `
            SELECT DISTINCT TABLE_NAME, SCHEMA_NAME, MAX(TOTAL_RECORDS) as RECS
            FROM DATA_QUALITY_DB.DQ_METRICS.DQ_CHECK_RESULTS c
            JOIN DATA_QUALITY_DB.DQ_METRICS.DQ_RUN_CONTROL r ON c.RUN_ID = r.RUN_ID
            WHERE r.START_TS::DATE = CURRENT_DATE()
            GROUP BY TABLE_NAME, SCHEMA_NAME
        `;
        const tables = await executeQuery(connection, lookForTables);

        // 2. Check Logo
        const fs = require('fs');
        const path = require('path');
        const logoPath = path.join(process.cwd(), 'public', 'PBT_logo_final.jpg');
        const logoExists = fs.existsSync(logoPath);
        const cwd = process.cwd();

        const debugInfo = {
            today: new Date().toISOString(),
            tables_found_today: tables.rows,
            logo_check: {
                path: logoPath,
                exists: logoExists,
                cwd: cwd,
                files_in_public: fs.existsSync(path.join(cwd, 'public')) ? fs.readdirSync(path.join(cwd, 'public')) : 'public dir not found'
            }
        };

        console.log("Debug Info:", debugInfo);
        return NextResponse.json(debugInfo);
    } catch (error: any) {
        console.error("Debug Runs Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
