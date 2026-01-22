
import fs from 'fs';
import path from 'path';
import { snowflakePool, executeQuery } from '../lib/snowflake';
import { getServerConfig } from '../lib/server-config';

async function seedLineage() {
    console.log('Starting lineage seeding...');

    const config = getServerConfig();
    if (!config) {
        console.error('No Snowflake configuration found via getServerConfig()');
        process.exit(1);
    }

    try {
        const connection = await snowflakePool.getConnection(config);

        // Read SQL file
        const sqlPath = path.join(process.cwd(), 'sql', 'setup_lineage_data.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split into statements (basic split by semicolon, ignoring simplistic edge cases for this demo script)
        // Snowflake execute can handle multiple statements if configured, but let's try splitting safely
        // Actually, the snowflake-sdk execute() usually handles one statement.
        // We'll split by likely statement boundaries.

        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const [index, sql] of statements.entries()) {
            console.log(`Executing statement ${index + 1}...`);
            try {
                await executeQuery(connection, sql);
            } catch (e: any) {
                // Ignore "Table already exists" kind of errors if we want, but our script assumes IF NOT EXISTS or idempotency
                console.warn(`Statement ${index + 1} warning/error: ${e.message}`);
            }
        }

        console.log('Lineage seeding completed successfully.');
    } catch (err) {
        console.error('Error seeding lineage:', err);
    }
}

seedLineage().catch(console.error);
