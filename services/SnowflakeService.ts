
import { SnowflakeConfig, TableAnalysis, TableRule, DQRun } from '../types';

/**
 * PI_Qualytics Snowflake Service
 * Acts as the bridge between the UI and Snowflake SQL API.
 * Revenue risk calculations have been deprecated and removed.
 */
class SnowflakeService {
  private static instance: SnowflakeService;
  private isConnected: boolean = false;
  private config: SnowflakeConfig | null = null;
  private authToken: string | null = null;

  static getInstance() {
    if (!SnowflakeService.instance) {
      SnowflakeService.instance = new SnowflakeService();
    }
    return SnowflakeService.instance;
  }

  get connectionStatus() {
    return this.isConnected;
  }

  /**
   * Main execution engine for Snowflake SQL API v2
   */
  async executeQuery(sql: string, params: any = {}) {
    if (!this.isConnected) {
      return this.simulateSnowflakeResponse(sql);
    }

    const endpoint = `https://${this.config?.account}.snowflakecomputing.com/api/v2/statements`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          'X-Snowflake-Authorization-Token-Type': 'OAUTH'
        },
        body: JSON.stringify({
          statement: sql,
          warehouse: this.config?.warehouse,
          database: this.config?.database,
          role: this.config?.role,
          parameters: params
        })
      });

      if (!response.ok) throw new Error("Snowflake API connection failed");
      return await response.json();
    } catch (error) {
      console.error("SQL Error:", error);
      return null;
    }
  }

  private simulateSnowflakeResponse(sql: string) {
    if (sql.includes('COUNT')) return { data: [["94.5"]], rowType: [{ name: "SCORE" }] };
    if (sql.includes('DATA_TRUST_INDEX')) return { data: [["88"]], rowType: [] };
    return { data: [], rowType: [] };
  }

  async connect(config: SnowflakeConfig, token: string): Promise<boolean> {
    this.config = config;
    this.authToken = token;
    await new Promise(r => setTimeout(r, 800));
    this.isConnected = true;
    return true;
  }

  async getOverallDQScore(): Promise<number> {
    const sql = `SELECT AVG(DQ_SCORE) FROM DQ_DAILY_SUMMARY WHERE SUMMARY_DATE = CURRENT_DATE()`;
    const result = await this.executeQuery(sql);
    return result ? parseFloat(result.data[0][0]) : 94.5;
  }

  /** New Metric: Data Trust Index (Replacing Revenue Risk) */
  async getDataTrustIndex(): Promise<number> {
    const sql = `
      SELECT (VALID_RECORDS / TOTAL_RECORDS) * 100 
      FROM DQ_CHECK_RESULTS 
      WHERE RULE_TYPE IN ('VALIDITY', 'CONSISTENCY')
    `;
    const result = await this.executeQuery(sql);
    return result ? parseFloat(result.data[0][0]) : 88;
  }

  async fetchRuns(): Promise<DQRun[]> {
    return [
      { 
        runId: 'RUN_102', 
        timestamp: '2024-01-07 03:18:42', 
        status: 'SUCCESS', 
        duration: '14s', 
        checksExecuted: 60, 
        credits: 0.42,
        summary: { passed: 58, failed: 2, warnings: 0 }
      }
    ];
  }
}

export const snowflakeService = SnowflakeService.getInstance();
