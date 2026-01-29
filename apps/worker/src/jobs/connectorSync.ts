import type { Job } from 'bullmq';
import { connectorTypes, getConnector } from '../connectors';
import { supabaseAdmin } from '../services/supabase';
import { log } from '../services/logger';

async function resolveOrgIds(orgId?: string) {
  if (!orgId || orgId === 'all') {
    const { data: orgs } = await supabaseAdmin.from('orgs').select('id');
    return (orgs ?? []).map((org) => org.id);
  }
  return [orgId];
}

export async function handleConnectorJob(job: Job) {
  const { connectorType, orgId, userId } = job.data as {
    connectorType: string;
    orgId?: string;
    userId?: string;
  };

  const types = connectorType === 'all' ? connectorTypes : [connectorType];
  const orgIds = await resolveOrgIds(orgId);

  for (const org of orgIds) {
    for (const type of types) {
      const connector = await getConnector(type, org);

      if (job.name === 'test-connection') {
        const result = await connector.testConnection(org);
        log(result.status === 'ok' ? 'info' : 'warn', 'Connector test', { type, orgId: org, result });
        await supabaseAdmin.from('audit_logs').insert({
          org_id: org,
          actor_user_id: userId ?? null,
          action: 'connector_test',
          entity_type: 'connector',
          entity_id: type,
          meta_json: result
        });
        continue;
      }

      const companies = await connector.syncCompanies(org);
      const rounds = await connector.syncRounds(org);

      log('info', 'Connector sync complete', { type, orgId: org, companies, rounds });
      await supabaseAdmin.from('audit_logs').insert({
        org_id: org,
        actor_user_id: userId ?? null,
        action: 'connector_sync',
        entity_type: 'connector',
        entity_id: type,
        meta_json: { companies, rounds }
      });
    }
  }
}
