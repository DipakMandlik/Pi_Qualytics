import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/server-config';

export const runtime = 'nodejs';

/**
 * GET /api/dq/datasets/[dataset]
 * 
 * Fetches detailed metadata for a specific table (dataset).
 * [dataset] param is the TABLE NAME.
 * 
 * Returns:
 * - Metadata (Row Count, Created, etc)
 * - Columns (Name, Type)
 * - Onboarding Status (is it in DATASET_CONFIG?)
 * - DQ Summary (if onboarded)
 * 
 * STRICT SNOWFLAKE ENFORCEMENT. No Mocks.
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ dataset: string }> }
) {
    let datasetName = 'unknown';

    try {
        const { dataset } = await props.params;
        datasetName = dataset;

        const tableName = dataset.toUpperCase(); // Table Name
        const config = getServerConfig();

        if (!config) {
            return NextResponse.json({ success: false, error: 'Not connected to Snowflake' }, { status: 401 });
        }

        const { snowflakePool, executeQueryObjects, executeQuery } = await import('@/lib/snowflake');
        const connection = await snowflakePool.getConnection(config);

        // Hardcoded context for now (could be query params)
        const database = 'BANKING_DW';
        const schema = 'BRONZE';

        // 1. Context Switch
        // Ensure we await the context switch using executeQuery (which returns a Promise)
        await executeQuery(connection, `USE DATABASE ${database}`);
        await executeQuery(connection, `USE SCHEMA ${schema}`);

        // 2. Fetch Table Metadata
        const metaQuery = `
      SELECT TABLE_NAME, ROW_COUNT, CREATED, LAST_ALTERED, COMMENT
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `;
        const metaRows = await executeQueryObjects(connection, metaQuery, [schema, tableName]);

        if (metaRows.length === 0) {
            return NextResponse.json({ success: false, error: `Table ${tableName} not found in Snowflake` }, { status: 404 });
        }
        const tableMeta = metaRows[0];

        // 3. Fetch Columns
        const colQuery = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
        const colRows = await executeQueryObjects(connection, colQuery, [schema, tableName]);

        // 4. Check Onboarding (DATASET_CONFIG)
        // We need to query DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
        // We assume this table exists.
        let isOnboarded = false;
        let datasetId = null;

        try {
            const configQuery = `
        SELECT DATASET_ID 
        FROM DATA_QUALITY_DB.DQ_CONFIG.DATASET_CONFIG
        WHERE SOURCE_DATABASE = ? AND SOURCE_SCHEMA = ? AND SOURCE_TABLE = ?
          AND IS_ACTIVE = TRUE
      `;
            const configRows = await executeQueryObjects(connection, configQuery, [database, schema, tableName]);

            if (configRows.length > 0) {
                isOnboarded = true;
                datasetId = configRows[0].DATASET_ID;
            }
        } catch (e) {
            console.warn('Could not check onboarding status (tables might be missing):', e);
        }

        return NextResponse.json({
            success: true,
            data: {
                name: tableMeta.TABLE_NAME,
                database,
                schema,
                rowCount: tableMeta.ROW_COUNT || 0,
                created: tableMeta.CREATED,
                lastAltered: tableMeta.LAST_ALTERED,
                columns: colRows,
                isOnboarded,
                datasetId
            }
        });

    } catch (error: any) {
        console.error(`Error fetching details for ${datasetName}:`, error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch dataset details'
        }, { status: 500 });
    }
}
