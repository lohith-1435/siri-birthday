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
import {
  DATA_DIR,
  CONFIG_FILE,
  LOGS_FILE,
  TEMPLATES_FILE,
  SNAPSHOTS_FILE,
  RECIPIENTS_FILE,
  ACTIVITY_FILE,
  AUTH_FILE,
  DEFAULT_PROFILES,
  DEFAULT_CONFIG,
  isSupabaseConfigured,
  supabase,
  type DestinationProfileKey,
  type DestinationProfile,
  type EmailConfig,
  type AutomationActivity,
  type SentLogRecord,
  loadEmailConfigAsync,
  loadEmailConfigSync,
  saveEmailConfigAsync,
  loadEmailDataAsync,
  loadEmailDataSync,
  saveEmailDataAsync,
  loadEmailLogsAsync,
  loadEmailLogsSync,
  saveEmailLogsAsync,
  loadSnapshotsAsync,
  loadSnapshotsSync,
  saveSnapshotsAsync,
  loadAutomationActivityAsync,
  loadAutomationActivitySync,
  recordAutomationActivityAsync
} from './storage.js';

export {
  type DestinationProfileKey,
  type DestinationProfile,
  type EmailConfig,
  type AutomationActivity,
  type SentLogRecord
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

export function resolveDestinationEmail(
  destinationProfile?: string,
  config?: EmailConfig
): { email: string; label: string; profile: string; name: string } {
  const cfg = config || loadEmailConfigSync();
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

export function recordAutomationActivity(type: AutomationActivity['type'], message: string, details?: unknown) {
  recordAutomationActivityAsync(type, message, details).catch(() => {});
}

function loadEmailConfig(): EmailConfig {
  return loadEmailConfigSync();
}

function saveEmailConfig(config: EmailConfig) {
  saveEmailConfigAsync(config).catch(() => {});
}

function loadEmailData(): { items: EmailItem[] } {
  return loadEmailDataSync();
}

function saveEmailData(items: EmailItem[]) {
  saveEmailDataAsync(items).catch(() => {});
}

function loadEmailLogs(): SentLogRecord[] {
  return loadEmailLogsSync();
}

function saveEmailLogs(logs: SentLogRecord[]) {
  saveEmailLogsAsync(logs).catch(() => {});
}

function loadSnapshots(): Record<string, ReferenceSnapshot> {
  return loadSnapshotsSync();
}

function saveSnapshots(snapshots: Record<string, ReferenceSnapshot>) {
  saveSnapshotsAsync(snapshots).catch(() => {});
}

// -------------------------------------------------------------
// IST TIME HELPER
// -------------------------------------------------------------

export function getIstTime(): { now: Date; dateStr: string; timeStr: string; displayString: string; rawIso: string } {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = istFormatter.formatToParts(now);
  const find = (t: string) => parts.find((p) => p.type === t)?.value || '00';
  const year = find('year');
  const month = find('month');
  const day = find('day');
  const hour = find('hour');
  const minute = find('minute');
  const second = find('second');

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hour}:${minute}`;
  const displayString = `${day}/${month}/${year}, ${hour}:${minute}:${second} IST`;

  return { now, dateStr, timeStr, displayString, rawIso: now.toISOString() };
}

// -------------------------------------------------------------
// SCHEDULER & EMAIL SENDER
// -------------------------------------------------------------

let isSchedulerRunning = false;

export async function sendEmail(
  item: EmailItem,
  options: {
    isTest?: boolean;
    overrideRecipient?: string;
    overrideSubject?: string;
  } = {}
): Promise<{ success: boolean; info?: any; error?: string; targetEmail: string; messageId?: string }> {
  const config = await loadEmailConfigAsync();
  const dest = resolveDestinationEmail(item.destinationProfile, config);
  const targetEmail = options.overrideRecipient || dest.email;

  const effectiveDisplayName = (config.emailDisplayName && config.emailDisplayName.trim())
    || (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim())
    || 'SIRI BANGARAM';

  if (!config.smtpUser || !config.smtpPass) {
    const errorMsg = 'SMTP credentials not configured in email_config.json or environment';
    console.error(`[Email Error]: ${errorMsg}`);
    return { success: false, error: errorMsg, targetEmail };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost || 'smtp.gmail.com',
      port: config.smtpPort || 465,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });

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
    const logs = await loadEmailLogsAsync();
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
      scheduledTime: `${item.scheduleDate || dateStr} ${item.scheduleTime || timeStr} IST`,
      sentDate: dateStr,
      sentTime: timeStr,
      sentAt: new Date().toISOString(),
      status: 'SENT',
      messageId: info.messageId
    };

    logs.unshift(newLog);
    await saveEmailLogsAsync(logs);

    await recordAutomationActivityAsync(
      'SEND_SUCCESS',
      `Email "${item.name}" sent to ${dest.label} (${targetEmail})`,
      { messageId: info.messageId, subject: item.subject, profile: dest.profile }
    );

    return {
      success: true,
      info,
      targetEmail,
      messageId: info.messageId
    };
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown SMTP error';
    console.error(`[Email Send Error] Failed for ${item.id}:`, errorMsg);

    const { dateStr, timeStr } = getIstTime();
    const logs = await loadEmailLogsAsync();
    const failedLog: SentLogRecord = {
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
      scheduledTime: `${item.scheduleDate || dateStr} ${item.scheduleTime || timeStr} IST`,
      sentDate: dateStr,
      sentTime: timeStr,
      sentAt: new Date().toISOString(),
      status: 'FAILED',
      error: errorMsg
    };

    logs.unshift(failedLog);
    await saveEmailLogsAsync(logs);

    await recordAutomationActivityAsync(
      'SEND_FAIL',
      `Failed to send "${item.name}" to ${dest.label} (${targetEmail}): ${errorMsg}`,
      { error: errorMsg }
    );

    return { success: false, error: errorMsg, targetEmail };
  }
}

export async function runSchedulerTick(): Promise<{
  checkedCount: number;
  sentCount: number;
  skippedReason?: string;
  sentItems: string[];
  timestampIST: string;
}> {
  if (isSchedulerRunning) {
    return { checkedCount: 0, sentCount: 0, skippedReason: 'Mutex locked', sentItems: [], timestampIST: getIstTime().displayString };
  }

  isSchedulerRunning = true;
  try {
    const config = await loadEmailConfigAsync();
    const { dateStr, timeStr, displayString } = getIstTime();

    if (!config.autoSendEnabled) {
      return { checkedCount: 0, sentCount: 0, skippedReason: 'Automation switch is OFF', sentItems: [], timestampIST: displayString };
    }

    const { items } = await loadEmailDataAsync();
    const [currentHour, currentMinute] = timeStr.split(':').map(Number);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const dueItems = items.filter((item) => {
      if (!item.enabled) return false;
      const statusUpper = (item.status || '').toUpperCase();
      const isSched = statusUpper === 'SCHEDULED' || statusUpper === 'READY' || statusUpper === 'PENDING';
      if (!isSched) return false;
      if (!item.scheduleDate || !item.scheduleTime) return false;

      if (item.scheduleDate < dateStr) return true;
      if (item.scheduleDate === dateStr) {
        const [schedHour, schedMinute] = item.scheduleTime.split(':').map(Number);
        const schedTotalMinutes = schedHour * 60 + schedMinute;
        return currentTotalMinutes >= schedTotalMinutes;
      }
      return false;
    });

    const sentItems: string[] = [];

    for (const item of dueItems) {
      const result = await sendEmail(item);
      if (result.success) {
        item.status = 'SENT';
        item.sentAt = new Date().toISOString();
        sentItems.push(item.id);
      } else {
        item.status = 'FAILED';
        item.lastError = result.error;
      }
    }

    if (dueItems.length > 0) {
      await saveEmailDataAsync(items);
    }

    return {
      checkedCount: items.length,
      sentCount: sentItems.length,
      sentItems,
      timestampIST: displayString
    };
  } finally {
    isSchedulerRunning = false;
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS (CONNECTED TO CLOUD DATABASE & VERCEL)
// -------------------------------------------------------------

app.get('/api/automation/health', async (_req, res) => {
  const config = await loadEmailConfigAsync();
  const { items } = await loadEmailDataAsync();
  const logs = await loadEmailLogsAsync();
  const { dateStr, timeStr, displayString } = getIstTime();

  const [currentHour, currentMinute] = timeStr.split(':').map(Number);
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const scheduled = items.filter((i) => {
    const s = (i.status || '').toUpperCase();
    return s === 'SCHEDULED' || s === 'READY' || s === 'PENDING';
  });

  const nextUpcoming = scheduled.slice(0, 5);
  const sentCount = logs.filter((l) => l.status === 'SENT').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

  const todaysScheduled = scheduled.filter((i) => i.scheduleDate === dateStr);
  const todaysList = todaysScheduled.length > 0 ? todaysScheduled : scheduled.slice(0, 5);
  const todaysDispatch = todaysList.map((i) => {
    const dest = resolveDestinationEmail(i.destinationProfile, config);
    return {
      id: i.id,
      time: i.scheduleTime || '11:00',
      name: i.name,
      subject: i.subject,
      destinationProfile: dest.profile,
      destinationLabel: dest.label,
      recipientEmail: dest.email,
      status: i.status || 'SCHEDULED',
      isSent: i.status === 'SENT'
    };
  });

  res.json({
    success: true,
    schedulerRunning: true,
    automationEnabled: config.autoSendEnabled,
    currentTimeIST: displayString,
    currentDateIST: dateStr,
    currentTimeOnlyIST: timeStr,
    scheduledTotal: scheduled.length,
    sentTotal: sentCount,
    failedTotal: failedCount,
    cloudDbConnected: isSupabaseConfigured,
    upcomingFive: nextUpcoming,
    todaysDispatch,
    smtpConfigured: Boolean(config.smtpUser && config.smtpPass)
  });
});

app.post('/api/automation/health-check', async (_req, res) => {
  const config = await loadEmailConfigAsync();
  const { items } = await loadEmailDataAsync();
  const { dateStr, timeStr } = getIstTime();

  const checks = [
    {
      name: 'Cloud Database Connection',
      status: isSupabaseConfigured ? 'HEALTHY' : 'LOCAL_STORAGE',
      message: isSupabaseConfigured ? 'Connected to Supabase Cloud PostgreSQL (Multi-Device Shared Storage Active)' : 'Operating with Local & Serverless In-Memory Storage'
    },
    {
      name: 'Scheduler Engine',
      status: 'HEALTHY',
      message: `Scheduler Active in IST (Current: ${dateStr} ${timeStr})`
    },
    {
      name: 'Automation Master Switch',
      status: config.autoSendEnabled ? 'HEALTHY' : 'PAUSED',
      message: config.autoSendEnabled ? 'Automation is ON and dispatching per schedule' : 'Automation is paused'
    },
    {
      name: 'SMTP Relay Authentication',
      status: (config.smtpUser && config.smtpPass) ? 'HEALTHY' : 'WARNING',
      message: (config.smtpUser && config.smtpPass) ? `Configured for ${config.smtpUser}` : 'SMTP Credentials missing'
    },
    {
      name: 'Active Email Templates Library',
      status: items.length >= 12 ? 'HEALTHY' : 'WARNING',
      message: `${items.length} master templates available in library`
    }
  ];

  await recordAutomationActivityAsync('HEALTH_CHECK', 'Full automation diagnostics run completed');
  res.json({
    success: true,
    overallStatus: 'HEALTHY',
    timestamp: new Date().toISOString(),
    checks
  });
});

app.get('/api/automation/activity', async (_req, res) => {
  const activities = await loadAutomationActivityAsync();
  res.json({ success: true, activities });
});

app.post('/api/admin/settings/name', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }
  const config = await loadEmailConfigAsync();
  config.websiteName = name.trim();
  config.displayName = name.trim();
  await saveEmailConfigAsync(config);
  await recordAutomationActivityAsync('ADMIN_ACTION', `Website name updated to: "${config.websiteName}"`);
  res.json({ success: true, name: config.websiteName });
});

app.post('/api/admin/settings/email-display-name', async (req, res) => {
  const { emailDisplayName } = req.body;
  if (!emailDisplayName || typeof emailDisplayName !== 'string') {
    return res.status(400).json({ error: 'Email display name is required' });
  }
  const config = await loadEmailConfigAsync();
  config.emailDisplayName = emailDisplayName.trim();
  await saveEmailConfigAsync(config);
  await recordAutomationActivityAsync('ADMIN_ACTION', `Email display name updated to: "${config.emailDisplayName}"`);
  res.json({ success: true, emailDisplayName: config.emailDisplayName });
});

app.post('/api/email/automation-switch', async (req, res) => {
  const { enabled } = req.body;
  const config = await loadEmailConfigAsync();
  config.autoSendEnabled = Boolean(enabled);
  await saveEmailConfigAsync(config);

  await recordAutomationActivityAsync(
    config.autoSendEnabled ? 'AUTO_RESUMED' : 'AUTO_PAUSED',
    `Automation master switch set to ${config.autoSendEnabled ? 'ON' : 'OFF'}`
  );

  res.json({
    success: true,
    autoSendEnabled: config.autoSendEnabled,
    status: config.autoSendEnabled ? 'ACTIVE' : 'PAUSED'
  });
});

app.get('/api/email/pending-missed', async (_req, res) => {
  const { items } = await loadEmailDataAsync();
  const missed = items.filter((i) => i.status === 'PENDING' || i.status === 'MISSED');
  res.json({ success: true, count: missed.length, pendingItems: missed });
});

app.get('/api/email/config', async (_req, res) => {
  const config = await loadEmailConfigAsync();
  res.json({
    success: true,
    websiteName: config.websiteName,
    emailDisplayName: config.emailDisplayName,
    autoSendEnabled: config.autoSendEnabled,
    destinations: config.destinations || DEFAULT_PROFILES,
    fromEmail: config.fromEmail,
    smtpUser: config.smtpUser,
    cloudDbConnected: isSupabaseConfigured
  });
});

app.post('/api/email/config', async (req, res) => {
  const current = await loadEmailConfigAsync();
  const updated: EmailConfig = {
    ...current,
    ...req.body,
    destinations: {
      ...current.destinations,
      ...(req.body.destinations || {})
    }
  };
  await saveEmailConfigAsync(updated);
  await recordAutomationActivityAsync('ADMIN_ACTION', 'Email configuration updated');
  res.json({ success: true, config: updated });
});

app.get('/api/admin/recipients', async (_req, res) => {
  const config = await loadEmailConfigAsync();
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

app.post('/api/admin/recipients', async (req, res) => {
  const { id, email, label, name, status, description } = req.body;
  if (!id || !email) {
    return res.status(400).json({ error: 'Recipient Profile ID and email are required' });
  }

  const config = await loadEmailConfigAsync();
  const profKey = (id as string).toUpperCase().trim().replace(/\s+/g, '_');

  config.destinations = config.destinations || { ...DEFAULT_PROFILES };
  const prev = (config.destinations as any)[profKey] || DEFAULT_PROFILES[profKey] || {
    id: profKey,
    label: label || profKey,
    name: name || `${profKey} Profile`,
    status: 'ACTIVE',
    description: description || ''
  };

  (config.destinations as any)[profKey] = {
    ...prev,
    id: profKey,
    email: email.trim(),
    label: label || prev.label || profKey,
    name: name || prev.name || `${profKey} Profile`,
    status: (status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
    description: description !== undefined ? description : prev.description,
    updatedAt: new Date().toISOString()
  };

  await saveEmailConfigAsync(config);
  await recordAutomationActivityAsync('ADMIN_ACTION', `Recipient profile ${profKey} updated to "${email.trim()}" [${status || 'ACTIVE'}]`);

  return res.json({
    success: true,
    destination: (config.destinations as any)[profKey],
    destinations: config.destinations
  });
});

app.post('/api/admin/recipients/:id/test', async (req, res) => {
  const { id } = req.params;
  const config = await loadEmailConfigAsync();
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
Timezone: Asia/Kolkata (IST)`,
    websiteUrl: config.websiteUrl || DEFAULT_WEBSITE_URL,
    linkAlias: 'VIEW VERIFIED EXPERIENCE →',
    buttonText: 'VIEW VERIFIED EXPERIENCE →',
    scheduleDate: getIstTime().dateStr,
    scheduleTime: getIstTime().timeStr,
    status: 'READY',
    enabled: true
  };

  const result = await sendEmail(testItem, { isTest: true, overrideRecipient: dest.email });

  if (result.success) {
    res.json({
      success: true,
      message: `Verification email sent to ${dest.label} (${dest.email})`,
      dest,
      info: result.info
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error,
      dest
    });
  }
});

// Master Email Templates Library (Reusable Master Templates)
app.get('/api/email/templates', async (_req, res) => {
  const { items } = await loadEmailDataAsync();
  const masterTemplates = items.filter((it) => !it.id.startsWith('sched_') && !it.id.startsWith('resched_'));
  res.json({
    success: true,
    templates: masterTemplates.length > 0 ? masterTemplates : DEFAULT_EMAIL_ITEMS
  });
});

// Scheduled Emails Queue
app.get('/api/email/scheduled', async (_req, res) => {
  const { items } = await loadEmailDataAsync();
  const scheduled = items.filter((it) => {
    const s = (it.status || '').toUpperCase();
    return s === 'SCHEDULED' || s === 'READY' || s === 'PENDING';
  });

  res.json({
    success: true,
    count: scheduled.length,
    scheduled
  });
});

app.get('/api/email/items', async (_req, res) => {
  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
  const mapped = items.map((it) => {
    const dest = resolveDestinationEmail(it.destinationProfile, config);
    return {
      ...it,
      destinationLabel: dest.label,
      destinationEmail: dest.email
    };
  });
  res.json({ success: true, items: mapped });
});

app.post('/api/email/items', async (req, res) => {
  const { items } = await loadEmailDataAsync();
  const newItem = req.body;
  const index = items.findIndex((i) => i.id === newItem.id);

  if (index >= 0) {
    items[index] = { ...items[index], ...newItem };
  } else {
    items.push(newItem);
  }

  await saveEmailDataAsync(items);
  await recordAutomationActivityAsync('ADMIN_ACTION', `Email item ${newItem.id} updated/created`);
  res.json({ success: true, item: newItem });
});

app.delete('/api/email/items/:id', async (req, res) => {
  const { id } = req.params;
  const { items } = await loadEmailDataAsync();
  const filtered = items.filter((i) => i.id !== id);
  await saveEmailDataAsync(filtered);
  await recordAutomationActivityAsync('ADMIN_ACTION', `Deleted item: ${id}`);
  res.json({ success: true, deletedId: id });
});

app.post('/api/email/remove-schedule', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Item ID is required' });

  const { items } = await loadEmailDataAsync();
  const filtered = items.filter((it) => it.id !== id);
  await saveEmailDataAsync(filtered);

  await recordAutomationActivityAsync('ADMIN_ACTION', `Removed scheduled email: ${id}`);
  res.json({ success: true, message: `Scheduled item ${id} removed successfully` });
});

// Configure & Schedule an Existing Template
app.post('/api/email/schedule-existing', async (req, res) => {
  const {
    templateId,
    scheduleDate,
    scheduleTime,
    destinationProfile,
    customSubject,
    customDisplayName,
    websiteName,
    emailDisplayName,
    linkAlias,
    buttonText
  } = req.body;

  if (!templateId || !scheduleDate || !scheduleTime) {
    return res.status(400).json({ error: 'templateId, scheduleDate and scheduleTime are required' });
  }

  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
  const master = DEFAULT_EMAIL_ITEMS.find((d) => d.id === templateId) || items.find((it) => it.id === templateId) || DEFAULT_EMAIL_ITEMS[0];

  const prof = destinationProfile || master.destinationProfile || 'S1';
  const dest = resolveDestinationEmail(prof, config);

  const effectiveDisplayName = (emailDisplayName !== undefined && emailDisplayName.trim() !== '')
    ? emailDisplayName.trim()
    : (customDisplayName && customDisplayName.trim()) || (config.emailDisplayName || 'SIRI BANGARAM');

  const instanceId = `sched_${templateId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  const newScheduledItem: EmailItem = {
    ...master,
    id: instanceId,
    name: master.name,
    subject: customSubject || master.subject,
    destinationProfile: dest.profile,
    recipient: dest.email,
    scheduleDate,
    scheduleTime,
    status: 'SCHEDULED',
    enabled: true,
    buttonText: buttonText || master.buttonText || 'ENTER YOUR STORY →',
    linkAlias: linkAlias || master.linkAlias || 'A LITTLE SOMETHING FOR YOU →',
    websiteUrl: master.websiteUrl || config.websiteUrl || DEFAULT_WEBSITE_URL,
    customDisplayName: effectiveDisplayName,
    emailDisplayName: effectiveDisplayName,
    useGlobalEmailDisplayName: true
  };

  items.unshift(newScheduledItem);
  await saveEmailDataAsync(items);

  await recordAutomationActivityAsync(
    'ADMIN_ACTION',
    `Scheduled "${master.name}" for ${scheduleDate} ${scheduleTime} IST to ${dest.label} (${dest.email})`,
    { instanceId, templateId, date: scheduleDate, time: scheduleTime, profile: dest.profile }
  );

  res.json({
    success: true,
    message: `Successfully scheduled "${master.name}"`,
    newItem: newScheduledItem,
    destination: dest
  });
});

app.post('/api/email/scheduled-instance/update', async (req, res) => {
  const {
    id,
    scheduleDate,
    scheduleTime,
    destinationProfile,
    customSubject,
    linkAlias,
    buttonText,
    emailDisplayName
  } = req.body;

  if (!id) return res.status(400).json({ error: 'Instance ID is required' });

  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
  const itemIndex = items.findIndex((it) => it.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Scheduled item not found' });
  }

  const existing = items[itemIndex];
  const prof = destinationProfile || existing.destinationProfile || 'S1';
  const dest = resolveDestinationEmail(prof, config);

  items[itemIndex] = {
    ...existing,
    scheduleDate: scheduleDate || existing.scheduleDate,
    scheduleTime: scheduleTime || existing.scheduleTime,
    destinationProfile: dest.profile,
    recipient: dest.email,
    subject: customSubject || existing.subject,
    linkAlias: linkAlias || existing.linkAlias,
    buttonText: buttonText || existing.buttonText,
    emailDisplayName: emailDisplayName || existing.emailDisplayName || config.emailDisplayName,
    status: 'SCHEDULED'
  };

  await saveEmailDataAsync(items);

  await recordAutomationActivityAsync(
    'ADMIN_ACTION',
    `Updated schedule for ${existing.name}: ${items[itemIndex].scheduleDate} ${items[itemIndex].scheduleTime} IST [${dest.label}]`
  );

  res.json({
    success: true,
    item: items[itemIndex],
    destination: dest
  });
});

app.post('/api/email/reschedule', async (req, res) => {
  const {
    originalEmailId,
    newDate,
    newTime,
    recipient,
    destinationProfile,
    customSubject,
    buttonText,
    linkAlias,
    emailDisplayName
  } = req.body;

  if (!originalEmailId || !newDate || !newTime) {
    return res.status(400).json({ error: 'originalEmailId, newDate, and newTime are required' });
  }

  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();

  const baseItem = DEFAULT_EMAIL_ITEMS.find((d) => d.id === originalEmailId)
    || items.find((i) => i.id === originalEmailId)
    || DEFAULT_EMAIL_ITEMS[0];

  const prof = destinationProfile || baseItem.destinationProfile || 'S1';
  const dest = resolveDestinationEmail(prof, config);
  const targetEmail = recipient || dest.email;

  const effectiveDisplayName = (emailDisplayName !== undefined && emailDisplayName.trim() !== '')
    ? emailDisplayName.trim()
    : (config.emailDisplayName || 'SIRI BANGARAM');

  const instanceId = `resched_${originalEmailId}_${Date.now()}`;

  const newScheduledItem: EmailItem = {
    ...baseItem,
    id: instanceId,
    name: baseItem.name,
    subject: customSubject || baseItem.subject,
    recipient: targetEmail,
    destinationProfile: dest.profile,
    scheduleDate: newDate,
    scheduleTime: newTime,
    status: 'SCHEDULED',
    enabled: true,
    buttonText: buttonText || baseItem.buttonText || 'ENTER YOUR STORY →',
    linkAlias: linkAlias || baseItem.linkAlias || 'ENTER YOUR STORY →',
    websiteUrl: baseItem.websiteUrl || config.websiteUrl || DEFAULT_WEBSITE_URL,
    customDisplayName: effectiveDisplayName,
    emailDisplayName: effectiveDisplayName,
    useGlobalEmailDisplayName: true
  };

  items.unshift(newScheduledItem);
  await saveEmailDataAsync(items);

  await recordAutomationActivityAsync(
    'ADMIN_ACTION',
    `Rescheduled "${baseItem.name}" to ${newDate} ${newTime} IST for ${dest.label} (${targetEmail})`,
    { newInstanceId: instanceId, originalEmailId, date: newDate, time: newTime }
  );

  res.json({
    success: true,
    message: `Rescheduled "${baseItem.name}" for ${newDate} at ${newTime} IST`,
    newItem: newScheduledItem,
    destination: dest
  });
});

app.get('/api/email/sent', async (_req, res) => {
  const logs = await loadEmailLogsAsync();
  res.json({
    success: true,
    count: logs.length,
    sentEmails: logs
  });
});

app.post('/api/email/items/:id/send-now', async (req, res) => {
  const { id } = req.params;
  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
  const item = items.find((i) => i.id === id) || DEFAULT_EMAIL_ITEMS.find((d) => d.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Email item not found' });
  }

  const dest = resolveDestinationEmail(item.destinationProfile, config);
  const result = await sendEmail(item, {
    isTest: req.body?.isTest || false,
    overrideRecipient: req.body?.overrideRecipient || dest.email,
    overrideSubject: req.body?.overrideSubject || item.subject
  });

  if (result.success) {
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex >= 0) {
      items[itemIndex].status = 'SENT';
      items[itemIndex].sentAt = new Date().toISOString();
      await saveEmailDataAsync(items);
    }
    const logs = await loadEmailLogsAsync();
    res.json({
      success: true,
      message: `Email "${item.name}" dispatched to ${dest.label} (${dest.email})`,
      info: result.info,
      sentRecord: logs[0]
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error
    });
  }
});

app.get('/api/reference-snapshots', async (_req, res) => {
  const snapshots = await loadSnapshotsAsync();
  res.json({ success: true, snapshots });
});

app.post('/api/reference-snapshots/capture/:id', async (req, res) => {
  const { id } = req.params;
  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
  const item = items.find((it) => it.id === id) || DEFAULT_EMAIL_ITEMS.find((d) => d.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Email template not found' });
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
    verifiedDesign: true
  };

  const snapshots = await loadSnapshotsAsync();
  snapshots[id] = snapshot;
  await saveSnapshotsAsync(snapshots);

  await recordAutomationActivityAsync(
    'ADMIN_ACTION',
    `Captured immutable reference snapshot for "${item.name}"`
  );

  res.json({
    success: true,
    snapshot,
    message: `Reference snapshot captured for ${item.name}`
  });
});

app.get('/api/reference-snapshots/:id/preview', async (req, res) => {
  const { id } = req.params;
  const snapshots = await loadSnapshotsAsync();
  const snap = snapshots[id];
  if (!snap) {
    return res.status(404).send('<h2>Reference snapshot not found</h2>');
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(snap.renderedHtml);
});

app.post('/api/email/render-preview', async (req, res) => {
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

  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
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
    destinationProfile: dest.profile,
    recipient: dest.email,
    buttonText: buttonText || baseItem.buttonText || 'ENTER YOUR STORY →',
    linkAlias: linkAlias || baseItem.linkAlias || 'A LITTLE SOMETHING FOR YOU →',
    scheduleDate: scheduleDate || baseItem.scheduleDate,
    scheduleTime: scheduleTime || baseItem.scheduleTime,
    customDisplayName: effectiveDisplayName,
    emailDisplayName: effectiveDisplayName
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

app.all('/api/email/preview/:id', async (req, res) => {
  const { id } = req.params;
  const { items } = await loadEmailDataAsync();
  const config = await loadEmailConfigAsync();
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
  const normalized = (password || '').trim();

  let valid = false;
  if (normalized === 'siri2026' || normalized === 'mendu' || normalized === 'admin123') {
    valid = true;
  }

  if (fs.existsSync(AUTH_FILE)) {
    try {
      const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
      const hash = crypto.createHash('sha256').update(normalized).digest('hex');
      if (auth.passwordHash === hash || auth.password === normalized) {
        valid = true;
      }
    } catch {}
  }

  if (valid) {
    res.json({ success: true, message: 'Authenticated successfully' });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect password' });
  }
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
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

// Start scheduler background interval for local daemon & non-serverless
if (!process.env.VERCEL) {
  setInterval(async () => {
    try {
      await runSchedulerTick();
    } catch (err) {
      console.error('[Scheduler Interval Error]:', err);
    }
  }, 10000);

  app.listen(PORT, () => {
    console.log(`[Server] Siri Birthday & Email Automation Server running on port ${PORT}`);
    recordAutomationActivity('SCHEDULER_CHECK', 'Scheduler engine initialized and running (10s IST interval)');
  });
}

export default app;
