
import React from 'react';

export enum ViewType {
  EXECUTIVE = 'EXECUTIVE',
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
  PLATFORM = 'PLATFORM',
  TABLE_ANALYSIS = 'TABLE_ANALYSIS'
}

export interface MetricCardData {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  subtext?: string;
  calculationLogic?: string;
  sourceSql?: string;
}

export interface SnowflakeConfig {
  account: string;
  warehouse: string;
  database: string;
  role: string;
  authType: 'KEY_PAIR' | 'OAUTH' | 'BASIC';
}

export interface TableRule {
  id: string;
  name: string;
  type: 'COMPLETENESS' | 'UNIQUENESS' | 'VALIDITY' | 'CONSISTENCY' | 'CUSTOM';
  sql: string;
  threshold: number;
  enabled: boolean;
  lastRunStatus?: 'PASS' | 'FAIL';
}

export interface TableAnalysis {
  tableName: string;
  healthScore: number;
  impactScore: number;
  creditsConsumed: number;
  rowsProcessed: number;
  columns: {
    name: string;
    type: string;
    nullPercentage: number;
    distinctCount: number;
  }[];
}

export interface DQRun {
  runId: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  duration: string;
  checksExecuted: number;
  credits: number;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
}
