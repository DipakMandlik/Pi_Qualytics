
const fs = require('fs');
const path = require('path');
const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

async function setupReporting() {
    console.log('Starting Reporting Schema setup (Pure JS)...');

    if (!process.env.SNOWFLAKE_ACCOUNT) {
        console.error('Missing SNOWFLAKE_ACCOUNT in .env.local');
        return;
    }

    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA || 'DB_METRICS',
        role: process.env.SNOWFLAKE_ROLE
    });

    try {
        await new Promise((resolve, reject) => {
            connection.connect((err, conn) => {
                if (err) {
                    console.error('Unable to connect: ' + err.message);
                    reject(err);
                } else {
                    console.log('Successfully connected to Snowflake.');
                    resolve();
                }
            });
        });

        // Read SQL file
        const sqlPath = path.join(process.cwd(), 'sql', 'setup_reporting_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split into statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const [index, sql] of statements.entries()) {
            console.log(`Executing statement ${index + 1}...`);
            try {
                await new Promise((resolve, reject) => {
                    connection.execute({
                        sqlText: sql,
                        complete: (err, stmt, rows) => {
                            if (err) {
                                console.warn(`Statement ${index + 1} failed: ${err.message}`);
                                resolve(); // Continue
                            } else {
                                resolve();
                            }
                        }
                    });
                });
            } catch (e) {
                console.warn(`Statement ${index + 1} execution error: ${e.message}`);
            }
        }

        console.log('Reporting schema setup completed successfully.');
    } catch (err) {
        console.error('Error setting up reporting schema:', err);
    } finally {
        if (connection) {
            connection.destroy((err, conn) => {
                // Ignore disconnect errors
            });
        }
    }
}

setupReporting();
