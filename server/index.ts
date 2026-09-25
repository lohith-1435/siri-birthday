import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import {
  generateTestEmailHtml,
  generateAdvanceEmailHtml,
  generateBirthdayMidnightEmailHtml,
  generateBirthMomentEmailHtml,
  generateTithiEmailHtml,
  DEFAULT_EMAIL_TEMPLATES,
  replaceEmailVariables,
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
const TITHI_DB_FILE = path.join(DATA_DIR, 'tithi_dates.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface EmailConfig {
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName?: string;
  replyTo?: string;
  websiteUrl: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  isSimulatedMode: boolean;
}

export interface EmailLogEntry {
  id: string;
  year: number;
  eventType: 'birthday_midnight' | 'birth_moment' | 'tithi' | 'advance' | 'test';
  mode: 'real' | 'test' | 'advance';
  recipient: string;
  scheduledDate: string;
  attemptedAt: string;
  sentAt?: string;
  status: 'SENT' | 'FAILED' | 'SIMULATED' | 'SKIPPED_DUPLICATE';
  providerMessageId?: string;
  errorMessage?: string;
  subject: string;
  createdAt: string;
}

const DEFAULT_CONFIG: EmailConfig = {
  recipientEmail: 'siri@example.com',
  recipientName: 'SIRI',
  senderEmail: 'blessings@divinejourney.com',
  senderName: 'SIRI Birthday Celestial Journey',
  replyTo: 'blessings@divinejourney.com',
  websiteUrl: 'http://localhost:5173',
  isSimulatedMode: true,
};

function loadConfig(): EmailConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) };
    }
  } catch (err) {
    console.error('Error reading email config:', err);
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: EmailConfig) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

function loadTemplates(): AllEmailTemplates {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      return { ...DEFAULT_EMAIL_TEMPLATES, ...JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8')) };
    }
  } catch (err) {
    console.error('Error reading templates file:', err);
  }
  return DEFAULT_EMAIL_TEMPLATES;
}

function saveTemplates(templates: AllEmailTemplates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8');
}

function loadLogs(): EmailLogEntry[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading email logs:', err);
  }
  return [];
}

function saveLogs(logs: EmailLogEntry[]) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

// Read published Tithi dates dynamically
function getPublishedTithiMap(): Record<number, string> {
  const map: Record<number, string> = {};
  INITIAL_VERIFIED_DATES.forEach((item) => {
    if (item.status === 'published') {
      map[item.year] = item.date;
    }
  });

  try {
    if (fs.existsSync(TITHI_DB_FILE)) {
      const custom = JSON.parse(fs.readFileSync(TITHI_DB_FILE, 'utf-8'));
      custom.forEach((item: { year: number; date: string; status: string }) => {
        if (item.status === 'published') {
          map[item.year] = item.date;
        }
      });
    }
  } catch {
    // Fallback
  }

  return map;
}

// Mail transporter helper
function createTransporter(config: EmailConfig) {
  if (config.isSimulatedMode || !config.smtpUser || !config.smtpPass) {
    return null; // Simulated mode
  }

  return nodemailer.createTransport({
    host: config.smtpHost || 'smtp.gmail.com',
    port: config.smtpPort || 465,
    secure: (config.smtpPort || 465) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

// Core dispatch function with strict test vs real separation and deduplication
async function dispatchEmail(
  eventType: 'birthday_midnight' | 'birth_moment' | 'tithi' | 'advance' | 'test',
  targetYear?: number,
  isManualTest: boolean = false,
  overrides?: {
    recipientEmail?: string;
    recipientName?: string;
    websiteUrl?: string;
    senderEmail?: string;
    senderName?: string;
    replyTo?: string;
    templates?: AllEmailTemplates;
  }
): Promise<{ success: boolean; message: string; log: EmailLogEntry }> {
  const baseConfig = loadConfig();
  const config: EmailConfig = {
    ...baseConfig,
    ...(overrides?.recipientEmail ? { recipientEmail: overrides.recipientEmail } : {}),
    ...(overrides?.recipientName ? { recipientName: overrides.recipientName } : {}),
    ...(overrides?.websiteUrl ? { websiteUrl: overrides.websiteUrl } : {}),
    ...(overrides?.senderEmail ? { senderEmail: overrides.senderEmail } : {}),
    ...(overrides?.senderName ? { senderName: overrides.senderName } : {}),
    ...(overrides?.replyTo ? { replyTo: overrides.replyTo } : {}),
  };

  const templates = overrides?.templates ? { ...DEFAULT_EMAIL_TEMPLATES, ...overrides.templates } : loadTemplates();
  const logs = loadLogs();
  const publishedMap = getPublishedTithiMap();

  const currentYear = targetYear || new Date().getFullYear();
  const tithiDate = publishedMap[currentYear] || '14 October';

  const scheduledDate =
    eventType === 'birthday_midnight'
      ? `28 September ${currentYear} · 12:00 AM IST`
      : eventType === 'birth_moment'
      ? `28 September ${currentYear} · 08:00 AM IST`
      : eventType === 'tithi'
      ? `${tithiDate} ${currentYear} · 08:00 AM IST`
      : eventType === 'advance'
      ? `Advance Birthday Dispatch (${currentYear})`
      : `Test Verification Dispatch (${new Date().toLocaleDateString()})`;

  const logMode: 'real' | 'test' | 'advance' =
    eventType === 'test' ? 'test' : eventType === 'advance' ? 'advance' : isManualTest ? 'test' : 'real';

  const attemptedAt = new Date().toISOString();

  // Check if template is enabled (for real automated triggers)
  if (!isManualTest && (eventType === 'birthday_midnight' || eventType === 'birth_moment' || eventType === 'tithi')) {
    const tmpl = templates[eventType];
    if (tmpl && tmpl.enabled === false) {
      const disabledLog: EmailLogEntry = {
        id: `disabled-${Date.now()}`,
        year: currentYear,
        eventType,
        mode: 'real',
        recipient: config.recipientEmail,
        scheduledDate,
        attemptedAt,
        status: 'SKIPPED_DUPLICATE',
        subject: `Skipped (Disabled in Settings)`,
        createdAt: attemptedAt,
      };
      return {
        success: false,
        message: `Event '${eventType}' is disabled in Admin Email Automation settings.`,
        log: disabledLog,
      };
    }
  }

  // Deduplication Check (Only applies to REAL automated dispatches)
  if (logMode === 'real') {
    const existing = logs.find(
      (l) =>
        l.year === currentYear &&
        l.eventType === eventType &&
        l.mode === 'real' &&
        (l.status === 'SENT' || l.status === 'SIMULATED')
    );
    if (existing) {
      const skippedLog: EmailLogEntry = {
        id: `skip-${Date.now()}`,
        year: currentYear,
        eventType,
        mode: 'real',
        recipient: config.recipientEmail,
        scheduledDate,
        attemptedAt,
        status: 'SKIPPED_DUPLICATE',
        subject: `[Skipped Duplicate] Already successfully sent for ${currentYear}`,
        createdAt: attemptedAt,
      };
      logs.unshift(skippedLog);
      saveLogs(logs);
      return {
        success: true,
        message: `Email for ${eventType} in ${currentYear} already sent. Skipped duplicate.`,
        log: skippedLog,
      };
    }
  }

  // Generate HTML & Subject with actual updated config name and variables
  let subject: string;
  let html: string;
  const context = {
    name: config.recipientName,
    year: currentYear,
    websiteUrl: config.websiteUrl,
    tithiDate,
    recipient: config.recipientEmail,
  };

  if (eventType === 'test') {
    const tmpl = templates.test;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate, recipient: config.recipientEmail });
    html = generateTestEmailHtml(tmpl, context);
  } else if (eventType === 'advance') {
    const tmpl = templates.advance;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate, recipient: config.recipientEmail });
    html = generateAdvanceEmailHtml(tmpl, context);
  } else if (eventType === 'birthday_midnight') {
    const tmpl = templates.birthday_midnight;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate });
    html = generateBirthdayMidnightEmailHtml(tmpl, context);
  } else if (eventType === 'birth_moment') {
    const tmpl = templates.birth_moment;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate });
    html = generateBirthMomentEmailHtml(tmpl, context);
  } else {
    // tithi
    const tmpl = templates.tithi;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate });
    html = generateTithiEmailHtml(tmpl, context);
  }

  const transporter = createTransporter(config);

  if (transporter) {
    try {
      const sendResult = await transporter.sendMail({
        from: `"${config.senderName || BIRTH_DETAILS.name + ' Celestial Journey'}" <${config.senderEmail || config.smtpUser}>`,
        to: config.recipientEmail,
        replyTo: config.replyTo || config.senderEmail,
        subject,
        html,
      });

      const sentAt = new Date().toISOString();
      const successLog: EmailLogEntry = {
        id: `log-${Date.now()}`,
        year: currentYear,
        eventType,
        mode: logMode,
        recipient: config.recipientEmail,
        scheduledDate,
        attemptedAt,
        sentAt,
        status: 'SENT',
        providerMessageId: sendResult.messageId,
        subject,
        createdAt: sentAt,
      };
      logs.unshift(successLog);
      saveLogs(logs);
      return { success: true, message: `Live email successfully delivered to ${config.recipientEmail}`, log: successLog };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failLog: EmailLogEntry = {
        id: `fail-${Date.now()}`,
        year: currentYear,
        eventType,
        mode: logMode,
        recipient: config.recipientEmail,
        scheduledDate,
        attemptedAt,
        status: 'FAILED',
        errorMessage: errorMsg,
        subject,
        createdAt: attemptedAt,
      };
      logs.unshift(failLog);
      saveLogs(logs);
      return { success: false, message: `Email delivery failed: ${errorMsg}`, log: failLog };
    }
  } else {
    // Simulated Mode
    const sentAt = new Date().toISOString();
    const simLog: EmailLogEntry = {
      id: `sim-${Date.now()}`,
      year: currentYear,
      eventType,
      mode: logMode,
      recipient: config.recipientEmail,
      scheduledDate,
      attemptedAt,
      sentAt,
      status: 'SIMULATED',
      providerMessageId: `sim_${Date.now()}_local`,
      subject,
      createdAt: sentAt,
    };
    logs.unshift(simLog);
    saveLogs(logs);
    return {
      success: true,
      message: `[Simulated Mode] Email for ${eventType} verified & logged successfully for ${config.recipientEmail}`,
      log: simLog,
    };
  }
}

// Scheduled check helper evaluated in India Standard Time (Asia/Kolkata)
async function runDailyCheck(triggerHour: 0 | 8 = 0) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);

  const currentYear = istDate.getFullYear();
  const currentMonth = istDate.getMonth() + 1; // 1-12
  const currentDay = istDate.getDate();
  const publishedMap = getPublishedTithiMap();

  console.log(`[Email Scheduler IST] TriggerHour: ${triggerHour}:00 IST | Date: ${currentYear}-${currentMonth}-${currentDay}`);

  if (triggerHour === 0) {
    // 12:00 AM Midnight Check
    if (currentMonth === 9 && currentDay === 28) {
      console.log(`[Email Scheduler] Birthday Midnight matched! Dispatching Email 1 (birthday_midnight)...`);
      await dispatchEmail('birthday_midnight', currentYear, false);
    }
  } else if (triggerHour === 8) {
    // 08:00 AM Morning Check
    if (currentMonth === 9 && currentDay === 28) {
      console.log(`[Email Scheduler] Birth Moment 08:00 AM matched! Dispatching Email 2 (birth_moment)...`);
      await dispatchEmail('birth_moment', currentYear, false);
    }

    // Check Tithi date for current year
    const tithiStr = publishedMap[currentYear];
    if (tithiStr) {
      const parts = tithiStr.split(' ');
      const tithiDay = parseInt(parts[0], 10);
      const tithiMonth = parts[1].toLowerCase().startsWith('sep') ? 9 : 10;

      if (currentMonth === tithiMonth && currentDay === tithiDay) {
        console.log(`[Email Scheduler] Yearly Tithi matched (${tithiStr})! Dispatching Email 3 (tithi)...`);
        await dispatchEmail('tithi', currentYear, false);
      }
    }
  }
}

// Schedule CRON jobs strictly in Asia/Kolkata timezone
// 1. Midnight Check (12:00 AM IST)
cron.schedule(
  '0 0 * * *',
  () => {
    runDailyCheck(0);
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

// 2. Morning Check (08:00 AM IST)
cron.schedule(
  '0 8 * * *',
  () => {
    runDailyCheck(8);
  },
  {
    timezone: 'Asia/Kolkata',
  }
);

// ==========================================
// API ROUTES
// ==========================================

// 1. GET /api/email/status - Comprehensive status overview
app.get('/api/email/status', (req, res) => {
  const config = loadConfig();
  const templates = loadTemplates();
  const logs = loadLogs();
  const publishedMap = getPublishedTithiMap();

  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);
  const currentYear = istDate.getFullYear();

  // Helper to determine delivery status for 3 real events
  const getEventDeliveryStatus = (eventType: 'birthday_midnight' | 'birth_moment' | 'tithi') => {
    const tmpl = templates[eventType];
    if (tmpl && tmpl.enabled === false) return 'DISABLED';

    const sentLog = logs.find(
      (l) => l.year === currentYear && l.eventType === eventType && l.mode === 'real' && (l.status === 'SENT' || l.status === 'SIMULATED')
    );
    if (sentLog) return 'SENT';

    const failLog = logs.find(
      (l) => l.year === currentYear && l.eventType === eventType && l.mode === 'real' && l.status === 'FAILED'
    );
    if (failLog) return 'FAILED';

    return 'SCHEDULED';
  };

  const deliveryStatus = {
    birthday_midnight: getEventDeliveryStatus('birthday_midnight'),
    birth_moment: getEventDeliveryStatus('birth_moment'),
    tithi: getEventDeliveryStatus('tithi'),
  };

  res.json({
    config,
    templates,
    deliveryStatus,
    serverTimeIST: istDate.toISOString(),
    currentYear,
    tithiDateCurrentYear: publishedMap[currentYear] || '14 October',
    latestLogs: logs.slice(0, 50),
  });
});

// 2. GET /api/email/config & POST /api/email/config
app.get('/api/email/config', (req, res) => {
  res.json(loadConfig());
});

app.post('/api/email/config', (req, res) => {
  try {
    const existing = loadConfig();
    const updated: EmailConfig = {
      ...existing,
      ...req.body,
    };
    saveConfig(updated);
    res.json({ success: true, config: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving config';
    res.status(500).json({ success: false, error: message });
  }
});

// 3. GET /api/email/templates & POST /api/email/templates
app.get('/api/email/templates', (req, res) => {
  res.json(loadTemplates());
});

app.post('/api/email/templates', (req, res) => {
  try {
    const existing = loadTemplates();
    const updated = {
      ...existing,
      ...req.body,
    };
    saveTemplates(updated);
    res.json({ success: true, templates: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving templates';
    res.status(500).json({ success: false, error: message });
  }
});

// 4. POST /api/email/test-send - Test or manual dispatch
app.post('/api/email/test-send', async (req, res) => {
  try {
    const { type, year, recipientEmail, recipientName, websiteUrl, senderEmail, senderName, replyTo, templates } = req.body;

    // Auto-persist latest parameters from the frontend request if provided
    if (recipientEmail || recipientName || websiteUrl || senderEmail || senderName || replyTo) {
      const curConfig = loadConfig();
      const updatedConfig = {
        ...curConfig,
        ...(recipientEmail ? { recipientEmail } : {}),
        ...(recipientName ? { recipientName } : {}),
        ...(websiteUrl ? { websiteUrl } : {}),
        ...(senderEmail ? { senderEmail } : {}),
        ...(senderName ? { senderName } : {}),
        ...(replyTo ? { replyTo } : {}),
      };
      saveConfig(updatedConfig);
    }

    if (templates) {
      const curTemplates = loadTemplates();
      const updatedTemplates = {
        ...curTemplates,
        ...templates,
      };
      saveTemplates(updatedTemplates);
    }

    const validTypes = ['test', 'advance', 'birthday_midnight', 'birth_moment', 'tithi'];
    const eventType = validTypes.includes(type) ? type : 'test';

    const result = await dispatchEmail(
      eventType as 'test' | 'advance' | 'birthday_midnight' | 'birth_moment' | 'tithi',
      year ? parseInt(year, 10) : undefined,
      true, // Manual test send from Admin UI
      {
        recipientEmail,
        recipientName,
        websiteUrl,
        senderEmail,
        senderName,
        replyTo,
        templates,
      }
    );

    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Send error';
    res.status(500).json({ success: false, message });
  }
});

// 5. GET /api/email/preview/:type - Live HTML render for preview
app.get('/api/email/preview/:type', (req, res) => {
  const { type } = req.params;
  const config = loadConfig();
  const templates = loadTemplates();
  const publishedMap = getPublishedTithiMap();
  const currentYear = new Date().getFullYear();
  const tithiDate = publishedMap[currentYear] || '14 October';

  const context = {
    name: config.recipientName,
    year: currentYear,
    websiteUrl: config.websiteUrl,
    tithiDate,
    recipient: config.recipientEmail,
  };

  let html: string;
  if (type === 'advance') {
    html = generateAdvanceEmailHtml(templates.advance, context);
  } else if (type === 'birthday_midnight') {
    html = generateBirthdayMidnightEmailHtml(templates.birthday_midnight, context);
  } else if (type === 'birth_moment') {
    html = generateBirthMomentEmailHtml(templates.birth_moment, context);
  } else if (type === 'tithi') {
    html = generateTithiEmailHtml(templates.tithi, context);
  } else {
    html = generateTestEmailHtml(templates.test, context);
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// 6. POST /api/email/run-check - Manually trigger scheduler check
app.post('/api/email/run-check', async (req, res) => {
  const { triggerHour } = req.body;
  await runDailyCheck(triggerHour === 8 ? 8 : 0);
  res.json({ success: true, message: `Scheduler check triggered for ${triggerHour || 0}:00 IST` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✨ [SIRI Birthday Backend] Email Automation server active on port ${PORT}`);
  console.log(`✨ [SIRI Birthday Backend] Scheduler configured for Asia/Kolkata (IST)`);
});
