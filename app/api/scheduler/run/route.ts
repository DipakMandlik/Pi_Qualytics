import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/server-config";
import { snowflakePool, executeQuery, ensureConnectionContext } from "@/lib/snowflake";

/**
 * GET /api/scheduler/run
 * Check for due schedules and execute them by calling actual scan APIs
 */
export async function GET(request: NextRequest) {
    try {
        const config = getServerConfig();
        if (!config) {
            return NextResponse.json(
                { success: false, error: "No Snowflake connection" },
                { status: 401 }
            );
        }

        const connection = await snowflakePool.getConnection(config);
        await ensureConnectionContext(connection, config);

        // Enforce IST Timezone for all scheduling operations
        try {
            await executeQuery(connection, "ALTER SESSION SET TIMEZONE = 'Asia/Kolkata'");
        } catch (e) {
            console.warn("Failed to set session timezone to Asia/Kolkata", e);
        }

        // Get all active schedules that are due (NEXT_RUN_AT <= NOW)
        // With session TZ set to IST, CURRENT_TIMESTAMP() returns IST time
        const dueSchedulesQuery = `
            SELECT 
                SCHEDULE_ID,
                DATABASE_NAME,
                SCHEMA_NAME,
                TABLE_NAME,
                SCAN_TYPE,
                IS_RECURRING,
                SCHEDULE_TYPE,
                SCHEDULE_TIME,
                TIMEZONE,
                CUSTOM_CONFIG
            FROM DATA_QUALITY_DB.DQ_CONFIG.SCAN_SCHEDULES
            WHERE STATUS = 'active'
                AND NEXT_RUN_AT <= CURRENT_TIMESTAMP()
            ORDER BY NEXT_RUN_AT ASC
            LIMIT 5
        `;

        let schedules: any[] = [];
        try {
            const result = await executeQuery(connection, dueSchedulesQuery);
            schedules = result.rows.map((row) => {
                const obj: any = {};
                result.columns.forEach((col, idx) => {
                    obj[col] = row[idx];
                });
                return obj;
            });
        } catch (e: any) {
            if (e.message?.includes("does not exist")) {
                return NextResponse.json({
                    success: true,
                    data: { executed: 0, message: "No schedules table yet" },
                });
            }
            throw e;
        }

        if (schedules.length === 0) {
            return NextResponse.json({
                success: true,
                data: { executed: 0, message: "No schedules due" },
            });
        }

        const executedRuns: any[] = [];

        // ... (inside GET)
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = `${protocol}://${host}`;

        for (const schedule of schedules) {
            const runResult = await executeSchedule(schedule, baseUrl, connection);
            // Log/Push based on runResult if needed, or executeSchedule handles it/returns standardized object
            if (runResult) executedRuns.push(runResult);
        }

        return NextResponse.json({
            success: true,
            data: {
                executed: executedRuns.length,
                runs: executedRuns,
            },
        });

    } catch (error: any) {
        console.error("Scheduler error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/scheduler/run
 * Force execute a specific schedule immediately
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { scheduleId } = body;

        if (!scheduleId) {
            return NextResponse.json(
                { success: false, error: "Missing scheduleId" },
                { status: 400 }
            );
        }

        const config = getServerConfig();
        if (!config) {
            return NextResponse.json(
                { success: false, error: "No Snowflake connection" },
                { status: 401 }
            );
        }

        const connection = await snowflakePool.getConnection(config);
        await ensureConnectionContext(connection, config);

        // Enforce IST
        try { await executeQuery(connection, "ALTER SESSION SET TIMEZONE = 'Asia/Kolkata'"); } catch (e) { }

        // 1. Fetch the schedule details
        const scheduleQuery = `
            SELECT 
                SCHEDULE_ID,
                DATABASE_NAME,
                SCHEMA_NAME,
                TABLE_NAME,
                SCAN_TYPE,
                IS_RECURRING,
                SCHEDULE_TYPE,
                SCHEDULE_TIME,
                TIMEZONE,
                CUSTOM_CONFIG
            FROM DATA_QUALITY_DB.DQ_CONFIG.SCAN_SCHEDULES
            WHERE SCHEDULE_ID = '${scheduleId}'
        `;
        const result = await executeQuery(connection, scheduleQuery);

        if (result.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });
        }

        // Map row to object
        const row = result.rows[0];
        const schedule: any = {};
        result.columns.forEach((col, idx) => { schedule[col] = row[idx]; });

        // 2. Execute immediately
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = `${protocol}://${host}`;

        const runResult = await executeSchedule(schedule, baseUrl, connection);

        return NextResponse.json({
            success: true,
            data: {
                message: "Schedule executed successfully",
                run: runResult
            },
        });

    } catch (error: any) {
        console.error("Force execute error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Helper to execute a single schedule
async function executeSchedule(schedule: any, baseUrl: string, connection: any) {
    try {
        console.log(`Executing scheduled ${schedule.SCAN_TYPE} scan for ${schedule.DATABASE_NAME}.${schedule.SCHEMA_NAME}.${schedule.TABLE_NAME}`);

        // Inside executeSchedule helper:
        let ruleNames: string[] = [];
        let scanScope: string = 'table';
        let scanColumns: string[] = [];

        try {
            if (schedule.CUSTOM_CONFIG) {
                const parsed = typeof schedule.CUSTOM_CONFIG === 'string'
                    ? JSON.parse(schedule.CUSTOM_CONFIG)
                    : schedule.CUSTOM_CONFIG;

                if (parsed) {
                    if (Array.isArray(parsed.customRules)) {
                        ruleNames = parsed.customRules;
                    }
                    if (parsed.scope) scanScope = parsed.scope;
                    if (Array.isArray(parsed.selectedColumns)) scanColumns = parsed.selectedColumns;

                    console.log(`[SCHEDULER] Config: ${ruleNames.length} rules, Scope: ${scanScope}, Columns: ${scanColumns.length}`);
                }
            }
        } catch (e) {
            console.warn("[SCHEDULER] Failed to parse CUSTOM_CONFIG", e);
        }

        let apiResult: any = null;

        // Call APIs
        if (schedule.SCAN_TYPE === "profiling" || schedule.SCAN_TYPE === "full") {
            const profilingResponse = await fetch(`${baseUrl}/api/dq/run-profiling`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    database: schedule.DATABASE_NAME,
                    schema: schedule.SCHEMA_NAME,
                    table: schedule.TABLE_NAME,
                    profile_level: "BASIC",
                    triggered_by: "scheduled",
                }),
            });
            apiResult = await profilingResponse.json();
            console.log(`Profiling result for ${schedule.TABLE_NAME}:`, apiResult.success ? "Success" : apiResult.error);
        }

        if (schedule.SCAN_TYPE === "checks" || schedule.SCAN_TYPE === "full" || schedule.SCAN_TYPE === "custom") {
            // Added 'custom' explicitly to be safe, though usually covered by others or default
            const checksResponse = await fetch(`${baseUrl}/api/dq/run-custom-scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    database: schedule.DATABASE_NAME,
                    schema: schedule.SCHEMA_NAME,
                    table: schedule.TABLE_NAME,
                    rule_names: ruleNames.length > 0 ? ruleNames : undefined, // Pass user selected rules
                    columns: scanColumns.length > 0 ? scanColumns : undefined, // Pass selected columns
                    scope: scanScope, // Pass scope
                    triggered_by: "scheduled",
                }),
            });
            apiResult = await checksResponse.json();
            console.log(`Checks result for ${schedule.TABLE_NAME}:`, apiResult.success ? "Success" : apiResult.error);
        }

        if (schedule.SCAN_TYPE === "anomalies") {
            const anomalyResponse = await fetch(`${baseUrl}/api/dq/run-profiling`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    database: schedule.DATABASE_NAME,
                    schema: schedule.SCHEMA_NAME,
                    table: schedule.TABLE_NAME,
                    profile_level: "BASIC",
                    triggered_by: "scheduled",
                }),
            });
            apiResult = await anomalyResponse.json();
            console.log(`Anomaly scan result for ${schedule.TABLE_NAME}:`, apiResult.success ? "Success" : apiResult.error);
        }

        // Calculate next run time
        let nextRunExpression = "NULL";
        if (schedule.IS_RECURRING) {
            if (schedule.SCHEDULE_TYPE === "hourly") {
                nextRunExpression = "DATEADD(hour, 1, CURRENT_TIMESTAMP())";
            } else if (schedule.SCHEDULE_TYPE === "daily") {
                nextRunExpression = "DATEADD(day, 1, CURRENT_TIMESTAMP())";
            } else if (schedule.SCHEDULE_TYPE === "weekly") {
                nextRunExpression = "DATEADD(week, 1, CURRENT_TIMESTAMP())";
            }
        }

        if (apiResult?.success) {
            const updateQuery = `
                UPDATE DATA_QUALITY_DB.DQ_CONFIG.SCAN_SCHEDULES
                SET LAST_RUN_AT = CURRENT_TIMESTAMP(),
                    NEXT_RUN_AT = ${nextRunExpression},
                    FAILURE_COUNT = 0,
                    UPDATED_AT = CURRENT_TIMESTAMP()
                WHERE SCHEDULE_ID = '${schedule.SCHEDULE_ID}'
            `;
            await executeQuery(connection, updateQuery);

            return {
                scheduleId: schedule.SCHEDULE_ID,
                runId: apiResult?.data?.runId || `SCHEDULED_${Date.now()}`,
                scanType: schedule.SCAN_TYPE,
                table: `${schedule.DATABASE_NAME}.${schedule.SCHEMA_NAME}.${schedule.TABLE_NAME}`,
                status: "completed",
            };
        } else {
            throw new Error(apiResult?.error || "Unknown API error");
        }

    } catch (scanError: any) {
        console.error(`Error executing schedule ${schedule.SCHEDULE_ID}:`, scanError.message);

        const failureUpdateQuery = `
            UPDATE DATA_QUALITY_DB.DQ_CONFIG.SCAN_SCHEDULES
            SET FAILURE_COUNT = COALESCE(FAILURE_COUNT, 0) + 1,
                UPDATED_AT = CURRENT_TIMESTAMP()
            WHERE SCHEDULE_ID = '${schedule.SCHEDULE_ID}'
        `;
        try { await executeQuery(connection, failureUpdateQuery); } catch (e) { }

        return {
            scheduleId: schedule.SCHEDULE_ID,
            scanType: schedule.SCAN_TYPE,
            table: `${schedule.DATABASE_NAME}.${schedule.SCHEMA_NAME}.${schedule.TABLE_NAME}`,
            status: "failed",
            error: scanError.message,
        };
    }
}
