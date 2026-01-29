export interface ConnectorResult {
  status: 'ok' | 'error';
  message?: string;
}

export interface Connector {
  type: string;
  testConnection(orgId: string): Promise<ConnectorResult>;
  syncCompanies(orgId: string): Promise<number>;
  syncRounds(orgId: string): Promise<number>;
  syncMetrics(companyId: string): Promise<number>;
}
