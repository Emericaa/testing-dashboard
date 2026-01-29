import { Connector, ConnectorResult } from './Connector';

export class PitchBookConnector implements Connector {
  type = 'pitchbook';
  constructor(private secret: string | null) {}

  async testConnection(_orgId: string): Promise<ConnectorResult> {
    if (!this.secret) {
      return { status: 'error', message: 'Missing PitchBook credentials' };
    }
    return { status: 'ok', message: 'PitchBook connector ready (stub)' };
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
