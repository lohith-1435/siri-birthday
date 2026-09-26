import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_EMAIL_ITEMS,
  type EmailItem,
  type ReferenceSnapshot
} from './emailTemplates.js';

// Resolve Data Directory safely across Local, Docker, and Vercel Serverless
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const candidateDataDir = path.resolve(__dirname, '../data');
export const DATA_DIR = fs.existsSync(candidateDataDir)
  ? candidateDataDir
  : (process.env.VERCEL ? '/tmp/data' : path.join(process.cwd(), 'data'));

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem in serverless environments
}

export const CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
export const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');
export const TEMPLATES_FILE = path.join(DATA_DIR, 'email_templates.json');
export const SNAPSHOTS_FILE = path.join(DATA_DIR, 'reference_snapshots.json');
export const RECIPIENTS_FILE = path.join(DATA_DIR, 'recipients.json');
export const ACTIVITY_FILE = path.join(DATA_DIR, 'automation_activity.json');
export const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

export type DestinationProfileKey = 'T1' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'TEST_1' | 'SENDER_1' | 'SENDER_2';

export interface DestinationProfile {
  id: DestinationProfileKey;
  label: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
  updatedAt?: string;
}

export interface EmailConfig {
  websiteName: string;
  displayName: string;
  emailDisplayName: string;
  recipientName: string;
  recipientEmail: string;
  autoSendEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  websiteUrl?: string;
  destinations: Record<string, DestinationProfile>;
  testRecipientEmail?: string;
}

export const DEFAULT_PROFILES: Record<string, DestinationProfile> = {
  T1: { id: 'T1', label: 'T1', name: 'T1 (Test Profile)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Test & Verification Destination Profile' },
  S1: { id: 'S1', label: 'S1', name: 'S1 (Primary Sender)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Primary Personal Recipient Profile' },
  S2: { id: 'S2', label: 'S2', name: 'S2 (Secondary Sender)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Secondary Recipient Profile' },
  S3: { id: 'S3', label: 'S3', name: 'S3 (Special Sender 3)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 3' },
  S4: { id: 'S4', label: 'S4', name: 'S4 (Special Sender 4)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 4' },
  S5: { id: 'S5', label: 'S5', name: 'S5 (Special Sender 5)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 5' }
};

export const DEFAULT_CONFIG: EmailConfig = {
  websiteName: 'SIRI',
  displayName: 'SIRI',
  emailDisplayName: 'SIRI BANGARAM',
  recipientName: 'SIRI BANGARAM',
  recipientEmail: 'lohithmedisetti1432004@gmail.com',
  autoSendEnabled: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpUser: 'lohithmedisetti@gmail.com',
  smtpPass: 'ihmu xdbq bccv zjhw',
  fromEmail: 'lohithmedisetti@gmail.com',
  websiteUrl: 'https://siri-birthday-brown.vercel.app/',
  destinations: { ...DEFAULT_PROFILES }
};

export interface AutomationActivity {
  id: string;
  timestamp: string;
  type: 'SCHEDULER_CHECK' | 'EMAIL_DETECTED' | 'SEND_START' | 'SEND_SUCCESS' | 'SEND_FAIL' | 'AUTO_PAUSED' | 'AUTO_RESUMED' | 'ADMIN_ACTION' | 'HEALTH_CHECK';
  message: string;
  details?: unknown;
}

export interface SentLogRecord {
  id: string;
  instanceId?: string;
  originalEmailId?: string;
  emailId: string;
  emailTemplateId?: string;
  name: string;
  type: string;
  subject: string;
  destinationProfile: string;
  destinationLabel: string;
  recipientEmail: string;
  recipient: string;
  emailDisplayName: string;
  scheduledTime?: string;
  sentDate: string;
  sentTime: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
  error?: string;
  messageId?: string;
}

// -------------------------------------------------------------
// SUPABASE CLOUD DATABASE CONNECTION
// -------------------------------------------------------------

function getEnvVar(key: string): string {
  if (process.env[key]) return process.env[key]!;
  if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`]!;
  return '';
}

const supabaseUrl = getEnvVar('SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// In-Memory Fast Cache for serverless performance & cross-request consistency
const memoryCache = {
  config: null as EmailConfig | null,
  items: null as EmailItem[] | null,
  logs: null as SentLogRecord[] | null,
  snapshots: null as Record<string, ReferenceSnapshot> | null,
  activities: null as AutomationActivity[] | null,
  auth: null as { passwordHash?: string; password?: string; updatedAt?: string } | null,
};

// -------------------------------------------------------------
// 1. EMAIL CONFIG PERSISTENCE
// -------------------------------------------------------------

export async function loadEmailConfigAsync(): Promise<EmailConfig> {
  // 1. Try Supabase cloud database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'email_config')
        .maybeSingle();

      if (!error && data?.value) {
        const val = data.value as EmailConfig;
        const destinations = {
          T1: { ...DEFAULT_PROFILES.T1, ...(val.destinations?.T1 || (val.destinations as any)?.TEST_1 || {}) },
          S1: { ...DEFAULT_PROFILES.S1, ...(val.destinations?.S1 || (val.destinations as any)?.SENDER_1 || {}) },
          S2: { ...DEFAULT_PROFILES.S2, ...(val.destinations?.S2 || (val.destinations as any)?.SENDER_2 || {}) },
          S3: { ...DEFAULT_PROFILES.S3, ...(val.destinations?.S3 || {}) },
          S4: { ...DEFAULT_PROFILES.S4, ...(val.destinations?.S4 || {}) },
          S5: { ...DEFAULT_PROFILES.S5, ...(val.destinations?.S5 || {}) }
        };
        const resolved: EmailConfig = { ...DEFAULT_CONFIG, ...val, destinations };
        memoryCache.config = resolved;
        return resolved;
      }
    } catch (err) {
      console.warn('[Storage] Supabase load config failed, using local store:', err);
    }
  }

  // 2. Fallback to memory cache
  if (memoryCache.config) {
    return memoryCache.config;
  }

  // 3. Fallback to local file
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      const destinations = {
        T1: { ...DEFAULT_PROFILES.T1, ...(data.destinations?.T1 || data.destinations?.TEST_1 || {}) },
        S1: { ...DEFAULT_PROFILES.S1, ...(data.destinations?.S1 || data.destinations?.SENDER_1 || {}) },
        S2: { ...DEFAULT_PROFILES.S2, ...(data.destinations?.S2 || data.destinations?.SENDER_2 || {}) },
        S3: { ...DEFAULT_PROFILES.S3, ...(data.destinations?.S3 || {}) },
        S4: { ...DEFAULT_PROFILES.S4, ...(data.destinations?.S4 || {}) },
        S5: { ...DEFAULT_PROFILES.S5, ...(data.destinations?.S5 || {}) }
      };
      const resolved: EmailConfig = { ...DEFAULT_CONFIG, ...data, destinations };
      memoryCache.config = resolved;
      return resolved;
    }
  } catch (err) {
    console.error('[Storage Error] Failed to read email_config.json:', err);
  }

  memoryCache.config = { ...DEFAULT_CONFIG };
  return memoryCache.config;
}

export function loadEmailConfigSync(): EmailConfig {
  if (memoryCache.config) return memoryCache.config;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      const destinations = {
        T1: { ...DEFAULT_PROFILES.T1, ...(data.destinations?.T1 || data.destinations?.TEST_1 || {}) },
        S1: { ...DEFAULT_PROFILES.S1, ...(data.destinations?.S1 || data.destinations?.SENDER_1 || {}) },
        S2: { ...DEFAULT_PROFILES.S2, ...(data.destinations?.S2 || data.destinations?.SENDER_2 || {}) },
        S3: { ...DEFAULT_PROFILES.S3, ...(data.destinations?.S3 || {}) },
        S4: { ...DEFAULT_PROFILES.S4, ...(data.destinations?.S4 || {}) },
        S5: { ...DEFAULT_PROFILES.S5, ...(data.destinations?.S5 || {}) }
      };
      const resolved: EmailConfig = { ...DEFAULT_CONFIG, ...data, destinations };
      memoryCache.config = resolved;
      return resolved;
    }
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export async function saveEmailConfigAsync(config: EmailConfig): Promise<void> {
  memoryCache.config = config;

  // 1. Write to local files
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    const recList = Object.values(config.destinations);
    fs.writeFileSync(RECIPIENTS_FILE, JSON.stringify(recList, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Storage] File write skipped (serverless environment):', err);
  }

  // 2. Write to Supabase cloud database
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'email_config',
        value: config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.error('[Storage] Supabase save config error:', err);
    }
  }
}

// -------------------------------------------------------------
// 2. EMAIL TEMPLATES & SCHEDULED ITEMS PERSISTENCE
// -------------------------------------------------------------

export async function loadEmailDataAsync(): Promise<{ items: EmailItem[] }> {
  // 1. Try Supabase cloud database
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'email_templates')
        .maybeSingle();

      if (!error && data?.value && Array.isArray((data.value as any).items)) {
        const items = (data.value as any).items as EmailItem[];
        if (items.length > 0) {
          memoryCache.items = items;
          return { items };
        }
      }
    } catch (err) {
      console.warn('[Storage] Supabase load templates failed, using local store:', err);
    }
  }

  // 2. Fallback to memory cache
  if (memoryCache.items && memoryCache.items.length > 0) {
    return { items: memoryCache.items };
  }

  // 3. Fallback to local file
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const items: EmailItem[] = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      if (Array.isArray(items) && items.length > 0) {
        memoryCache.items = items;
        return { items };
      }
    }
  } catch (err) {
    console.error('[Storage Error] Failed to read email_templates.json:', err);
  }

  const defaultItems = [...DEFAULT_EMAIL_ITEMS];
  memoryCache.items = defaultItems;
  return { items: defaultItems };
}

export function loadEmailDataSync(): { items: EmailItem[] } {
  if (memoryCache.items && memoryCache.items.length > 0) {
    return { items: memoryCache.items };
  }
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const items: EmailItem[] = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      if (Array.isArray(items) && items.length > 0) {
        memoryCache.items = items;
        return { items };
      }
    }
  } catch {}
  return { items: [...DEFAULT_EMAIL_ITEMS] };
}

export async function saveEmailDataAsync(items: EmailItem[]): Promise<void> {
  memoryCache.items = items;

  // 1. Write to local file
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Storage] File write skipped (serverless environment):', err);
  }

  // 2. Write to Supabase cloud database
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'email_templates',
        value: { items },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.error('[Storage] Supabase save templates error:', err);
    }
  }
}

// -------------------------------------------------------------
// 3. EMAIL SENT LOGS PERSISTENCE
// -------------------------------------------------------------

export async function loadEmailLogsAsync(): Promise<SentLogRecord[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'email_logs')
        .maybeSingle();

      if (!error && data?.value && Array.isArray((data.value as any).logs)) {
        const logs = (data.value as any).logs as SentLogRecord[];
        memoryCache.logs = logs;
        return logs;
      }
    } catch (err) {
      console.warn('[Storage] Supabase load logs failed, using local store:', err);
    }
  }

  if (memoryCache.logs) return memoryCache.logs;

  try {
    if (fs.existsSync(LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
      if (Array.isArray(logs)) {
        memoryCache.logs = logs;
        return logs;
      }
    }
  } catch {}

  memoryCache.logs = [];
  return [];
}

export function loadEmailLogsSync(): SentLogRecord[] {
  if (memoryCache.logs) return memoryCache.logs;
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
      if (Array.isArray(logs)) {
        memoryCache.logs = logs;
        return logs;
      }
    }
  } catch {}
  return [];
}

export async function saveEmailLogsAsync(logs: SentLogRecord[]): Promise<void> {
  memoryCache.logs = logs;

  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Storage] File write skipped (serverless environment):', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'email_logs',
        value: { logs },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.error('[Storage] Supabase save logs error:', err);
    }
  }
}

// -------------------------------------------------------------
// 4. REFERENCE SNAPSHOTS PERSISTENCE
// -------------------------------------------------------------

export async function loadSnapshotsAsync(): Promise<Record<string, ReferenceSnapshot>> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'reference_snapshots')
        .maybeSingle();

      if (!error && data?.value && typeof (data.value as any).snapshots === 'object') {
        const snapshots = (data.value as any).snapshots as Record<string, ReferenceSnapshot>;
        memoryCache.snapshots = snapshots;
        return snapshots;
      }
    } catch (err) {
      console.warn('[Storage] Supabase load snapshots failed, using local store:', err);
    }
  }

  if (memoryCache.snapshots) return memoryCache.snapshots;

  try {
    if (fs.existsSync(SNAPSHOTS_FILE)) {
      const snapshots = JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, 'utf8'));
      memoryCache.snapshots = snapshots;
      return snapshots;
    }
  } catch {}

  memoryCache.snapshots = {};
  return {};
}

export function loadSnapshotsSync(): Record<string, ReferenceSnapshot> {
  if (memoryCache.snapshots) return memoryCache.snapshots;
  try {
    if (fs.existsSync(SNAPSHOTS_FILE)) {
      const snapshots = JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, 'utf8'));
      memoryCache.snapshots = snapshots;
      return snapshots;
    }
  } catch {}
  return {};
}

export async function saveSnapshotsAsync(snapshots: Record<string, ReferenceSnapshot>): Promise<void> {
  memoryCache.snapshots = snapshots;

  try {
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Storage] File write skipped (serverless environment):', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'reference_snapshots',
        value: { snapshots },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.error('[Storage] Supabase save snapshots error:', err);
    }
  }
}

// -------------------------------------------------------------
// 5. AUTOMATION ACTIVITY PERSISTENCE
// -------------------------------------------------------------

export async function loadAutomationActivityAsync(): Promise<AutomationActivity[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'automation_activity')
        .maybeSingle();

      if (!error && data?.value && Array.isArray((data.value as any).activities)) {
        const activities = (data.value as any).activities as AutomationActivity[];
        memoryCache.activities = activities;
        return activities;
      }
    } catch (err) {
      console.warn('[Storage] Supabase load activity failed, using local store:', err);
    }
  }

  if (memoryCache.activities) return memoryCache.activities;

  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
      if (Array.isArray(activities)) {
        memoryCache.activities = activities;
        return activities;
      }
    }
  } catch {}

  memoryCache.activities = [];
  return [];
}

export function loadAutomationActivitySync(): AutomationActivity[] {
  if (memoryCache.activities) return memoryCache.activities;
  try {
    if (fs.existsSync(ACTIVITY_FILE)) {
      const activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
      if (Array.isArray(activities)) {
        memoryCache.activities = activities;
        return activities;
      }
    }
  } catch {}
  return [];
}

export async function recordAutomationActivityAsync(
  type: AutomationActivity['type'],
  message: string,
  details?: unknown
): Promise<void> {
  const activities = await loadAutomationActivityAsync();
  const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  activities.unshift({
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: istTime,
    type,
    message,
    details
  });

  if (activities.length > 200) activities.splice(200);
  memoryCache.activities = activities;

  try {
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Storage] File write skipped (serverless environment):', err);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'automation_activity',
        value: { activities },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    } catch (err) {
      console.error('[Storage] Supabase save activity error:', err);
    }
  }
}
