import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import {
  generateBirthdayMidnightEmailHtml,
  generateBirthMomentEmailHtml,
  generateTithiEmailHtml,
  generateAdvanceTestEmailHtml,
  DEFAULT_EMAIL_TEMPLATES,
  replaceEmailVariables,
  type AllEmailTemplates,
  type CustomEmailTemplateConfig,
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
  websiteUrl: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  isSimulatedMode: boolean;
}

export interface EmailLogEntry {
  id: string;
  recipient: string;
  year: number;
  eventType: 'birthday_midnight' | 'birth_moment' | 'tithi' | 'test';
  mode: 'test' | 'real';
  scheduledDate: string;
  sentTimestamp: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED' | 'SKIPPED_DUPLICATE';
  subject: string;
  error?: string;
}

const DEFAULT_CONFIG: EmailConfig = {
  recipientEmail: 'siri@example.com',
  recipientName: 'SIRI',
  senderEmail: 'blessings@divinejourney.com',
  websiteUrl: 'http://localhost:5173',
  isSimulatedMode: true,
};

function loadConfig(): EmailConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
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
  // Initial verified seed
  INITIAL_VERIFIED_DATES.forEach((item) => {
    if (item.status === 'published') {
      map[item.year] = item.date;
    }
  });

  // Check if custom server DB file exists
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
  eventType: 'birthday_midnight' | 'birth_moment' | 'tithi' | 'test',
  targetYear: number,
  isManualTest: boolean = false
): Promise<{ success: boolean; message: string; log: EmailLogEntry }> {
  const config = loadConfig();
  const templates = loadTemplates();
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
      : `Advance Test Dispatch (${new Date().toLocaleDateString()})`;

  const logMode: 'test' | 'real' = isManualTest || eventType === 'test' ? 'test' : 'real';

  // Check if template is enabled (for real automated triggers)
  if (!isManualTest && eventType !== 'test') {
    const tmpl = templates[eventType];
    if (tmpl && tmpl.enabled === false) {
      return {
        success: false,
        message: `Event '${eventType}' is disabled in Admin Email Automation settings.`,
        log: {
          id: `disabled-${Date.now()}`,
          recipient: config.recipientEmail,
          year: currentYear,
          eventType,
          mode: 'real',
          scheduledDate,
          sentTimestamp: new Date().toISOString(),
          status: 'SKIPPED_DUPLICATE',
          subject: `Skipped (Disabled in Settings)`,
        },
      };
    }
  }

  // Deduplication Check (Only applies to REAL automated dispatches)
  if (!isManualTest && eventType !== 'test') {
    const existing = logs.find(
      (l) => l.year === currentYear && l.eventType === eventType && l.mode === 'real' && (l.status === 'SENT' || l.status === 'SIMULATED')
    );
    if (existing) {
      const skippedLog: EmailLogEntry = {
        id: `skip-${Date.now()}`,
        recipient: config.recipientEmail,
        year: currentYear,
        eventType,
        mode: 'real',
        scheduledDate,
        sentTimestamp: new Date().toISOString(),
        status: 'SKIPPED_DUPLICATE',
        subject: `[Skipped Duplicate] Already sent for ${currentYear}`,
      };
      logs.unshift(skippedLog);
      saveLogs(logs);
      return { success: true, message: `Email for ${eventType} in ${currentYear} already sent. Skipped duplicate.`, log: skippedLog };
    }
  }

  // Generate HTML & Subject
  let subject: string;
  let html: string;
  const context = {
    name: config.recipientName,
    year: currentYear,
    websiteUrl: config.websiteUrl,
    tithiDate,
  };

  if (eventType === 'test') {
    const tmpl = templates.advance_test;
    subject = replaceEmailVariables(tmpl.subject, { name: config.recipientName, currentYear, tithiDate });
    html = generateAdvanceTestEmailHtml(tmpl, context);
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
      await transporter.sendMail({
        from: `"${BIRTH_DETAILS.name} Celestial Journey" <${config.senderEmail || config.smtpUser}>`,
        to: config.recipientEmail,
        subject,
        html,
      });

      const successLog: EmailLogEntry = {
        id: `log-${Date.now()}`,
        recipient: config.recipientEmail,
        year: currentYear,
        eventType,
        mode: logMode,
        scheduledDate,
        sentTimestamp: new Date().toISOString(),
        status: 'SENT',
        subject,
      };
      logs.unshift(successLog);
      saveLogs(logs);
      return { success: true, message: `Live email successfully delivered to ${config.recipientEmail}`, log: successLog };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failLog: EmailLogEntry = {
        id: `fail-${Date.now()}`,
        recipient: config.recipientEmail,
        year: currentYear,
        eventType,
        mode: logMode,
        scheduledDate,
        sentTimestamp: new Date().toISOString(),
        status: 'FAILED',
        subject,
        error: errorMsg,
      };
      logs.unshift(failLog);
      saveLogs(logs);
      return { success: false, message: `Email failed to send: ${errorMsg}`, log: failLog };
    }
  } else {
    // Simulated Mode
    const simLog: EmailLogEntry = {
      id: `sim-${Date.now()}`,
      recipient: config.recipientEmail,
      year: currentYear,
      eventType,
      mode: logMode,
      scheduledDate,
      sentTimestamp: new Date().toISOString(),
      status: 'SIMULATED',
      subject,
    };
    logs.unshift(simLog);
    saveLogs(logs);
    return {
      success: true,
      message: `[Simulated Mode] Email for ${eventType} logged & verified successfully for ${config.recipientEmail}`,
      log: simLog,
    };
  }
}

// Scheduled check helper evaluated in India Standard Time (Asia/Kolkata)
async function runDailyCheck(triggerHour: 0 | 8 = 0) {
  // Compute date in IST (UTC+05:30)
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
      await dispatchEmail('birthday_midnight', currentYear);
    }
  } else if (triggerHour === 8) {
    // 08:00 AM Morning Check
    if (currentMonth === 9 && currentDay === 28) {
      console.log(`[Email Scheduler] Birth Moment 08:00 AM matched! Dispatching Email 2 (birth_moment)...`);
      await dispatchEmail('birth_moment', currentYear);
    }

    // Check Tithi date for current year
    const tithiStr = publishedMap[currentYear];
    if (tithiStr) {
      const parts = tithiStr.split(' ');
      const tithiDay = parseInt(parts[0], 10);
      const tithiMonth = parts[1].toLowerCase().startsWith('sep') ? 9 : 10;

      if (currentMonth === tithiMonth && currentDay === tithiDay) {
        console.log(`[Email Scheduler] Yearly Tithi matched (${tithiStr}) from database! Dispatching Email 3 (tithi)...`);
        await dispatchEmail('tithi', currentYear);
      }
    }
  }
}

// Cron 1: Every day at 00:00:00 IST (18:30 UTC previous day)
cron.schedule(
  '0 0 * * *',
  () => {
    runDailyCheck(0);
  },
  { timezone: 'Asia/Kolkata' }
);

// Cron 2: Every day at 08:00:00 IST (02:30 UTC)
cron.schedule(
  '0 8 * * *',
  () => {
    runDailyCheck(8);
  },
  { timezone: 'Asia/Kolkata' }
);

// ================= API ROUTES =================

// 1. Get Status & Summary
app.get('/api/email/status', (_req, res) => {
  const config = loadConfig();
  const templates = loadTemplates();
  const logs = loadLogs();
  const publishedMap = getPublishedTithiMap();
  const currentYear = new Date().getFullYear();

  const upcomingSchedule = [];
  const years = Object.keys(publishedMap).map(Number).sort((a, b) => a - b);
  for (const yr of years) {
    if (yr >= currentYear) {
      upcomingSchedule.push({
        year: yr,
        birthdayMidnight: `28 September ${yr} · 12:00 AM IST`,
        birthMoment: `28 September ${yr} · 08:00 AM IST`,
        tithiDate: `${publishedMap[yr]} ${yr} · 08:00 AM IST`,
      });
    }
  }

  res.json({
    status: 'ONLINE',
    schedulerActive: true,
    timezone: 'Asia/Kolkata (IST)',
    config: {
      ...config,
      smtpPass: config.smtpPass ? '••••••••' : '',
    },
    templates,
    logs,
    upcomingSchedule,
  });
});

// 2. Update Configuration
app.post('/api/email/config', (req, res) => {
  const currentConfig = loadConfig();
  const newConfig: EmailConfig = {
    ...currentConfig,
    ...req.body,
  };

  if (req.body.smtpPass === '••••••••' || !req.body.smtpPass) {
    newConfig.smtpPass = currentConfig.smtpPass;
  }

  saveConfig(newConfig);
  res.json({ success: true, config: { ...newConfig, smtpPass: newConfig.smtpPass ? '••••••••' : '' } });
});

// 3. Get Templates
app.get('/api/email/templates', (_req, res) => {
  const templates = loadTemplates();
  res.json(templates);
});

// 4. Save Templates Customization
app.post('/api/email/templates', (req, res) => {
  const currentTemplates = loadTemplates();
  const updated: AllEmailTemplates = {
    ...currentTemplates,
    ...req.body,
  };
  saveTemplates(updated);
  res.json({ success: true, templates: updated });
});

// 5. Trigger Test Email Dispatch
app.post('/api/email/test-send', async (req, res) => {
  const { eventType, year } = req.body;
  const targetType = eventType || 'test';
  const result = await dispatchEmail(targetType, year || new Date().getFullYear(), true);
  res.json(result);
});

// 6. Manually Run Scheduler Check
app.post('/api/email/run-check', async (req, res) => {
  const hour = req.body.hour === 8 ? 8 : 0;
  await runDailyCheck(hour);
  res.json({ success: true, message: `Scheduler check completed for ${hour}:00 IST.` });
});

// 7. Interactive HTML Email Preview
app.get('/api/email/preview/:type', (req, res) => {
  const type = req.params.type;
  const config = loadConfig();
  const templates = loadTemplates();
  const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
  const publishedMap = getPublishedTithiMap();
  const tithiDate = publishedMap[year] || '14 October';

  const context = {
    name: config.recipientName,
    year,
    websiteUrl: config.websiteUrl,
    tithiDate,
  };

  if (type === 'birthday_midnight') {
    res.send(generateBirthdayMidnightEmailHtml(templates.birthday_midnight, context));
  } else if (type === 'birth_moment') {
    res.send(generateBirthMomentEmailHtml(templates.birth_moment, context));
  } else if (type === 'tithi') {
    res.send(generateTithiEmailHtml(templates.tithi, context));
  } else {
    // advance_test or test
    res.send(generateAdvanceTestEmailHtml(templates.advance_test, context));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✨ SIRI Living Birthday & 3-Tier Email Automation Server running on http://localhost:${PORT}`);
});
