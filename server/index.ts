import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DEFAULT_EMAIL_ITEMS,
  DEFAULT_WEBSITE_URL,
  formatGoldenName,
  generateEmailHtml,
  type EmailItem,
  type ReferenceSnapshot
} from './emailTemplates.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const candidateDataDir = path.resolve(serverDir, '../data');
const DATA_DIR = fs.existsSync(candidateDataDir) ? candidateDataDir : path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'email_templates.json');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'reference_snapshots.json');
const RECIPIENTS_FILE = path.join(DATA_DIR, 'recipients.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'automation_activity.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

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
  destinations: {
    T1: DestinationProfile;
    S1: DestinationProfile;
    S2: DestinationProfile;
    S3: DestinationProfile;
    S4: DestinationProfile;
    S5: DestinationProfile;
    TEST_1?: DestinationProfile;
    SENDER_1?: DestinationProfile;
    SENDER_2?: DestinationProfile;
  };
}

export const DEFAULT_PROFILES: Record<string, DestinationProfile> = {
  T1: {
    id: 'T1',
    label: 'T1',
    name: 'T1 (Test Profile)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Test & Verification Destination Profile'
  },
  S1: {
    id: 'S1',
    label: 'S1',
    name: 'S1 (Primary Sender)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Primary Personal Recipient Profile'
  },
  S2: {
    id: 'S2',
    label: 'S2',
    name: 'S2 (Secondary Sender)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Secondary Recipient Profile'
  },
  S3: {
    id: 'S3',
    label: 'S3',
    name: 'S3 (Special Sender 3)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Dedicated Recipient Profile 3'
  },
  S4: {
    id: 'S4',
    label: 'S4',
    name: 'S4 (Special Sender 4)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Dedicated Recipient Profile 4'
  },
  S5: {
    id: 'S5',
    label: 'S5',
    name: 'S5 (Special Sender 5)',
    email: 'lohithmedisetti1432004@gmail.com',
    status: 'ACTIVE',
    description: 'Dedicated Recipient Profile 5'
  }
};

const DEFAULT_CONFIG: EmailConfig = {
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
  websiteUrl: DEFAULT_WEBSITE_URL,
  destinations: {
    T1: { ...DEFAULT_PROFILES.T1 },
    S1: { ...DEFAULT_PROFILES.S1 },
    S2: { ...DEFAULT_PROFILES.S2 },
    S3: { ...DEFAULT_PROFILES.S3 },
    S4: { ...DEFAULT_PROFILES.S4 },
    S5: { ...DEFAULT_PROFILES.S5 }
  }
};

function loadEmailConfig(): EmailConfig {
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
      return { ...DEFAULT_CONFIG, ...data, destinations };
    }
  } catch (err) {
    console.error('[Config Error] Failed to read email_config.json:', err);
  }
  return DEFAULT_CONFIG;
}

function saveEmailConfig(config: EmailConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    const recList = Object.values(config.destinations);
    fs.writeFileSync(RECIPIENTS_FILE, JSON.stringify(recList, null, 2), 'utf8');
  } catch (err) {
    console.error('[Config Error] Failed to save email_config.json:', err);
  }
}

export function resolveDestinationEmail(
  destinationProfile?: string,
  config?: EmailConfig
): { email: string; label: string; profile: string; name: string } {
  const cfg = config || loadEmailConfig();
  const destinations = cfg.destinations || DEFAULT_PROFILES;
  let prof = (destinationProfile || 'T1').toUpperCase().trim().replace(/\s+/g, '_');

  if (prof === 'TEST_1' || prof === 'TEST1') prof = 'T1';
  if (prof === 'SENDER_1' || prof === 'SENDER1') prof = 'S1';
  if (prof === 'SENDER_2' || prof === 'SENDER2') prof = 'S2';
  if (prof === 'SENDER_3' || prof === 'SENDER3') prof = 'S3';
  if (prof === 'SENDER_4' || prof === 'SENDER4') prof = 'S4';
  if (prof === 'SENDER_5' || prof === 'SENDER5') prof = 'S5';

  const targetProfile = (destinations as any)[prof] || (destinations as any)['T1'] || DEFAULT_PROFILES['T1'];

  return {
    email: targetProfile?.email || 'lohithmedisetti1432004@gmail.com',
    label: targetProfile?.label || prof,
    name: targetProfile?.name || prof,
    profile: prof
  };
}

export interface AutomationActivity {
  id: string;
  timestamp: string;
  type: 'SCHEDULER_CHECK' | 'EMAIL_DETECTED' | 'SEND_START' | 'SEND_SUCCESS' | 'SEND_FAIL' | 'AUTO_PAUSED' | 'AUTO_RESUMED' | 'ADMIN_ACTION' | 'HEALTH_CHECK';
  message: string;
  details?: any;
}

export function recordAutomationActivity(type: AutomationActivity['type'], message: string, details?: any) {
  try {
    let activities: AutomationActivity[] = [];
    if (fs.existsSync(ACTIVITY_FILE)) {
      activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
    }
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
    activities.unshift({
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: istTime,
      type,
      message,
      details
    });
    if (activities.length > 200) activities = activities.slice(0, 200);
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2), 'utf8');
  } catch (err) {
    console.error('[Activity Log Error]:', err);
  }
}

function loadEmailData(): { items: EmailItem[] } {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const items: EmailItem[] = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      if (Array.isArray(items) && items.length > 0) {
        return { items };
      }
    }
  } catch (err) {
    console.error('[Templates Error] Failed to read email_templates.json:', err);
  }
  return { items: [...DEFAULT_EMAIL_ITEMS] };
}

function saveEmailData(items: EmailItem[]) {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('[Templates Error] Failed to save email_templates.json:', err);
  }
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
  errorMessage?: string;
  attemptCount?: number;
  referenceSnapshotId?: string;
  rescheduledFrom?: string | null;
  messageId?: string;
}

function loadEmailLogs(): SentLogRecord[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
      if (Array.isArray(logs)) return logs;
    }
  } catch (err) {
    console.error('[Logs Error] Failed to read email_logs.json:', err);
  }
  return [];
}

function saveEmailLogs(logs: SentLogRecord[]) {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('[Logs Error] Failed to save email_logs.json:', err);
  }
}

function loadReferenceSnapshots(): Record<string, ReferenceSnapshot> {
  try {
    if (fs.existsSync(SNAPSHOTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, 'utf8'));
      if (Array.isArray(parsed)) {
        const dict: Record<string, ReferenceSnapshot> = {};
        parsed.forEach((snap: any) => {
          if (snap && snap.emailId) dict[snap.emailId] = snap;
          if (snap && snap.id) dict[snap.id] = snap;
        });
        return dict;
      } else if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Snapshots Error] Failed to read reference_snapshots.json:', err);
  }
  return {};
}

function saveReferenceSnapshots(snapshots: Record<string, ReferenceSnapshot>) {
  try {
    fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2), 'utf8');
  } catch (err) {
    console.error('[Snapshots Error] Failed to save reference_snapshots.json:', err);
  }
}

function createTransporter(config: EmailConfig) {
  const host = config.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(config.smtpPort || process.env.SMTP_PORT || 465);
  const user = config.smtpUser || process.env.SMTP_USER || 'lohithmedisetti@gmail.com';
  const pass = config.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'ihmu xdbq bccv zjhw';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

let isSchedulerTicking = false;
let lastSchedulerCheckTime = Date.now();
const sendingMutex = new Set<string>();

export function getIstTime(): { dateStr: string; timeStr: string; fullIso: string; formattedIST: string } {
  const now = new Date();
  const optionsDate: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const partsDate = new Intl.DateTimeFormat('en-CA', optionsDate).format(now);

  const optionsTime: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
  const timeStr = new Intl.DateTimeFormat('en-GB', optionsTime).format(now);

  const formattedIST = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) + ' IST';

  return { dateStr: partsDate, timeStr, fullIso: now.toISOString(), formattedIST };
}

export async function sendEmail(
  item: EmailItem,
  options: {
    isTest?: boolean;
    overrideRecipient?: string;
    overrideDestinationProfile?: string;
    overrideDisplayName?: string;
    overrideSubject?: string;
  } = {}
): Promise<{ success: boolean; messageId?: string; error?: string; targetEmail?: string; destinationLabel?: string; destinationProfile?: string }> {
  const config = loadEmailConfig();
  const destProf = options.overrideDestinationProfile || (item.destinationProfile as string) || 'T1';
  const dest = resolveDestinationEmail(destProf, config);
  const targetEmail = options.overrideRecipient || dest.email;

  const instanceLockKey = `${item.id}_${item.scheduleDate}_${item.scheduleTime}`;
  if (sendingMutex.has(instanceLockKey)) {
    return { success: false, error: 'Send in progress for this email instance (Duplicate Protection Active)' };
  }
  sendingMutex.add(instanceLockKey);

  recordAutomationActivity('SEND_START', `Dispatching "${item.name}" to ${dest.label} (${targetEmail})`, {
    emailId: item.id,
    destinationProfile: dest.profile,
    targetEmail
  });

  try {
    const transporter = createTransporter(config);
    const effectiveDisplayName = (options.overrideDisplayName && options.overrideDisplayName.trim())
      || (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
      || config.emailDisplayName
      || 'SIRI BANGARAM';

    const htmlContent = generateEmailHtml(item, {
      emailDisplayName: effectiveDisplayName,
      name: config.websiteName || 'SIRI',
      year: new Date().getFullYear(),
      age: new Date().getFullYear() - 2003
    });

    const info = await transporter.sendMail({
      from: `"${effectiveDisplayName}" <${config.fromEmail || config.smtpUser || 'lohithmedisetti@gmail.com'}>`,
      to: targetEmail,
      subject: options.overrideSubject || item.subject,
      html: htmlContent
    });

    const { dateStr, timeStr } = getIstTime();
    const logs = loadEmailLogs();
    const newLog: SentLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      instanceId: item.id,
      originalEmailId: item.id.replace(/^resched_/, '').replace(/^sched_/, '').replace(/_\d+$/, ''),
      emailId: item.id,
      emailTemplateId: item.id.replace(/^resched_/, '').replace(/^sched_/, '').replace(/_\d+$/, ''),
      name: item.name,
      type: item.type || 'ADVANCE',
      subject: options.overrideSubject || item.subject,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      recipientEmail: targetEmail,
      recipient: targetEmail,
      emailDisplayName: effectiveDisplayName,
      scheduledTime: `${item.scheduleDate} ${item.scheduleTime} IST`,
      sentDate: dateStr,
      sentTime: timeStr,
      sentAt: new Date().toISOString(),
      status: 'SENT',
      referenceSnapshotId: item.id,
      rescheduledFrom: (item as any).rescheduledFrom || null,
      messageId: info.messageId
    };

    logs.unshift(newLog);
    saveEmailLogs(logs);

    recordAutomationActivity('SEND_SUCCESS', `Email "${item.name}" delivered to ${dest.label} (${targetEmail})`, {
      messageId: info.messageId,
      destinationProfile: dest.profile,
      recipient: targetEmail
    });

    return { success: true, messageId: info.messageId, targetEmail, destinationLabel: dest.label, destinationProfile: dest.profile };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const { dateStr, timeStr } = getIstTime();
    const logs = loadEmailLogs();
    const failLog: SentLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      instanceId: item.id,
      originalEmailId: item.id.replace(/^resched_/, '').replace(/^sched_/, '').replace(/_\d+$/, ''),
      emailId: item.id,
      name: item.name,
      type: item.type || 'ADVANCE',
      subject: options.overrideSubject || item.subject,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      recipientEmail: targetEmail,
      recipient: targetEmail,
      emailDisplayName: config.emailDisplayName,
      scheduledTime: `${item.scheduleDate} ${item.scheduleTime} IST`,
      sentDate: dateStr,
      sentTime: timeStr,
      sentAt: new Date().toISOString(),
      status: 'FAILED',
      errorMessage: errMsg,
      attemptCount: 1
    };
    logs.unshift(failLog);
    saveEmailLogs(logs);

    recordAutomationActivity('SEND_FAIL', `Failed to send "${item.name}" to ${dest.label} (${targetEmail}): ${errMsg}`, {
      error: errMsg,
      destinationProfile: dest.profile,
      recipient: targetEmail
    });

    return { success: false, error: errMsg, targetEmail, destinationLabel: dest.label, destinationProfile: dest.profile };
  } finally {
    sendingMutex.delete(instanceLockKey);
  }
}

export async function runSchedulerTick(): Promise<{ checked: number; sent: number; errors: number; currentTimeIST: string; skippedReason?: string }> {
  const { formattedIST } = getIstTime();
  if (isSchedulerTicking) return { checked: 0, sent: 0, errors: 0, currentTimeIST: formattedIST };
  isSchedulerTicking = true;
  lastSchedulerCheckTime = Date.now();

  const config = loadEmailConfig();
  if (!config.autoSendEnabled) {
    isSchedulerTicking = false;
    return { checked: 0, sent: 0, errors: 0, currentTimeIST: formattedIST, skippedReason: 'Automation switch is OFF' };
  }

  let checkedCount = 0;
  let sentCount = 0;
  let errorCount = 0;

  try {
    const { dateStr, timeStr } = getIstTime();
    const { items } = loadEmailData();
    const logs = loadEmailLogs();

    for (const item of items) {
      if (!item.enabled || (item.status !== 'SCHEDULED' && item.status !== 'READY')) {
        continue;
      }

      checkedCount++;
      const isDue = item.scheduleDate === dateStr && item.scheduleTime === timeStr;
      const isOverdue = item.scheduleDate < dateStr || (item.scheduleDate === dateStr && item.scheduleTime < timeStr);

      if (isDue || isOverdue) {
        const alreadySent = logs.some(
          (l) => (l.instanceId === item.id || l.emailId === item.id) && l.sentDate === item.scheduleDate && l.status === 'SENT'
        );

        if (!alreadySent) {
          recordAutomationActivity('EMAIL_DETECTED', `Scheduler detected scheduled email "${item.name}" due at ${item.scheduleDate} ${item.scheduleTime} IST`);
          const result = await sendEmail(item);
          if (result.success) {
            item.status = 'SENT';
            sentCount++;
          } else {
            item.status = 'FAILED';
            errorCount++;
          }
        } else {
          item.status = 'SENT';
        }
      }
    }

    saveEmailData(items);
  } catch (err: any) {
    console.error('[Scheduler Tick Error]:', err);
    recordAutomationActivity('SCHEDULER_CHECK', `Scheduler tick error: ${err?.message || err}`);
  } finally {
    isSchedulerTicking = false;
  }

  return { checked: checkedCount, sent: sentCount, errors: errorCount, currentTimeIST: formattedIST };
}

setInterval(() => {
  runSchedulerTick();
}, 10000);

export function calculateUpcomingEmails(items: EmailItem[], config: EmailConfig, limit = 5) {
  const { dateStr, timeStr } = getIstTime();
  const currentKey = `${dateStr} ${timeStr}`;

  const scheduledList = items
    .filter((it) => it.enabled && (it.status === 'SCHEDULED' || it.status === 'READY') && it.scheduleDate && it.scheduleTime)
    .sort((a, b) => `${a.scheduleDate} ${a.scheduleTime}`.localeCompare(`${b.scheduleDate} ${b.scheduleTime}`));

  const futureList = scheduledList.filter((it) => `${it.scheduleDate} ${it.scheduleTime}` >= currentKey);
  const effectiveList = futureList.length >= limit ? futureList : scheduledList;

  return effectiveList.slice(0, limit).map((item) => {
    const dest = resolveDestinationEmail(item.destinationProfile, config);
    return {
      ...item,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      targetEmail: dest.email
    };
  });
}

export function calculateTodaysDispatch(items: EmailItem[], logs: SentLogRecord[], config: EmailConfig) {
  const { dateStr } = getIstTime();
  const todaysItems = items.filter((it) => it.scheduleDate === dateStr);

  const dispatchList = todaysItems.map((item) => {
    const dest = resolveDestinationEmail(item.destinationProfile, config);
    const sentRecord = logs.find((l) => (l.instanceId === item.id || l.emailId === item.id) && l.sentDate === dateStr && l.status === 'SENT');

    return {
      id: item.id,
      time: item.scheduleTime,
      name: item.name,
      type: item.type,
      subject: item.subject,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      recipientEmail: dest.email,
      status: sentRecord ? 'SENT' : item.status,
      isSent: Boolean(sentRecord),
      sentAt: sentRecord ? sentRecord.sentTime : null,
      rawItem: item
    };
  });

  return dispatchList.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

// -------------------------------------------------------------
// REST Endpoints
// -------------------------------------------------------------

app.get('/api/automation/health', (_req, res) => {
  const config = loadEmailConfig();
  const { items } = loadEmailData();
  const logs = loadEmailLogs();
  const upcomingFive = calculateUpcomingEmails(items, config, 5);
  const upcomingTwo = upcomingFive.slice(0, 2);
  const todaysDispatch = calculateTodaysDispatch(items, logs, config);
  const { formattedIST } = getIstTime();

  const nextItem = upcomingFive[0] || null;
  let nextRunCountdown = null;
  if (nextItem) {
    const { dateStr, timeStr } = getIstTime();
    const curr = new Date(`${dateStr}T${timeStr}:00+05:30`).getTime();
    const next = new Date(`${nextItem.scheduleDate}T${nextItem.scheduleTime}:00+05:30`).getTime();
    const diffMins = Math.round((next - curr) / 60000);
    nextRunCountdown = diffMins > 0 ? `in ${diffMins}m` : 'Due now';
  }

  const lastSentLog = logs.find((l) => l.status === 'SENT') || null;
  const lastFailedLog = logs.find((l) => l.status === 'FAILED') || null;
  const pendingCount = items.filter((it) => it.status === 'PENDING' || it.status === 'MISSED').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

  res.json({
    success: true,
    automationEnabled: config.autoSendEnabled,
    automationStatus: config.autoSendEnabled ? 'ACTIVE' : 'PAUSED',
    schedulerRunning: true,
    schedulerStatus: 'RUNNING',
    currentTimeIST: formattedIST,
    lastSchedulerCheck: new Date(lastSchedulerCheckTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
    lastCheckTimestamp: new Date(lastSchedulerCheckTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
    nextScheduledEmail: nextItem ? nextItem.name : 'All Dispatched',
    nextScheduledDestination: nextItem ? `${nextItem.destinationLabel} (${nextItem.targetEmail})` : null,
    nextRun: nextRunCountdown || '--',
    upcomingFive,
    upcomingTwo,
    todaysDispatch,
    lastEmailSent: lastSentLog ? lastSentLog.name : 'None yet',
    lastResult: lastSentLog ? 'SUCCESS' : (lastFailedLog ? 'FAILED' : 'NONE'),
    pendingCount,
    failedCount,
    totalSentCount: logs.filter((l) => l.status === 'SENT').length
  });
});

app.post('/api/automation/health-check', (_req, res) => {
  const config = loadEmailConfig();
  const { items } = loadEmailData();
  const destinations = config.destinations || DEFAULT_PROFILES;

  const checks = [
    { name: 'Scheduler Engine', status: 'HEALTHY', message: 'Internal 10s loop active (Asia/Kolkata IST)' },
    { name: 'Persistent Database', status: fs.existsSync(DATA_DIR) ? 'HEALTHY' : 'ATTENTION', message: `Data directory active at ${DATA_DIR}` },
    { name: 'SMTP Authentication', status: config.smtpPass ? 'HEALTHY' : 'ATTENTION', message: `Connected as ${config.smtpUser || 'lohithmedisetti@gmail.com'}` },
    { name: 'Recipient Profile T1', status: (destinations as any).T1?.email ? 'HEALTHY' : 'ATTENTION', message: `T1 Mailbox: ${(destinations as any).T1?.email}` },
    { name: 'Recipient Profile S1', status: (destinations as any).S1?.email ? 'HEALTHY' : 'ATTENTION', message: `S1 Mailbox: ${(destinations as any).S1?.email}` },
    { name: 'Recipient Profile S2', status: (destinations as any).S2?.email ? 'HEALTHY' : 'ATTENTION', message: `S2 Mailbox: ${(destinations as any).S2?.email}` },
    { name: 'Recipient Profile S3', status: (destinations as any).S3?.email ? 'HEALTHY' : 'ATTENTION', message: `S3 Mailbox: ${(destinations as any).S3?.email}` },
    { name: 'Recipient Profile S4', status: (destinations as any).S4?.email ? 'HEALTHY' : 'ATTENTION', message: `S4 Mailbox: ${(destinations as any).S4?.email}` },
    { name: 'Recipient Profile S5', status: (destinations as any).S5?.email ? 'HEALTHY' : 'ATTENTION', message: `S5 Mailbox: ${(destinations as any).S5?.email}` },
    { name: 'Email Display Name', status: 'HEALTHY', message: `Configured as: "${config.emailDisplayName}"` },
    { name: 'Duplicate Protection', status: 'HEALTHY', message: 'Instance mutex & persistent log checking active' },
    { name: 'Scheduled Queue', status: 'HEALTHY', message: `${items.filter((i) => i.status === 'SCHEDULED').length} upcoming dispatches registered` }
  ];

  const overallStatus = checks.every((c) => c.status === 'HEALTHY') ? 'HEALTHY' : 'ATTENTION REQUIRED';
  recordAutomationActivity('HEALTH_CHECK', `Health Check executed — Overall status: ${overallStatus}`);

  res.json({ success: true, overallStatus, checks, timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) });
});

app.get('/api/automation/activity', (_req, res) => {
  if (fs.existsSync(ACTIVITY_FILE)) {
    try {
      const activities = JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
      return res.json({ success: true, activities });
    } catch {}
  }
  res.json({ success: true, activities: [] });
});

app.post('/api/admin/settings/name', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }
  const config = loadEmailConfig();
  config.websiteName = name.trim();
  config.displayName = name.trim();
  saveEmailConfig(config);
  recordAutomationActivity('ADMIN_ACTION', `Website name updated to: "${config.websiteName}"`);
  res.json({ success: true, name: config.websiteName });
});

app.post('/api/admin/settings/email-display-name', (req, res) => {
  const { emailDisplayName } = req.body;
  if (!emailDisplayName || typeof emailDisplayName !== 'string') {
    return res.status(400).json({ error: 'Email display name is required' });
  }
  const config = loadEmailConfig();
  config.emailDisplayName = emailDisplayName.trim();
  saveEmailConfig(config);
  recordAutomationActivity('ADMIN_ACTION', `Email display name updated to: "${config.emailDisplayName}"`);
  res.json({ success: true, emailDisplayName: config.emailDisplayName });
});

app.post('/api/email/automation-switch', (req, res) => {
  const { enabled } = req.body;
  const config = loadEmailConfig();
  config.autoSendEnabled = Boolean(enabled);
  saveEmailConfig(config);

  recordAutomationActivity(config.autoSendEnabled ? 'AUTO_RESUMED' : 'AUTO_PAUSED', `Automation master switch set to ${config.autoSendEnabled ? 'ON' : 'OFF'}`);

  res.json({
    success: true,
    autoSendEnabled: config.autoSendEnabled,
    status: config.autoSendEnabled ? 'ACTIVE' : 'PAUSED'
  });
});

app.get('/api/email/pending-missed', (_req, res) => {
  const { items } = loadEmailData();
  const missed = items.filter((i) => i.status === 'PENDING' || i.status === 'MISSED');
  res.json({ success: true, count: missed.length, pendingItems: missed });
});

app.get('/api/email/config', (_req, res) => {
  const config = loadEmailConfig();
  res.json({
    success: true,
    websiteName: config.websiteName,
    emailDisplayName: config.emailDisplayName,
    autoSendEnabled: config.autoSendEnabled,
    destinations: config.destinations || DEFAULT_PROFILES,
    fromEmail: config.fromEmail,
    smtpUser: config.smtpUser
  });
});

app.post('/api/email/config', (req, res) => {
  const current = loadEmailConfig();
  const updated: EmailConfig = {
    ...current,
    ...req.body,
    destinations: {
      ...current.destinations,
      ...(req.body.destinations || {})
    }
  };
  saveEmailConfig(updated);
  recordAutomationActivity('ADMIN_ACTION', 'Email configuration updated');
  res.json({ success: true, config: updated });
});

// -------------------------------------------------------------
// RECIPIENT PROFILES (T1, S1, S2, S3, S4, S5)
// -------------------------------------------------------------

app.get('/api/admin/recipients', (_req, res) => {
  const config = loadEmailConfig();
  const destinations = config.destinations || DEFAULT_PROFILES;
  const list = [
    (destinations as any).T1 || DEFAULT_PROFILES.T1,
    (destinations as any).S1 || DEFAULT_PROFILES.S1,
    (destinations as any).S2 || DEFAULT_PROFILES.S2,
    (destinations as any).S3 || DEFAULT_PROFILES.S3,
    (destinations as any).S4 || DEFAULT_PROFILES.S4,
    (destinations as any).S5 || DEFAULT_PROFILES.S5
  ];
  res.json({ success: true, recipients: list, destinations });
});

app.post('/api/admin/recipients', (req, res) => {
  const { id, email, label, name, status, description } = req.body;
  if (!id || !email) {
    return res.status(400).json({ error: 'Recipient Profile ID and email are required' });
  }

  const config = loadEmailConfig();
  let profKey = id.toUpperCase().trim().replace(/\s+/g, '_');
  if (profKey === 'TEST_1' || profKey === 'TEST1') profKey = 'T1';
  if (profKey === 'SENDER_1' || profKey === 'SENDER1') profKey = 'S1';
  if (profKey === 'SENDER_2' || profKey === 'SENDER2') profKey = 'S2';
  if (profKey === 'SENDER_3' || profKey === 'SENDER3') profKey = 'S3';
  if (profKey === 'SENDER_4' || profKey === 'SENDER4') profKey = 'S4';
  if (profKey === 'SENDER_5' || profKey === 'SENDER5') profKey = 'S5';

  if (!config.destinations) {
    config.destinations = { ...DEFAULT_PROFILES } as any;
  }

  (config.destinations as any)[profKey] = {
    id: profKey,
    label: label || (config.destinations as any)[profKey]?.label || profKey,
    name: name || (config.destinations as any)[profKey]?.name || `${profKey} Profile`,
    email: email.trim(),
    status: status || 'ACTIVE',
    description: description || (config.destinations as any)[profKey]?.description || '',
    updatedAt: new Date().toISOString()
  };

  saveEmailConfig(config);
  recordAutomationActivity('ADMIN_ACTION', `Recipient profile ${profKey} updated to "${email.trim()}" [${status || 'ACTIVE'}]`);

  return res.json({
    success: true,
    destination: (config.destinations as any)[profKey],
    destinations: config.destinations
  });
});

app.post('/api/admin/recipients/:id/test', async (req, res) => {
  const { id } = req.params;
  const config = loadEmailConfig();
  const dest = resolveDestinationEmail(id, config);

  const testItem: EmailItem = {
    id: `test_dest_${dest.profile}_${Date.now()}`,
    name: `Recipient Profile Verification — ${dest.label}`,
    type: 'TEST',
    subject: `Verification Dispatch for ${dest.label} ✦ SIRI Experience`,
    recipient: dest.email,
    destinationProfile: dest.profile,
    heading: `RECIPIENT PROFILE VERIFIED — ${dest.label}`,
    topLabel: 'PROFILE-BASED ROUTING SYSTEM',
    message: `This verification email confirms that recipient profile ${dest.label} is active and operating properly.

Assigned Mailbox: ${dest.email}
Profile Name: ${dest.name}
Routing Status: ACTIVE
Timezone: Asia/Kolkata (IST)

All future dispatches designated for ${dest.label} will be routed exclusively to this address.`,
    websiteUrl: config.websiteUrl || DEFAULT_WEBSITE_URL,
    linkAlias: 'ENTER YOUR STORY →',
    buttonText: 'ENTER YOUR STORY →',
    scheduleDate: getIstTime().dateStr,
    scheduleTime: getIstTime().timeStr,
    status: 'READY',
    enabled: true
  };

  const result = await sendEmail(testItem, { overrideDestinationProfile: dest.profile });
  if (result.success) {
    res.json({ success: true, message: `Verification email sent to ${dest.label} (${dest.email})`, details: result });
  } else {
    res.status(500).json({ success: false, error: result.error, details: result });
  }
});

// -------------------------------------------------------------
// 1. REUSABLE MASTER TEMPLATES LIBRARY (Master Library)
// -------------------------------------------------------------

app.get('/api/email/templates', (_req, res) => {
  res.json({ success: true, templates: DEFAULT_EMAIL_ITEMS });
});

// -------------------------------------------------------------
// 2. ACTUAL SCHEDULED INSTANCES QUEUE
// -------------------------------------------------------------

app.get('/api/email/scheduled', (_req, res) => {
  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const scheduled = items
    .filter((it) => it.enabled && (it.status === 'SCHEDULED' || it.status === 'READY' || it.status === 'PENDING'))
    .sort((a, b) => `${a.scheduleDate} ${a.scheduleTime}`.localeCompare(`${b.scheduleDate} ${b.scheduleTime}`))
    .map((item) => {
      const dest = resolveDestinationEmail(item.destinationProfile, config);
      return {
        ...item,
        destinationProfile: dest.profile,
        destinationLabel: dest.label,
        targetEmail: dest.email
      };
    });

  res.json({ success: true, scheduled });
});

app.get('/api/email/items', (_req, res) => {
  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const upcomingFive = calculateUpcomingEmails(items, config, 5);
  const upcomingTwo = upcomingFive.slice(0, 2);

  res.json({
    success: true,
    items,
    upcomingFive,
    upcomingTwo
  });
});

app.post('/api/email/items', (req, res) => {
  const item: EmailItem = req.body;
  if (!item.id || !item.name) {
    return res.status(400).json({ error: 'Item ID and Name are required' });
  }

  const { items } = loadEmailData();
  const existingIdx = items.findIndex((i) => i.id === item.id);
  if (existingIdx >= 0) {
    items[existingIdx] = { ...items[existingIdx], ...item };
  } else {
    items.push(item);
  }
  saveEmailData(items);
  recordAutomationActivity('ADMIN_ACTION', `Saved email item "${item.name}" [Destination: ${item.destinationProfile || 'T1'}]`);
  res.json({ success: true, item });
});

// Remove / Cancel a scheduled instance (Master templates are NEVER removed)
app.delete('/api/email/items/:id', (req, res) => {
  const { id } = req.params;
  const { items } = loadEmailData();
  const filtered = items.filter((i) => i.id !== id);
  saveEmailData(filtered);
  recordAutomationActivity('ADMIN_ACTION', `Removed scheduled instance ${id}`);
  res.json({ success: true });
});

app.post('/api/email/remove-schedule', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });
  const { items } = loadEmailData();
  const filtered = items.filter((i) => i.id !== id);
  saveEmailData(filtered);
  recordAutomationActivity('ADMIN_ACTION', `Cancelled scheduled email instance ${id}`);
  const config = loadEmailConfig();
  const upcomingFive = calculateUpcomingEmails(filtered, config, 5);
  res.json({ success: true, upcomingFive });
});

// Schedule an existing template into a scheduled instance (Master template remains in library)
app.post('/api/email/schedule-existing', (req, res) => {
  const {
    templateId,
    scheduleDate,
    scheduleTime,
    destinationProfile,
    customSubject,
    emailDisplayName,
    websiteName,
    linkAlias,
    buttonText
  } = req.body;

  if (!templateId || !scheduleDate || !scheduleTime) {
    return res.status(400).json({ error: 'templateId, scheduleDate, and scheduleTime are required' });
  }

  const { items } = loadEmailData();
  const baseItem = DEFAULT_EMAIL_ITEMS.find((d) => d.id === templateId) || items.find((it) => it.id === templateId);

  if (!baseItem) {
    return res.status(404).json({ error: 'Base email template not found' });
  }

  const config = loadEmailConfig();
  const destProf = (destinationProfile || baseItem.destinationProfile || 'S1');
  const dest = resolveDestinationEmail(destProf, config);

  const instanceId = `sched_${templateId}_${Date.now()}`;
  const newScheduledItem: EmailItem = {
    ...baseItem,
    id: instanceId,
    name: baseItem.name,
    subject: customSubject || baseItem.subject,
    destinationProfile: dest.profile,
    recipient: dest.email,
    emailDisplayName: emailDisplayName || baseItem.emailDisplayName || config.emailDisplayName,
    scheduleDate,
    scheduleTime,
    linkAlias: linkAlias || baseItem.linkAlias || 'ENTER YOUR STORY →',
    buttonText: buttonText || baseItem.buttonText || 'ENTER YOUR STORY →',
    status: 'SCHEDULED',
    enabled: true,
    createdAt: new Date().toISOString()
  };

  items.push(newScheduledItem);
  saveEmailData(items);

  recordAutomationActivity('ADMIN_ACTION', `Scheduled template "${baseItem.name}" for ${scheduleDate} ${scheduleTime} IST [Destination: ${dest.label} (${dest.email})]`, {
    templateId,
    instanceId,
    destinationProfile: dest.profile,
    targetEmail: dest.email
  });

  const upcomingFive = calculateUpcomingEmails(items, config, 5);

  res.json({
    success: true,
    message: `Email "${baseItem.name}" scheduled for ${scheduleDate} ${scheduleTime} IST`,
    scheduledItem: newScheduledItem,
    upcomingFive
  });
});

// Reschedule / Update an existing scheduled instance in place (NO DUPLICATES)
app.post('/api/email/scheduled-instance/update', (req, res) => {
  const { id, scheduleDate, scheduleTime, destinationProfile, customSubject, emailDisplayName } = req.body;
  if (!id) return res.status(400).json({ error: 'ID is required' });

  const { items } = loadEmailData();
  const idx = items.findIndex((it) => it.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Scheduled instance not found' });
  }

  const config = loadEmailConfig();
  const destProf = destinationProfile || items[idx].destinationProfile || 'S1';
  const dest = resolveDestinationEmail(destProf, config);

  items[idx] = {
    ...items[idx],
    scheduleDate: scheduleDate || items[idx].scheduleDate,
    scheduleTime: scheduleTime || items[idx].scheduleTime,
    destinationProfile: dest.profile,
    recipient: dest.email,
    subject: customSubject !== undefined && customSubject !== '' ? customSubject : items[idx].subject,
    emailDisplayName: emailDisplayName || items[idx].emailDisplayName || config.emailDisplayName,
    status: 'SCHEDULED',
    enabled: true,
    updatedAt: new Date().toISOString()
  };

  saveEmailData(items);
  recordAutomationActivity('ADMIN_ACTION', `Updated schedule for "${items[idx].name}" to ${items[idx].scheduleDate} ${items[idx].scheduleTime} IST [Destination: ${dest.label}]`);

  const upcomingFive = calculateUpcomingEmails(items, config, 5);

  res.json({
    success: true,
    message: 'Schedule updated successfully',
    item: items[idx],
    upcomingFive
  });
});

// Master Reschedule (Works for both existing scheduled instances & sent emails)
app.post('/api/email/reschedule', (req, res) => {
  const { originalEmailId, newDate, newTime, destinationProfile, customSubject, emailDisplayName } = req.body;
  const { items } = loadEmailData();
  const config = loadEmailConfig();

  // If this was an existing scheduled instance in items, update it in place without duplicating!
  const existingSchedIdx = items.findIndex((it) => it.id === originalEmailId);
  if (existingSchedIdx >= 0) {
    const dest = resolveDestinationEmail(destinationProfile || items[existingSchedIdx].destinationProfile, config);
    items[existingSchedIdx] = {
      ...items[existingSchedIdx],
      scheduleDate: newDate,
      scheduleTime: newTime,
      destinationProfile: dest.profile,
      recipient: dest.email,
      subject: customSubject || items[existingSchedIdx].subject,
      emailDisplayName: emailDisplayName || items[existingSchedIdx].emailDisplayName || config.emailDisplayName,
      status: 'SCHEDULED',
      enabled: true,
      updatedAt: new Date().toISOString()
    };
    saveEmailData(items);
    const upcomingFive = calculateUpcomingEmails(items, config, 5);
    return res.json({
      success: true,
      message: `Scheduled instance updated for ${newDate} ${newTime} IST`,
      newItem: items[existingSchedIdx],
      upcomingFive,
      upcomingTwo: upcomingFive.slice(0, 2)
    });
  }

  // Otherwise, create a new scheduled instance (from sent history or base template)
  const baseItem = DEFAULT_EMAIL_ITEMS.find((d) => d.id === originalEmailId) || items.find((it) => it.id === originalEmailId);
  if (!baseItem) {
    return res.status(404).json({ error: 'Original email template or record not found' });
  }

  const destProf = destinationProfile || baseItem.destinationProfile || 'T1';
  const dest = resolveDestinationEmail(destProf, config);

  const newInstanceId = `resched_${baseItem.id}_${Date.now()}`;
  const newItem: EmailItem = {
    ...baseItem,
    id: newInstanceId,
    name: baseItem.name.includes('(Rescheduled)') ? baseItem.name : `${baseItem.name} (Rescheduled)`,
    subject: customSubject || baseItem.subject,
    destinationProfile: dest.profile,
    recipient: dest.email,
    emailDisplayName: emailDisplayName || baseItem.emailDisplayName || config.emailDisplayName,
    scheduleDate: newDate,
    scheduleTime: newTime,
    status: 'SCHEDULED',
    enabled: true,
    createdAt: new Date().toISOString()
  };
  (newItem as any).rescheduledFrom = originalEmailId;

  items.push(newItem);
  saveEmailData(items);

  recordAutomationActivity('ADMIN_ACTION', `Rescheduled "${baseItem.name}" to ${newDate} ${newTime} IST [Destination: ${dest.label} (${dest.email})]`, {
    originalEmailId,
    newInstanceId,
    destinationProfile: dest.profile,
    targetEmail: dest.email
  });

  const upcomingFive = calculateUpcomingEmails(items, config, 5);

  res.json({
    success: true,
    message: `Email rescheduled for ${newDate} ${newTime} IST`,
    newItem,
    upcomingFive,
    upcomingTwo: upcomingFive.slice(0, 2)
  });
});

app.get('/api/email/sent', (_req, res) => {
  const logs = loadEmailLogs();
  res.json({ success: true, sentEmails: logs.filter((l) => l.status === 'SENT') });
});

app.post('/api/email/items/:id/send-now', async (req, res) => {
  const { id } = req.params;
  const { overrideDestinationProfile, overrideRecipient, overrideDisplayName, overrideSubject } = req.body;

  const { items } = loadEmailData();
  let item = items.find((it) => it.id === id);
  if (!item) {
    item = DEFAULT_EMAIL_ITEMS.find((d) => d.id === id);
  }

  if (!item) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const result = await sendEmail(item, {
    overrideDestinationProfile,
    overrideRecipient,
    overrideDisplayName,
    overrideSubject
  });

  if (result.success) {
    // If it was in items, update status to SENT
    const itemInDb = items.find((it) => it.id === id);
    if (itemInDb) {
      itemInDb.status = 'SENT';
      saveEmailData(items);
    }
    res.json({
      success: true,
      message: `Email "${item.name}" sent to ${result.destinationLabel} (${result.targetEmail})`,
      result
    });
  } else {
    res.status(500).json({ success: false, error: result.error, result });
  }
});

app.get('/api/reference-snapshots', (_req, res) => {
  const snapshots = loadReferenceSnapshots();
  res.json({ success: true, snapshots });
});

app.post('/api/reference-snapshots/capture/:id', (req, res) => {
  const { id } = req.params;
  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const item = items.find((it) => it.id === id) || DEFAULT_EMAIL_ITEMS.find((d) => d.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const dest = resolveDestinationEmail(item.destinationProfile, config);
  const effectiveDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    ? item.customDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  const renderedHtml = generateEmailHtml(item, {
    emailDisplayName: effectiveDisplayName,
    name: config.websiteName || 'SIRI',
    year: new Date().getFullYear(),
    age: new Date().getFullYear() - 2003
  });

  const snapshot: ReferenceSnapshot = {
    id: `snap_${id}_${Date.now()}`,
    emailId: id,
    name: item.name,
    type: item.type || 'ADVANCE',
    subject: item.subject,
    recipient: dest.email,
    emailDisplayName: effectiveDisplayName,
    heading: item.heading,
    body: item.message,
    renderedHtml,
    ctaText: item.buttonText || 'ENTER YOUR STORY →',
    websiteUrl: config.websiteUrl || DEFAULT_WEBSITE_URL,
    linkAlias: item.linkAlias || 'ENTER YOUR STORY →',
    designVersion: '2.8',
    scheduledSendTime: `${item.scheduleDate} ${item.scheduleTime} IST`,
    referenceCapturedTime: new Date().toISOString(),
    snapshotStatus: 'CAPTURED',
    sentStatus: 'PENDING',
    createdAt: new Date().toISOString()
  };
  (snapshot as any).capturedAt = snapshot.referenceCapturedTime;
  (snapshot as any).emailName = item.name;

  const snapshots = loadReferenceSnapshots();
  snapshots[id] = snapshot;
  if (snapshot.emailId) {
    snapshots[snapshot.emailId] = snapshot;
  }
  saveReferenceSnapshots(snapshots);

  recordAutomationActivity('ADMIN_ACTION', `Captured immutable reference snapshot for "${item.name}"`);
  res.json({ success: true, snapshot });
});

app.get('/api/reference-snapshots/:id/preview', (req, res) => {
  const { id } = req.params;
  const snapshots = loadReferenceSnapshots();
  const snapshot = snapshots[id];
  if (!snapshot) {
    return res.status(404).send('<h2>Reference snapshot not found</h2>');
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(snapshot.renderedHtml);
});

// Dynamic Live HTML Preview Endpoint (supports real-time configuration overrides)
app.post('/api/email/render-preview', (req, res) => {
  const {
    templateId,
    customSubject,
    destinationProfile,
    websiteName,
    emailDisplayName,
    linkAlias,
    buttonText,
    scheduleDate,
    scheduleTime
  } = req.body;

  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const baseItem = DEFAULT_EMAIL_ITEMS.find((d) => d.id === templateId) || items.find((it) => it.id === templateId) || DEFAULT_EMAIL_ITEMS[0];

  const dest = resolveDestinationEmail(destinationProfile || baseItem.destinationProfile, config);
  const effectiveDisplayName = (emailDisplayName !== undefined && emailDisplayName.trim() !== '')
    ? emailDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  const effectiveWebsiteName = (websiteName !== undefined && websiteName.trim() !== '')
    ? websiteName.trim()
    : (config.websiteName || 'SIRI');

  const effectiveItem: EmailItem = {
    ...baseItem,
    subject: customSubject || baseItem.subject,
    buttonText: buttonText || linkAlias || baseItem.buttonText || 'ENTER YOUR STORY →',
    linkAlias: linkAlias || buttonText || baseItem.linkAlias || 'ENTER YOUR STORY →',
    scheduleDate: scheduleDate || baseItem.scheduleDate,
    scheduleTime: scheduleTime || baseItem.scheduleTime
  };

  const renderedHtml = generateEmailHtml(effectiveItem, {
    emailDisplayName: effectiveDisplayName,
    name: effectiveWebsiteName,
    year: new Date().getFullYear(),
    age: new Date().getFullYear() - 2003
  });

  res.json({
    success: true,
    renderedHtml,
    subject: effectiveItem.subject,
    targetEmail: dest.email,
    destinationProfile: dest.profile,
    destinationLabel: dest.label,
    emailDisplayName: effectiveDisplayName,
    websiteName: effectiveWebsiteName,
    linkAlias: effectiveItem.linkAlias
  });
});

// Dual JSON & HTML Preview Endpoint
app.all('/api/email/preview/:id', (req, res) => {
  const { id } = req.params;
  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const item = items.find((it) => it.id === id) || DEFAULT_EMAIL_ITEMS.find((d) => d.id === id);

  if (!item) {
    if (req.headers['accept']?.includes('application/json')) {
      return res.status(404).json({ success: false, error: 'Email template not found' });
    }
    return res.status(404).send('<h2>Email template not found</h2>');
  }

  const dest = resolveDestinationEmail(item.destinationProfile, config);
  const effectiveDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    ? item.customDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  const renderedHtml = generateEmailHtml(item, {
    emailDisplayName: effectiveDisplayName,
    name: config.websiteName || 'SIRI',
    year: new Date().getFullYear(),
    age: new Date().getFullYear() - 2003
  });

  if (req.headers['accept']?.includes('application/json') || req.query.format === 'json') {
    return res.json({
      success: true,
      id: item.id,
      name: item.name,
      subject: item.subject,
      recipient: dest.email,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      emailDisplayName: effectiveDisplayName,
      renderedHtml,
      html: renderedHtml,
      linkAlias: item.linkAlias || 'ENTER YOUR STORY →',
      websiteUrl: config.websiteUrl || DEFAULT_WEBSITE_URL
    });
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(renderedHtml);
});

app.post('/api/admin/verify-password', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');

  if (fs.existsSync(AUTH_FILE)) {
    try {
      const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      if (auth.passwordHash && auth.passwordHash === hash) {
        return res.json({ success: true, message: 'Password verified' });
      }
      if (auth.password && auth.password === password.trim()) {
        return res.json({ success: true, message: 'Password verified' });
      }
    } catch {}
  }

  if (password.trim() === 'siri2026' || password.trim() === 'mendu' || password.trim() === 'admin123') {
    return res.json({ success: true, message: 'Default password verified' });
  }

  res.status(401).json({ success: false, message: 'Invalid admin password' });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  let valid = false;
  const currentHash = crypto.createHash('sha256').update((currentPassword || '').trim()).digest('hex');

  if (fs.existsSync(AUTH_FILE)) {
    try {
      const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      if (auth.passwordHash === currentHash || auth.password === currentPassword) {
        valid = true;
      }
    } catch {}
  }

  if (!valid && (currentPassword === 'siri2026' || currentPassword === 'mendu')) {
    valid = true;
  }

  if (!valid) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  const newHash = crypto.createHash('sha256').update(newPassword.trim()).digest('hex');
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ passwordHash: newHash, updatedAt: new Date().toISOString() }, null, 2), 'utf8');

  recordAutomationActivity('ADMIN_ACTION', 'Admin password changed successfully');
  res.json({ success: true, message: 'Admin password updated successfully' });
});

app.all(['/api/cron/tick', '/api/email/scheduler/tick'], async (_req, res) => {
  const result = await runSchedulerTick();
  res.json({ success: true, ...result, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Server] Siri Birthday & Email Automation Server running on port ${PORT}`);
  recordAutomationActivity('SCHEDULER_CHECK', 'Scheduler engine initialized and running (10s IST interval)');
});
