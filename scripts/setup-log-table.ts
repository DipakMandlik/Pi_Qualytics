
import { snowflakePool, executeQuery } from '@/lib/snowflake';
import { getServerConfig } from '@/lib/server-config';

async function setupLogTable() {
    const config = getServerConfig();
    if (!config) {
        console.error('No config');
        return;
    }
    const connection = await snowflakePool.getConnection(config);

    const sql = `
    CREATE TABLE IF NOT EXISTS DATA_QUALITY_DB.DB_METRICS.DQ_GEMINI_EXECUTION_LOG (
        EXECUTION_ID STRING,
        USER_QUESTION STRING,
        ASSET_ID STRING,
        GEMINI_PLAN VARIANT,
        VALIDATION_ERROR STRING,
        SQL_EXECUTED STRING,
        EXECUTION_STATUS STRING,
        ERROR_MESSAGE STRING,
        RESULT_ROW_COUNT INTEGER,
        CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
        PRIMARY KEY (EXECUTION_ID)
    );
    `;

    await executeQuery(connection, sql);
    console.log('Log table created successfully');
}

setupLogTable().catch(console.error);
