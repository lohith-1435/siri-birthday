import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import {
  generateEmailHtml,
  generateTestEmailHtml,
  generateAdvanceEmailHtml,
  generateBirthdayMidnightEmailHtml,
  generateBirthMomentEmailHtml,
  generateTithiEmailHtml,
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_EMAIL_ITEMS,
  replaceEmailVariables,
  type EmailItem,
  type ReferenceSnapshot,
  type CustomEmailTemplateConfig,
  type AllEmailTemplates,
} from './emailTemplates';
import { BIRTH_DETAILS } from '../src/data/timelineData';
import { INITIAL_VERIFIED_DATES } from '../src/services/tithiService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'email_templates.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'reference_snapshots.json');
const HISTORY_FILE = path.join(DATA_DIR, 'automation_history.json');
const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Data Helpers
// -------------------------------------------------------------
function loadEmailConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return {
        websiteName: data.websiteName || data.displayName || 'SIRI',
        displayName: data.displayName || data.websiteName || 'SIRI',
        emailDisplayName: data.emailDisplayName || data.recipientName || 'SIRI BANGARAM',
        recipientName: data.recipientName || data.emailDisplayName || 'SIRI BANGARAM',
        recipientEmail: data.recipientEmail || 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
        testRecipientEmail: data.testRecipientEmail || 'lohithmedisetti1432004@gmail.com',
        smtpHost: data.smtpHost || 'smtp.gmail.com',
        smtpPort: data.smtpPort || 465,
        smtpUser: data.smtpUser || 'lohithmedisetti@gmail.com',
        smtpPass: data.smtpPass || '',
        fromEmail: data.fromEmail || data.senderEmail || 'lohithmedisetti@gmail.com',
        websiteUrl: data.websiteUrl || 'https://siri-birthday-brown.vercel.app/',
        autoSendEnabled: data.autoSendEnabled !== undefined ? data.autoSendEnabled : true,
      };
    } catch {
      // Fallback
    }
  }
  const defaultConfig = {
    websiteName: 'SIRI',
    displayName: 'SIRI',
    emailDisplayName: 'SIRI BANGARAM',
    recipientName: 'SIRI BANGARAM',
    recipientEmail: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    testRecipientEmail: 'lohithmedisetti1432004@gmail.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: 'lohithmedisetti@gmail.com',
    smtpPass: '',
    fromEmail: 'lohithmedisetti@gmail.com',
    websiteUrl: 'https://siri-birthday-brown.vercel.app/',
    autoSendEnabled: true,
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf8');
  return defaultConfig;
}

function saveEmailConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

function loadAutomationHistory(): any[] {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function recordAutomationToggle(prevState: boolean, newState: boolean) {
  const history = loadAutomationHistory();
  const nowIst = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  history.unshift({
    id: `auto_hist_${Date.now()}`,
    timestamp: new Date().toISOString(),
    timestampIST: nowIst,
    previousState: prevState ? 'ON' : 'OFF',
    newState: newState ? 'ON' : 'OFF',
    action: 'ADMIN_TOGGLE',
  });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(0, 100), null, 2), 'utf8');
}

function loadEmailData(): { templates: AllEmailTemplates; items: EmailItem[] } {
  let templates: AllEmailTemplates = { ...DEFAULT_EMAIL_TEMPLATES };
  let items: EmailItem[] = [...DEFAULT_EMAIL_ITEMS];

  if (fs.existsSync(TEMPLATES_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      if (data.items && Array.isArray(data.items)) {
        const existingIds = new Set(data.items.map((it: EmailItem) => it.id));
        const mergedItems = [...data.items];
        DEFAULT_EMAIL_ITEMS.forEach((defaultItem) => {
          if (!existingIds.has(defaultItem.id)) {
            mergedItems.push(defaultItem);
          }
        });
        items = mergedItems;
      }
      if (data.test) templates.test = { ...templates.test, ...data.test };
      if (data.advance) templates.advance = { ...templates.advance, ...data.advance };
      if (data.birthday_midnight) templates.birthday_midnight = { ...templates.birthday_midnight, ...data.birthday_midnight };
      if (data.birth_moment) templates.birth_moment = { ...templates.birth_moment, ...data.birth_moment };
      if (data.tithi) templates.tithi = { ...templates.tithi, ...data.tithi };
    } catch (e) {
      console.error('Error loading email_templates.json:', e);
    }
  } else {
    saveEmailData(templates, items);
  }

  return { templates, items };
}

function saveEmailData(templates: AllEmailTemplates, items: EmailItem[]) {
  const payload = {
    ...templates,
    items,
  };
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

function loadEmailLogs(): any[] {
  if (fs.existsSync(LOGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveEmailLogs(logs: any[]) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

function loadReferenceSnapshots(): ReferenceSnapshot[] {
  if (fs.existsSync(SNAPSHOTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveReferenceSnapshots(snapshots: ReferenceSnapshot[]) {
  fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(snapshots, null, 2), 'utf8');
}

function captureSnapshotForItem(
  item: EmailItem,
  context: any = {},
  forceNew: boolean = false
): ReferenceSnapshot {
  const snapshots = loadReferenceSnapshots();
  const config = loadEmailConfig();

  const effectiveEmailDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    ? item.customDisplayName.trim()
    : (context.emailDisplayName || config.emailDisplayName || 'SIRI BANGARAM');

  const existingIndex = snapshots.findIndex((s) => s.emailId === item.id);

  if (existingIndex >= 0 && !forceNew) {
    return snapshots[existingIndex];
  }

  const nowIso = new Date().toISOString();
  const renderedHtml = generateEmailHtml(item, {
    ...context,
    name: effectiveEmailDisplayName,
    emailDisplayName: effectiveEmailDisplayName,
  });
  const scheduledSendTime = `${item.scheduleDate || '2026-09-28'} ${item.scheduleTime || '00:00'} IST`;

  const newSnapshot: ReferenceSnapshot = {
    id: `snapshot_${item.id}_${Date.now()}`,
    emailId: item.id,
    name: item.name,
    type: item.type,
    subject: item.subject,
    recipient: item.recipient || config.recipientEmail,
    emailDisplayName: effectiveEmailDisplayName,
    heading: item.heading,
    topLabel: item.topLabel,
    body: item.message,
    renderedHtml,
    ctaText: item.buttonText || item.linkAlias || 'ENTER YOUR STORY →',
    websiteUrl: item.websiteUrl || 'https://siri-birthday-brown.vercel.app/',
    linkAlias: item.linkAlias || item.buttonText || 'ENTER YOUR STORY →',
    designVersion: 'v2.0-celestial-gold',
    scheduledSendTime,
    referenceCapturedTime: nowIso,
    snapshotStatus: 'CAPTURED',
    sentStatus: item.status === 'SENT' ? 'SENT' : 'PENDING',
    sentAt: item.lastSentAt || null,
    createdAt: nowIso,
  };

  if (existingIndex >= 0 && forceNew) {
    snapshots[existingIndex] = newSnapshot;
  } else if (existingIndex >= 0) {
    snapshots[existingIndex] = newSnapshot;
  } else {
    snapshots.push(newSnapshot);
  }

  saveReferenceSnapshots(snapshots);
  return newSnapshot;
}

// -------------------------------------------------------------
// IST Date & Time Helpers
// -------------------------------------------------------------
function getIstTime() {
  const now = new Date();
  const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istString);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();

  return { dateStr, timeStr, totalMinutes, year: yyyy, fullIst: istDate, istEpoch: istDate.getTime() };
}

function isScheduledTimePassed(scheduleDate: string, scheduleTime: string): boolean {
  if (!scheduleDate || !scheduleTime) return false;
  const { dateStr, timeStr } = getIstTime();
  if (scheduleDate < dateStr) return true;
  if (scheduleDate === dateStr && scheduleTime <= timeStr) return true;
  return false;
}

// -------------------------------------------------------------
// Transporter & Dispatcher
// -------------------------------------------------------------
function createTransporter(config: any) {
  const isSecure = config.smtpPort === 465;
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: isSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass ? config.smtpPass.replace(/\s+/g, '') : '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function dispatchEmail(options: {
  emailId: string;
  name: string;
  type: string;
  recipient: string;
  subject: string;
  html: string;
  mode: 'real' | 'test' | 'advance';
  scheduledDate?: string;
  year?: number;
  delayedSendReason?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = loadEmailConfig();
  const year = options.year || 2026;
  const attemptedAt = new Date().toISOString();

  // Duplicate Send Protection
  const logs = loadEmailLogs();
  if (options.mode !== 'test') {
    const alreadySent = logs.some(
      (l) => l.emailId === options.emailId && l.status === 'SENT'
    );
    if (alreadySent) {
      console.warn(`[Duplicate Protection] Email ID ${options.emailId} was already sent. Skipping.`);
      return { success: true, messageId: 'SKIPPED_ALREADY_SENT' };
    }
  }

  if (!config.smtpPass || !config.smtpUser) {
    const errMsg = 'SMTP credentials not configured. Please set SMTP Password in Email Config.';
    console.error(errMsg);
    logs.unshift({
      id: `log-${Date.now()}`,
      year,
      emailId: options.emailId,
      name: options.name,
      eventType: options.type,
      mode: options.mode,
      recipient: options.recipient,
      scheduledDate: options.scheduledDate || 'Manual Send',
      attemptedAt,
      status: 'FAILED',
      error: errMsg,
      subject: options.subject,
      delayedSendReason: options.delayedSendReason,
      createdAt: attemptedAt,
    });
    saveEmailLogs(logs);
    return { success: false, error: errMsg };
  }

  try {
    const transporter = createTransporter(config);
    const recipients = options.recipient.split(',').map((r) => r.trim()).filter(Boolean);

    const info = await transporter.sendMail({
      from: `"✦ ${config.displayName || 'SIRI'} Birthday Experience ✦" <${config.fromEmail}>`,
      to: recipients.join(', '),
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email Sent] ID: ${options.emailId} | MessageID: ${info.messageId} | To: ${recipients.join(', ')}`);

    const sentAt = new Date().toISOString();
    logs.unshift({
      id: `log-${Date.now()}`,
      year,
      emailId: options.emailId,
      name: options.name,
      eventType: options.type,
      mode: options.mode,
      recipient: options.recipient,
      scheduledDate: options.scheduledDate || 'Manual Send',
      attemptedAt,
      sentAt,
      status: 'SENT',
      providerMessageId: info.messageId,
      subject: options.subject,
      delayedSendReason: options.delayedSendReason,
      createdAt: sentAt,
    });
    saveEmailLogs(logs);

    if (options.mode !== 'test') {
      const snapshots = loadReferenceSnapshots();
      const snap = snapshots.find((s) => s.emailId === options.emailId);
      if (snap) {
        snap.sentStatus = 'SENT';
        snap.sentAt = sentAt;
        saveReferenceSnapshots(snapshots);
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Email Error] ID: ${options.emailId}`, err);
    logs.unshift({
      id: `log-${Date.now()}`,
      year,
      emailId: options.emailId,
      name: options.name,
      eventType: options.type,
      mode: options.mode,
      recipient: options.recipient,
      scheduledDate: options.scheduledDate || 'Manual Send',
      attemptedAt,
      status: 'FAILED',
      error: err.message || String(err),
      subject: options.subject,
      delayedSendReason: options.delayedSendReason,
      createdAt: attemptedAt,
    });
    saveEmailLogs(logs);
    return { success: false, error: err.message || String(err) };
  }
}

// -------------------------------------------------------------
// Automated Background Scheduler (Asia/Kolkata)
// -------------------------------------------------------------
cron.schedule('* * * * *', async () => {
  const config = loadEmailConfig();
  const { dateStr, timeStr, totalMinutes, year } = getIstTime();
  const { templates, items } = loadEmailData();
  const logs = loadEmailLogs();
  const snapshots = loadReferenceSnapshots();

  for (const item of items) {
    if (!item.enabled || !item.scheduleDate || !item.scheduleTime) continue;

    const alreadySent = logs.some((l) => l.emailId === item.id && l.status === 'SENT');
    if (alreadySent) {
      if (item.status !== 'SENT') {
        item.status = 'SENT';
        saveEmailData(templates, items);
      }
      continue;
    }

    // Only process if date matches today in IST
    if (item.scheduleDate === dateStr) {
      const [schedH, schedM] = item.scheduleTime.split(':').map(Number);
      const schedTotalMinutes = schedH * 60 + schedM;
      const diffMinutes = schedTotalMinutes - totalMinutes;

      // 1. T - 2 Minutes: Automatically Capture Reference Snapshot
      if (diffMinutes <= 2 && diffMinutes >= 0) {
        const hasSnapshot = snapshots.some((s) => s.emailId === item.id);
        if (!hasSnapshot) {
          console.log(`[Scheduler] Capturing Reference Snapshot at T-2m for ${item.name} (${item.id})`);
          captureSnapshotForItem(item, { year, name: config.displayName });
        }
      }

      // 2. T (Scheduled Send Time):
      if (diffMinutes <= 0) {
        // If Automation is ON -> Send automatically
        if (config.autoSendEnabled) {
          if (item.status === 'SCHEDULED' && diffMinutes >= -5) {
            captureSnapshotForItem(item, { year, name: config.displayName });
            console.log(`[Scheduler] Disposing Scheduled Email ${item.name} (${item.id}) at ${timeStr} IST`);
            item.status = 'SENDING';
            saveEmailData(templates, items);

            const effectiveEmailDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
              ? item.customDisplayName.trim()
              : (config.emailDisplayName || 'SIRI BANGARAM');
            const renderedHtml = generateEmailHtml(item, { year, name: effectiveEmailDisplayName, emailDisplayName: effectiveEmailDisplayName });
            const result = await dispatchEmail({
              emailId: item.id,
              name: item.name,
              type: item.type,
              recipient: item.recipient || config.recipientEmail,
              subject: item.subject,
              html: renderedHtml,
              mode: 'real',
              scheduledDate: `${item.scheduleDate} ${item.scheduleTime} IST`,
              year,
            });

            if (result.success) {
              item.status = 'SENT';
              item.lastSentAt = new Date().toISOString();
            } else {
              item.status = 'FAILED';
            }
            saveEmailData(templates, items);
          }
        } else {
          // If Automation is OFF -> Mark as PENDING / MISSED (Do NOT send automatically!)
          if (item.status === 'SCHEDULED') {
            console.log(`[Scheduler] Automation is OFF. Marking ${item.name} as PENDING (missed at ${timeStr} IST)`);
            item.status = 'PENDING';
            saveEmailData(templates, items);
          }
        }
      }
    } else if (item.scheduleDate < dateStr && item.status === 'SCHEDULED') {
      // Past date missed while automation was OFF
      item.status = 'PENDING';
      saveEmailData(templates, items);
    }
  }
});

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// System Status & Automation Dashboard Summary
app.get('/api/email/status', (_req, res) => {
  const config = loadEmailConfig();
  const { items } = loadEmailData();
  const logs = loadEmailLogs();
  const snapshots = loadReferenceSnapshots();
  const ist = getIstTime();

  // Find next upcoming scheduled email
  const scheduledList = items
    .filter((it) => it.enabled && it.status === 'SCHEDULED' && it.scheduleDate && it.scheduleTime)
    .sort((a, b) => `${a.scheduleDate} ${a.scheduleTime}`.localeCompare(`${b.scheduleDate} ${b.scheduleTime}`));

  const nextScheduled = scheduledList.find(
    (it) => `${it.scheduleDate} ${it.scheduleTime}` >= `${ist.dateStr} ${ist.timeStr}`
  ) || scheduledList[0] || null;

  // Pending / missed emails count
  const pendingItems = items.filter(
    (it) =>
      (it.status === 'PENDING' || it.status === 'MISSED') ||
      (it.status === 'SCHEDULED' && isScheduledTimePassed(it.scheduleDate, it.scheduleTime))
  );

  // Last sent email
  const lastSentLog = logs.find((l) => l.status === 'SENT') || null;

  res.json({
    status: 'ONLINE',
    timeZone: 'Asia/Kolkata',
    currentTimeIST: `${ist.dateStr} ${ist.timeStr}`,
    autoSendEnabled: config.autoSendEnabled,
    displayName: config.displayName || 'SIRI',
    recipientName: config.recipientName,
    smtpConfigured: !!(config.smtpUser && config.smtpPass),
    totalItems: items.length,
    totalSnapshots: snapshots.length,
    pendingCount: pendingItems.length,
    pendingItems,
    nextScheduled: nextScheduled
      ? {
          id: nextScheduled.id,
          name: nextScheduled.name,
          scheduledTime: `${nextScheduled.scheduleDate} ${nextScheduled.scheduleTime} IST`,
        }
      : null,
    lastSent: lastSentLog
      ? {
          name: lastSentLog.name || lastSentLog.subject,
          sentAt: lastSentLog.sentAt || lastSentLog.attemptedAt,
          recipient: lastSentLog.recipient,
        }
      : null,
    recentLogs: logs.slice(0, 10),
  });
});

// Name Settings
app.post('/api/admin/settings/name', (req, res) => {
  const { displayName, websiteName } = req.body;
  const config = loadEmailConfig();
  const nameToSet = (websiteName || displayName || '').trim();
  if (nameToSet) {
    config.websiteName = nameToSet;
    config.displayName = nameToSet;
  }
  saveEmailConfig(config);
  res.json({
    success: true,
    message: 'Website Name updated successfully',
    displayName: config.displayName,
    websiteName: config.websiteName,
    emailDisplayName: config.emailDisplayName,
  });
});

app.post('/api/admin/settings/email-display-name', (req, res) => {
  const { emailDisplayName } = req.body;
  const config = loadEmailConfig();
  if (emailDisplayName && emailDisplayName.trim()) {
    config.emailDisplayName = emailDisplayName.trim();
    config.recipientName = emailDisplayName.trim();
  }
  saveEmailConfig(config);
  res.json({
    success: true,
    message: 'Email Display Name updated successfully',
    emailDisplayName: config.emailDisplayName,
    websiteName: config.websiteName || config.displayName,
  });
});

// Automation Master Switch
app.post('/api/email/automation-switch', (req, res) => {
  const { enabled } = req.body;
  const config = loadEmailConfig();
  const prevState = config.autoSendEnabled;
  config.autoSendEnabled = Boolean(enabled);
  saveEmailConfig(config);

  recordAutomationToggle(prevState, config.autoSendEnabled);

  const { items } = loadEmailData();
  const pendingItems = items.filter(
    (it) =>
      (it.status === 'PENDING' || it.status === 'MISSED') ||
      (it.status === 'SCHEDULED' && isScheduledTimePassed(it.scheduleDate, it.scheduleTime))
  );

  res.json({
    success: true,
    autoSendEnabled: config.autoSendEnabled,
    pendingCount: pendingItems.length,
    pendingItems,
    message: config.autoSendEnabled ? 'Email Automation Activated' : 'Email Automation Paused',
  });
});

app.get('/api/email/automation-history', (_req, res) => {
  const history = loadAutomationHistory();
  res.json({ history });
});

// Pending / Missed Emails List
app.get('/api/email/pending-missed', (_req, res) => {
  const { items } = loadEmailData();
  const logs = loadEmailLogs();
  const sentIds = new Set(logs.filter((l) => l.status === 'SENT').map((l) => l.emailId));

  const pendingItems = items.filter((it) => {
    if (sentIds.has(it.id) || it.status === 'SENT' || it.status === 'SKIPPED') return false;
    if (it.status === 'PENDING' || it.status === 'MISSED') return true;
    if (it.status === 'SCHEDULED' && isScheduledTimePassed(it.scheduleDate, it.scheduleTime)) return true;
    return false;
  });

  res.json({ pendingItems, count: pendingItems.length });
});

// Send All Pending Emails (With Explicit Admin Confirmation)
app.post('/api/email/send-all-pending', async (req, res) => {
  const { templates, items } = loadEmailData();
  const config = loadEmailConfig();
  const logs = loadEmailLogs();
  const sentIds = new Set(logs.filter((l) => l.status === 'SENT').map((l) => l.emailId));

  const targetPending = items.filter((it) => {
    if (sentIds.has(it.id) || it.status === 'SENT' || it.status === 'SKIPPED') return false;
    if (it.status === 'PENDING' || it.status === 'MISSED') return true;
    if (it.status === 'SCHEDULED' && isScheduledTimePassed(it.scheduleDate, it.scheduleTime)) return true;
    return false;
  });

  console.log(`[Admin Action] Dispatching ${targetPending.length} Pending Missed Emails`);
  const results = [];

  for (const item of targetPending) {
    captureSnapshotForItem(item, { name: config.displayName });
    const renderedHtml = generateEmailHtml(item, {
      name: config.displayName || 'SIRI',
      year: 2026,
      age: 23,
      tithiName: 'Ashwayuja Shukla Tritiya',
      scheduledDate: `${item.scheduleDate} ${item.scheduleTime} IST`,
    });

    const sendRes = await dispatchEmail({
      emailId: item.id,
      name: item.name,
      type: item.type,
      recipient: item.recipient || config.recipientEmail,
      subject: item.subject,
      html: renderedHtml,
      mode: 'real',
      scheduledDate: `${item.scheduleDate} ${item.scheduleTime} IST`,
      year: 2026,
      delayedSendReason: 'AUTOMATION_WAS_OFF',
    });

    if (sendRes.success) {
      item.status = 'SENT';
      item.lastSentAt = new Date().toISOString();
    } else {
      item.status = 'FAILED';
    }

    results.push({ id: item.id, name: item.name, success: sendRes.success, error: sendRes.error });
  }

  saveEmailData(templates, items);
  res.json({ success: true, dispatchedCount: results.length, results });
});

// Skip a pending email
app.post('/api/email/items/:id/skip', (req, res) => {
  const { templates, items } = loadEmailData();
  const item = items.find((it) => it.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Email item not found' });
  item.status = 'SKIPPED';
  saveEmailData(templates, items);
  res.json({ success: true, item, items });
});

// Config CRUD
app.get('/api/email/config', (_req, res) => {
  const config = loadEmailConfig();
  res.json({
    ...config,
    smtpPass: config.smtpPass ? '••••••••••••••••' : '',
  });
});

app.post('/api/email/config', (req, res) => {
  const current = loadEmailConfig();
  const updated = {
    ...current,
    ...req.body,
    smtpPass:
      req.body.smtpPass && req.body.smtpPass !== '••••••••••••••••'
        ? req.body.smtpPass
        : current.smtpPass,
  };
  saveEmailConfig(updated);
  res.json({ success: true, message: 'Configuration saved successfully', config: updated });
});

// Email Items CRUD
app.get('/api/email/items', (_req, res) => {
  const { items } = loadEmailData();
  res.json({ items });
});

app.post('/api/email/items', (req, res) => {
  const { templates, items } = loadEmailData();
  const itemData: EmailItem = req.body;

  if (!itemData.id) {
    itemData.id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  const existingIndex = items.findIndex((it) => it.id === itemData.id);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      ...itemData,
      updatedAt: now,
    };
  } else {
    items.push({
      ...itemData,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveEmailData(templates, items);
  res.json({ success: true, item: itemData, items });
});

// Duplicate Item
app.post('/api/email/items/:id/duplicate', (req, res) => {
  const { templates, items } = loadEmailData();
  const target = items.find((it) => it.id === req.params.id);

  if (!target) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const newId = `${target.type}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  const newItem: EmailItem = {
    ...target,
    id: newId,
    name: `${target.name} (Copy)`,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSentAt: undefined,
  };

  items.push(newItem);
  saveEmailData(templates, items);
  res.json({ success: true, item: newItem, items });
});

// Delete Item
app.delete('/api/email/items/:id', (req, res) => {
  const { templates, items } = loadEmailData();
  const filtered = items.filter((it) => it.id !== req.params.id);
  saveEmailData(templates, filtered);
  res.json({ success: true, items: filtered });
});

// Reference Snapshots Endpoints
app.get('/api/reference-snapshots', (_req, res) => {
  const snapshots = loadReferenceSnapshots();
  res.json({ snapshots: snapshots.reverse() });
});

app.post('/api/reference-snapshots/capture/:id', (req, res) => {
  const { items } = loadEmailData();
  const item = items.find((it) => it.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const snapshot = captureSnapshotForItem(item, {}, true);
  res.json({ success: true, snapshot, message: 'Reference Snapshot captured permanently.' });
});

app.get('/api/reference-snapshots/:id/preview', (req, res) => {
  const snapshots = loadReferenceSnapshots();
  const snapshot = snapshots.find((s) => s.id === req.params.id || s.emailId === req.params.id);

  if (!snapshot) {
    return res.status(404).send('Reference snapshot not found');
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(snapshot.renderedHtml);
});

// Live Preview
app.get('/api/email/preview/:id', (req, res) => {
  const { items } = loadEmailData();
  const config = loadEmailConfig();
  const item = items.find((it) => it.id === req.params.id);

  if (!item) {
    return res.status(404).send('Email item not found');
  }

  const effectiveEmailDisplayName = (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    ? item.customDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  const html = generateEmailHtml(item, {
    name: effectiveEmailDisplayName,
    emailDisplayName: effectiveEmailDisplayName,
    year: 2026,
    age: 23,
    tithiName: 'Ashwayuja Shukla Tritiya',
    scheduledDate: `${item.scheduleDate} ${item.scheduleTime} IST`,
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Pre-Send Confirmed Email Send Endpoint
app.post('/api/email/send', async (req, res) => {
  const { emailId, recipient, mode = 'real', customItem, delayedSendReason } = req.body;
  const { templates, items } = loadEmailData();
  const config = loadEmailConfig();

  let targetItem: EmailItem | undefined;
  if (emailId) {
    targetItem = items.find((it) => it.id === emailId);
  } else if (customItem) {
    targetItem = customItem;
  }

  if (!targetItem) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const targetRecipient = recipient || targetItem.recipient || config.recipientEmail;
  const isTest = mode === 'test';

  const effectiveEmailDisplayName = (targetItem.useGlobalEmailDisplayName === false && targetItem.customDisplayName && targetItem.customDisplayName.trim())
    ? targetItem.customDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  if (!isTest) {
    captureSnapshotForItem(targetItem, { emailDisplayName: effectiveEmailDisplayName });
  }

  const renderedHtml = generateEmailHtml(targetItem, {
    name: effectiveEmailDisplayName,
    emailDisplayName: effectiveEmailDisplayName,
    year: 2026,
    age: 23,
    tithiName: 'Ashwayuja Shukla Tritiya',
    scheduledDate: `${targetItem.scheduleDate} ${targetItem.scheduleTime} IST`,
  });

  const result = await dispatchEmail({
    emailId: targetItem.id,
    name: targetItem.name,
    type: targetItem.type,
    recipient: targetRecipient,
    subject: isTest ? `[TEST MODE] ${targetItem.subject}` : targetItem.subject,
    html: renderedHtml,
    mode: isTest ? 'test' : 'real',
    scheduledDate: `${targetItem.scheduleDate || 'Manual'} ${targetItem.scheduleTime || ''} IST`,
    year: 2026,
    delayedSendReason,
  });

  if (result.success && !isTest && emailId) {
    const itemIdx = items.findIndex((it) => it.id === emailId);
    if (itemIdx >= 0) {
      items[itemIdx].status = 'SENT';
      items[itemIdx].lastSentAt = new Date().toISOString();
      saveEmailData(templates, items);
    }
  }

  res.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error,
    status: result.success ? 'SENT' : 'FAILED',
  });
});

// Admin Password Management
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

function getAdminAuth() {
  if (fs.existsSync(AUTH_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    } catch {
      // Fallback
    }
  }
  const defaultHash = hashPassword('siri2026');
  const defaultAuth = { passwordHash: defaultHash, updatedAt: new Date().toISOString() };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(defaultAuth, null, 2), 'utf8');
  return defaultAuth;
}

function setAdminPassword(newPassword: string) {
  const passwordHash = hashPassword(newPassword);
  const payload = { passwordHash, updatedAt: new Date().toISOString() };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

app.post('/api/admin/verify-password', (req, res) => {
  const { password } = req.body;
  const auth = getAdminAuth();
  const isValid = hashPassword(password || '') === auth.passwordHash;
  res.json({ valid: isValid });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const auth = getAdminAuth();

  if (hashPassword(currentPassword || '') !== auth.passwordHash) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long' });
  }

  setAdminPassword(newPassword);
  res.json({ success: true, message: 'Password updated successfully' });
});

// Server Listen
app.listen(PORT, () => {
  console.log(`[SIRI Backend] Server running on http://localhost:${PORT}`);
  console.log(`[SIRI Backend] Asia/Kolkata Scheduler initialized (15 Scheduled Experiences)`);
  const { items } = loadEmailData();
  const snapshots = loadReferenceSnapshots();
  if (snapshots.length === 0) {
    items.forEach((it) => captureSnapshotForItem(it));
    console.log(`[SIRI Backend] Seeded ${items.length} initial Reference Snapshots`);
  }
});
