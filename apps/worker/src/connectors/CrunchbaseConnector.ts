import { Connector, ConnectorResult } from './Connector';

export class CrunchbaseConnector implements Connector {
  type = 'crunchbase';
  constructor(private secret: string | null) {}

  async testConnection(_orgId: string): Promise<ConnectorResult> {
    if (!this.secret) {
      return { status: 'error', message: 'Missing Crunchbase API key' };
    }
    return { status: 'ok', message: 'Crunchbase connector ready (stub)' };
  }

  async syncCompanies(_orgId: string): Promise<number> {
    return 0;
  }

  async syncRounds(_orgId: string): Promise<number> {
    return 0;
  }

  async syncMetrics(_companyId: string): Promise<number> {
    return 0;
  }
}
