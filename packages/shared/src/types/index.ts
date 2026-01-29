export type Role = 'admin' | 'partner' | 'analyst' | 'viewer';

export interface Org {
  id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  org_id: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Settings {
  org_id: string;
  branding_json: Record<string, unknown> | null;
  feature_flags_json: Record<string, unknown> | null;
  updated_at: string;
}

export interface Company {
  id: string;
  org_id: string;
  name: string;
  domain: string | null;
  sector: string | null;
  stage: string | null;
  geo: string | null;
  status: string | null;
  created_at: string;
}

export interface CompanyMetric {
  id: string;
  company_id: string;
  date: string;
  metric_key: string;
  metric_value: number;
  source: string | null;
  created_at: string;
}

export interface FundingRound {
  id: string;
  company_id: string;
  round_type: string | null;
  amount: number | null;
  announced_at: string | null;
  source: string | null;
  created_at: string;
}

export interface ThesisDoc {
  id: string;
  org_id: string;
  title: string;
  tags: string[] | null;
  storage_path: string | null;
  source_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface NewsItem {
  id: string;
  org_id: string;
  title: string;
  url: string;
  source: string | null;
  published_at: string | null;
  summary: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface ConnectorSecret {
  id: string;
  org_id: string;
  connector_type: string;
  encrypted_secret_blob: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  meta_json: Record<string, unknown> | null;
  created_at: string;
}

export interface SectorBenchmark {
  id: string;
  org_id: string;
  sector: string;
  metric_key: string;
  metric_value: number;
  created_at: string;
}

export interface CompanyNote {
  id: string;
  company_id: string;
  org_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
}

export interface DealflowSubmission {
  id: string;
  org_id: string;
  company_name: string;
  founder_name: string | null;
  contact_email: string | null;
  sector: string | null;
  stage: string | null;
  notes: string | null;
  score: number | null;
  created_at: string;
}
