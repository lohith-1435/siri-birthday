import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { generateBirthdayEmailHtml, generateTithiEmailHtml, generateAdvanceTestEmailHtml } from './emailTemplates';
import { BIRTH_DETAILS } from '../src/data/timelineData';
import { INITIAL_VERIFIED_DATES } from '../src/services/tithiService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data storage paths
const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'email_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');
const TITHI_DB_FILE = path.join(DATA_DIR, 'tithi_dates.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface EmailConfig {
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
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
  eventType: 'birthday' | 'tithi' | 'test';
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
  // Initial seed through 2030
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

// Core dispatch function with separate test/real safety
async function dispatchEmail(
  eventType: 'birthday' | 'tithi' | 'test',
  targetYear: number,
  isManualTest: boolean = false
): Promise<{ success: boolean; message: string; log: EmailLogEntry }> {
  const config = loadConfig();
  const logs = loadLogs();
  const publishedMap = getPublishedTithiMap();

  const currentYear = targetYear || new Date().getFullYear();
  const tithiDate = publishedMap[currentYear] || '14 October';
  const scheduledDate =
    eventType === 'birthday'
      ? `28 September ${currentYear}`
      : eventType === 'tithi'
      ? `${tithiDate} ${currentYear}`
      : `Test Dispatch (${new Date().toLocaleDateString()})`;

  const logMode: 'test' | 'real' = isManualTest || eventType === 'test' ? 'test' : 'real';

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
        subject: eventType === 'birthday' ? `Happy Birthday, ${config.recipientName} ✨` : `A Divine Birthday Blessing ✨`,
      };
      logs.unshift(skippedLog);
      saveLogs(logs);
      return { success: true, message: `Email for ${eventType} in ${currentYear} already sent. Skipped duplicate.`, log: skippedLog };
    }
  }

  // Determine Subject and HTML based on eventType and mode
  let subject: string;
  let html: string;

  if (eventType === 'test') {
    subject = `A Little Early… But Happy Birthday, ${config.recipientName} ✨`;
    html = generateAdvanceTestEmailHtml(config.recipientName, currentYear);
  } else if (eventType === 'birthday') {
    if (isManualTest) {
      // If manual test before real birthday
      subject = `A Little Early… But Happy Birthday, ${config.recipientName} ✨`;
      html = generateAdvanceTestEmailHtml(config.recipientName, currentYear);
    } else {
      // Real birthday email on 28 September
      subject = `Happy Birthday, ${config.recipientName} ✨`;
      html = generateBirthdayEmailHtml(config.recipientName, currentYear);
    }
  } else {
    // Tithi email
    subject = `A Divine Birthday Blessing ✨ (${BIRTH_DETAILS.tithi})`;
    html = generateTithiEmailHtml(config.recipientName, currentYear, tithiDate);
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


// Check today's date against database scheduled dates
async function runDailyCheck() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();
  const publishedMap = getPublishedTithiMap();

  console.log(`[Email Scheduler] Running daily check for date: ${currentYear}-${currentMonth}-${currentDay}`);

  // Event 1: Fixed Birthday (28 September -> month 9, day 28)
  if (currentMonth === 9 && currentDay === 28) {
    console.log(`[Email Scheduler] Fixed Birthday matched! Dispatching Birthday Email...`);
    await dispatchEmail('birthday', currentYear);
  }

  // Event 2: Tithi Return Date from Database for current year
  const tithiStr = publishedMap[currentYear];
  if (tithiStr) {
    const parts = tithiStr.split(' ');
    const tithiDay = parseInt(parts[0], 10);
    const tithiMonth = parts[1].toLowerCase().startsWith('sep') ? 9 : 10;

    if (currentMonth === tithiMonth && currentDay === tithiDay) {
      console.log(`[Email Scheduler] Yearly Tithi matched (${tithiStr}) from database! Dispatching Tithi Email...`);
      await dispatchEmail('tithi', currentYear);
    }
  }
}

// Schedule cron job every day at midnight (00:00:00)
cron.schedule('0 0 * * *', () => {
  runDailyCheck();
});

// ================= API ROUTES =================

// 1. Get Status & Logs
app.get('/api/email/status', (_req, res) => {
  const config = loadConfig();
  const logs = loadLogs();
  const publishedMap = getPublishedTithiMap();
  const currentYear = new Date().getFullYear();

  const upcomingSchedule = [];
  const years = Object.keys(publishedMap).map(Number).sort((a, b) => a - b);
  for (const yr of years) {
    if (yr >= currentYear) {
      upcomingSchedule.push({
        year: yr,
        fixedDate: `28 September ${yr}`,
        tithiDate: `${publishedMap[yr]} ${yr}`,
      });
    }
  }

  res.json({
    status: 'ONLINE',
    schedulerActive: true,
    cronExpression: '0 0 * * * (Daily at Midnight)',
    config: {
      ...config,
      smtpPass: config.smtpPass ? '••••••••' : '',
    },
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

// 3. Trigger Test Dispatch
app.post('/api/email/test-send', async (req, res) => {
  const { eventType, year } = req.body;
  const result = await dispatchEmail(eventType || 'birthday', year || new Date().getFullYear(), true);
  res.json(result);
});

// 4. Manually Run Scheduler Check
app.post('/api/email/run-check', async (_req, res) => {
  await runDailyCheck();
  res.json({ success: true, message: 'Scheduler check completed.' });
});

// 5. HTML Preview
app.get('/api/email/preview/:type', (req, res) => {
  const type = req.params.type;
  const config = loadConfig();
  const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();
  const publishedMap = getPublishedTithiMap();
  const tithiDate = publishedMap[year] || '14 October';

  if (type === 'tithi') {
    res.send(generateTithiEmailHtml(config.recipientName, year, tithiDate));
  } else if (type === 'advance' || type === 'test') {
    res.send(generateAdvanceTestEmailHtml(config.recipientName, year));
  } else {
    res.send(generateBirthdayEmailHtml(config.recipientName, year));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✨ SIRI Living Birthday & Email Automation Server running on http://localhost:${PORT}`);
});

