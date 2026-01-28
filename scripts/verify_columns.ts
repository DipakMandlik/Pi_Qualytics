
import { snowflakePool, executeQuery } from '../lib/snowflake';
import { getServerConfig } from '../lib/server-config';

async function checkColumns() {
    const config = getServerConfig();
    if (!config && !process.env.SNOWFLAKE_ACCOUNT) {
        console.error('No configuration found. Ensure env vars are set.');
        process.exit(1);
    }

    const connection = await snowflakePool.getConnection(config || undefined);

    try {
        console.log("Checking DQ_RUN_CONTROL columns...");
        const runControlQuery = `
      SELECT COLUMN_NAME 
      FROM DATA_QUALITY_DB.INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'DQ_METRICS' 
      AND TABLE_NAME = 'DQ_RUN_CONTROL'
    `;
        const rcResult = await executeQuery(connection, runControlQuery);
        console.log("DQ_RUN_CONTROL Columns:", rcResult.rows.flat());

        console.log("\nChecking DATA_LINEAGE columns...");
        const lineageQuery = `
      SELECT COLUMN_NAME 
      FROM DATA_QUALITY_DB.INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'DQ_METRICS' 
      AND TABLE_NAME = 'DATA_LINEAGE'
    `;
        const dlResult = await executeQuery(connection, lineageQuery);
        console.log("DATA_LINEAGE Columns:", dlResult.rows.flat());

    } catch (err) {
        console.error(err);
    }
}

checkColumns();
