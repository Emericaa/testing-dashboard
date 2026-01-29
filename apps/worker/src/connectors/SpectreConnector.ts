import { Connector, ConnectorResult } from './Connector';

export class SpectreConnector implements Connector {
  type = 'spectre';
  constructor(private secret: string | null) {}

  async testConnection(_orgId: string): Promise<ConnectorResult> {
    if (!this.secret) {
      return { status: 'error', message: 'Missing Spectre credentials' };
    }
    return { status: 'ok', message: 'Spectre connector ready (stub)' };
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
