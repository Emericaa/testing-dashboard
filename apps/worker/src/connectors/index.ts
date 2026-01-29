import { supabaseAdmin } from '../services/supabase';
import { decryptSecret } from '@vc/shared/src/utils/encryption';
import { CrunchbaseConnector } from './CrunchbaseConnector';
import { PitchBookConnector } from './PitchBookConnector';
import { SpectreConnector } from './SpectreConnector';
import type { Connector } from './Connector';

const encryptionKey = process.env.APP_ENCRYPTION_KEY || '';

async function getSecret(orgId: string, connectorType: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('connector_secrets')
    .select('encrypted_secret_blob')
    .eq('org_id', orgId)
    .eq('connector_type', connectorType)
    .single();
  if (error || !data?.encrypted_secret_blob) return null;
  if (!encryptionKey) return null;
  try {
    return decryptSecret(data.encrypted_secret_blob, encryptionKey);
  } catch {
    return null;
  }
}

export async function getConnector(connectorType: string, orgId: string): Promise<Connector> {
  const secret = await getSecret(orgId, connectorType);
  switch (connectorType) {
    case 'crunchbase':
      return new CrunchbaseConnector(secret);
    case 'pitchbook':
      return new PitchBookConnector(secret);
    case 'spectre':
    default:
      return new SpectreConnector(secret);
  }
}

export const connectorTypes = ['crunchbase', 'pitchbook', 'spectre'];
