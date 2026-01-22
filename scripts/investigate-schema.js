
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
// Manually parse .env.local since dotenv module is missing/failing
try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // simple quote removal
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error('Error reading .env.local:', e);
}

async function checkSchema() {
    console.log('Checking schemas...');

    // Create connection
    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: 'PUBLIC', // connect to public, we will query fully qualified info schema
        role: process.env.SNOWFLAKE_ROLE
    });

    try {
        await new Promise((resolve, reject) => {
            connection.connect((err, conn) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('Connected.');

        // Function to run query
        const runQuery = (sql) => new Promise((resolve, reject) => {
            connection.execute({
                sqlText: sql,
                complete: (err, stmt, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            });
        });

        // Check DB_METRICS tables
        console.log('\n--- Tables in DATA_QUALITY_DB.DB_METRICS ---');
        try {
            const rows1 = await runQuery("SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DB_METRICS");
            rows1.forEach(row => console.log(`[DB_METRICS] ${row.name}`));
        } catch (e) { console.log('Error checking DB_METRICS:', e.message); }

        // Check DQ_METRICS tables
        console.log('\n--- Tables in DATA_QUALITY_DB.DQ_METRICS ---');
        try {
            const rows2 = await runQuery("SHOW TABLES IN SCHEMA DATA_QUALITY_DB.DQ_METRICS");
            rows2.forEach(row => console.log(`[DQ_METRICS] ${row.name}`));
        } catch (e) { console.log('Error checking DQ_METRICS:', e.message); }

    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        if (connection) {
            connection.destroy((err, conn) => { });
        }
    }
}

checkSchema();
