
const { snowflakePool, executeQuery } = require('./lib/snowflake');
const { getServerConfig } = require('./lib/server-config');
const fs = require('fs');

async function run() {
    try {
        const config = getServerConfig();
        const connection = await snowflakePool.getConnection(config);
        const sql = fs.readFileSync('check_runs.sql', 'utf8');
        const result = await executeQuery(connection, sql);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
