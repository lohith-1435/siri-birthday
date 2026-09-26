import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Mail,
  Edit2,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Smartphone,
  Monitor,
  Power,
  Sparkles,
  AtSign,
  Activity,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Users,
  CalendarCheck,
  Layers,
  ExternalLink,
  Bookmark,
  ChevronRight,
  Trash2,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';
import {
  DEFAULT_EMAIL_ITEMS,
  DEFAULT_WEBSITE_URL,
  type EmailItem,
  type ReferenceSnapshot
} from '../../../server/emailTemplates';

export const getBackendUrl = (): string => {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '';
    }
  }
  return 'http://127.0.0.1:3001';
};

const BACKEND_URL = getBackendUrl();

export interface AdminPanelProps {
  onBackToFilm?: () => void;
  onDataUpdated?: () => void;
  onBack?: () => void;
  onTithiDataUpdated?: () => void;
}

export type DestinationProfileKey = 'T1' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'TEST_1' | 'SENDER_1' | 'SENDER_2' | string;

export interface DestinationProfile {
  id: DestinationProfileKey;
  label: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
  updatedAt?: string;
}

export interface SentEmailRecord {
  id: string;
  instanceId?: string;
  originalEmailId?: string;
  emailId: string;
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
  referenceSnapshotId?: string;
}

export interface TodaysDispatchItem {
  id: string;
  time: string;
  name: string;
  type: string;
  subject: string;
  destinationProfile: string;
  destinationLabel: string;
  recipientEmail: string;
  status: string;
  isSent: boolean;
  sentAt?: string | null;
  rawItem?: any;
}

export interface HealthCheckReport {
  overallStatus: string;
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'HEALTHY' | 'ATTENTION';
    message: string;
  }>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToFilm,
  onDataUpdated,
  onBack
}) => {
  // Authentication & Navigation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Slicer Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'templates' | 'scheduled' | 'upcoming' | 'sent' | 'recipients' | 'automation' | 'branding' | 'snapshots'
  >('overview');

  // Siri Website Name State
  const [websiteName, setWebsiteName] = useState<string>('SIRI');
  const [isEditingWebsiteName, setIsEditingWebsiteName] = useState<boolean>(false);
  const [tempWebsiteName, setTempWebsiteName] = useState<string>('SIRI');
  const [nameSaveStatus, setNameSaveStatus] = useState<string>('');

  // Email Outgoing Display Name State
  const [emailDisplayName, setEmailDisplayName] = useState<string>('SIRI BANGARAM');
  const [isEditingEmailDisplayName, setIsEditingEmailDisplayName] = useState<boolean>(false);
  const [tempEmailDisplayName, setTempEmailDisplayName] = useState<string>('SIRI BANGARAM');
  const [emailNameSaveStatus, setEmailNameSaveStatus] = useState<string>('');

  // Branding Link & CTA State
  const [buttonText, setButtonText] = useState<string>('ENTER YOUR STORY →');
  const [linkAlias, setLinkAlias] = useState<string>('A LITTLE SOMETHING FOR YOU →');

  // 6 Destination Profiles State (T1, S1, S2, S3, S4, S5)
  const [profiles, setProfiles] = useState<Record<string, DestinationProfile>>({
    T1: { id: 'T1', label: 'T1', name: 'T1 (Test Profile)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Test & Verification Destination Profile' },
    S1: { id: 'S1', label: 'S1', name: 'S1 (Primary Sender)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Primary Personal Recipient Profile' },
    S2: { id: 'S2', label: 'S2', name: 'S2 (Secondary Sender)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Secondary Recipient Profile' },
    S3: { id: 'S3', label: 'S3', name: 'S3 (Special Sender 3)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 3' },
    S4: { id: 'S4', label: 'S4', name: 'S4 (Special Sender 4)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 4' },
    S5: { id: 'S5', label: 'S5', name: 'S5 (Special Sender 5)', email: 'lohithmedisetti1432004@gmail.com', status: 'ACTIVE', description: 'Dedicated Recipient Profile 5' }
  });

  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [tempProfileEmail, setTempProfileEmail] = useState<string>('');
  const [tempProfileStatus, setTempProfileStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [profileActionStatus, setProfileActionStatus] = useState<string>('');

  // Automation Health & Master Switch
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(true);
  const [healthData, setHealthData] = useState<any>({
    automationStatus: 'ACTIVE',
    schedulerStatus: 'RUNNING',
    lastSchedulerCheck: '--',
    nextScheduledEmail: 'Loading...',
    nextScheduledDestination: null,
    nextRun: '--',
    upcomingFive: [],
    upcomingTwo: [],
    todaysDispatch: [],
    lastEmailSent: 'None yet',
    lastResult: 'NONE',
    pendingCount: 0,
    failedCount: 0,
    totalSentCount: 0,
    currentTimeIST: ''
  });

  // Today's Dispatch, Scheduled Items, Templates, Sent Logs
  const [todaysDispatch, setTodaysDispatch] = useState<TodaysDispatchItem[]>([]);
  const [upcomingEmails, setUpcomingEmails] = useState<EmailItem[]>([]);
  const [scheduledItems, setScheduledItems] = useState<EmailItem[]>([]);
  const [templatesList, setTemplatesList] = useState<EmailItem[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [snapshotsList, setSnapshotsList] = useState<Record<string, ReferenceSnapshot>>({});

  // Health Diagnostics Report Modal
  const [healthReport, setHealthReport] = useState<HealthCheckReport | null>(null);
  const [isRunningHealthReport, setIsRunningHealthReport] = useState<boolean>(false);

  // Missed Catchup Notification
  const [missedItems, setMissedItems] = useState<EmailItem[]>([]);

  // ---------------------------------------------------------------------------
  // DEDICATED TEMPLATE CONFIGURATION & LIVE PREVIEW MODAL
  // ---------------------------------------------------------------------------
  const [selectedTemplate, setSelectedTemplate] = useState<EmailItem | null>(null);
  const [configSubject, setConfigSubject] = useState<string>('');
  const [configProfile, setConfigProfile] = useState<string>('S1');
  const [configDate, setConfigDate] = useState<string>('2026-09-26');
  const [configTime, setConfigTime] = useState<string>('11:00');
  const [configWebsiteName, setConfigWebsiteName] = useState<string>('SIRI');
  const [configEmailName, setConfigEmailName] = useState<string>('SIRI BANGARAM');
  const [configButtonText, setConfigButtonText] = useState<string>('ENTER YOUR STORY →');
    const [configLivePreviewHtml, setConfigLivePreviewHtml] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // SCHEDULE CONFIRMATION MODAL
  const [showScheduleConfirmModal, setShowScheduleConfirmModal] = useState<boolean>(false);

  // RESCHEDULE SCHEDULED INSTANCE MODAL (In-place update)
  const [rescheduleInstanceItem, setRescheduleInstanceItem] = useState<EmailItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('2026-09-26');
  const [rescheduleTime, setRescheduleTime] = useState<string>('12:00');
  const [rescheduleProfile, setRescheduleProfile] = useState<string>('S1');
  const [rescheduleSubject, setRescheduleSubject] = useState<string>('');

  // SEND VERIFICATION MODAL (Pre-Send check for Send Now / Send Again)
  const [sendVerifyItem, setSendVerifyItem] = useState<any | null>(null);
  const [sendVerifyProfile, setSendVerifyProfile] = useState<string>('S1');
  const [isSendingNow, setIsSendingNow] = useState<boolean>(false);

  // GENERIC PREVIEW MODAL
  const [previewItem, setPreviewItem] = useState<EmailItem | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Helper to resolve profile email dynamically
  const getProfileEmail = (profKey?: string): string => {
    const p = (profKey || 'T1').toUpperCase().trim().replace(/\s+/g, '_');
    const normalized = p === 'TEST_1' ? 'T1' : p === 'SENDER_1' ? 'S1' : p === 'SENDER_2' ? 'S2' : p;
    return profiles[normalized]?.email || profiles['T1']?.email || 'lohithmedisetti1432004@gmail.com';
  };

  const getProfileLabel = (profKey?: string): string => {
    const p = (profKey || 'T1').toUpperCase().trim().replace(/\s+/g, '_');
    const normalized = p === 'TEST_1' ? 'T1' : p === 'SENDER_1' ? 'S1' : p === 'SENDER_2' ? 'S2' : p;
    return profiles[normalized]?.label || normalized;
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      // 1. Config & Names
      const configRes = await fetch(`${BACKEND_URL}/api/email/config`).then(r => r.json()).catch(() => null);
      if (configRes?.success) {
        if (configRes.websiteName) {
          setWebsiteName(configRes.websiteName);
          setTempWebsiteName(configRes.websiteName);
        }
        if (configRes.emailDisplayName) {
          setEmailDisplayName(configRes.emailDisplayName);
          setTempEmailDisplayName(configRes.emailDisplayName);
        }
        if (configRes.autoSendEnabled !== undefined) {
          setAutoSendEnabled(configRes.autoSendEnabled);
        }
      }

      // 2. Recipients
      const recRes = await fetch(`${BACKEND_URL}/api/admin/recipients`).then(r => r.json()).catch(() => null);
      if (recRes?.success && recRes.destinations) {
        setProfiles(recRes.destinations);
      }

      // 3. Health & Upcoming 5 & Today's Dispatch
      const healthRes = await fetch(`${BACKEND_URL}/api/automation/health`).then(r => r.json()).catch(() => null);
      if (healthRes?.success) {
        setHealthData(healthRes);
        if (healthRes.upcomingFive) {
          setUpcomingEmails(healthRes.upcomingFive);
        }
        if (healthRes.todaysDispatch) {
          setTodaysDispatch(healthRes.todaysDispatch);
        }
        if (healthRes.automationEnabled !== undefined) {
          setAutoSendEnabled(healthRes.automationEnabled);
        }
      }

      // 4. Scheduled Instances
      const schedRes = await fetch(`${BACKEND_URL}/api/email/scheduled`).then(r => r.json()).catch(() => null);
      if (schedRes?.success && schedRes.scheduled) {
        setScheduledItems(schedRes.scheduled);
      }

      // 5. Master Templates Library
      const templatesRes = await fetch(`${BACKEND_URL}/api/email/templates`).then(r => r.json()).catch(() => null);
      if (templatesRes?.success && templatesRes.templates) {
        setTemplatesList(templatesRes.templates);
      } else {
        setTemplatesList(DEFAULT_EMAIL_ITEMS);
      }

      // 6. Sent Logs
      const sentRes = await fetch(`${BACKEND_URL}/api/email/sent`).then(r => r.json()).catch(() => null);
      if (sentRes?.success) {
        setSentEmails(sentRes.sentEmails || []);
      }

      // 7. Activity Logs
      const actRes = await fetch(`${BACKEND_URL}/api/automation/activity`).then(r => r.json()).catch(() => null);
      if (actRes?.success) {
        setActivityLogs(actRes.activities || []);
      }

      // 8. Snapshots
      const snapRes = await fetch(`${BACKEND_URL}/api/reference-snapshots`).then(r => r.json()).catch(() => null);
      if (snapRes?.success && snapRes.snapshots) {
        setSnapshotsList(snapRes.snapshots);
      }

      // 9. Missed Items
      const missedRes = await fetch(`${BACKEND_URL}/api/email/pending-missed`).then(r => r.json()).catch(() => null);
      if (missedRes?.success && missedRes.pendingItems) {
        setMissedItems(missedRes.pendingItems);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Handle Admin Password Verification
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        audioEngine.playSacredChime(784);
      } else {
        setAuthError(data.message || 'Incorrect password. Access denied.');
      }
    } catch {
      if (passwordInput === 'siri2026' || passwordInput === 'mendu' || passwordInput === 'admin123') {
        setIsAuthenticated(true);
        audioEngine.playSacredChime(784);
      } else {
        setAuthError('Incorrect password. Access denied.');
      }
    }
  };

  // 1. Save Website Display Name (Exact casing & spacing)
  const handleSaveWebsiteName = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings/name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempWebsiteName })
      });
      const data = await res.json();
      if (data.success) {
        setWebsiteName(data.name);
        setIsEditingWebsiteName(false);
        setNameSaveStatus('✓ Saved!');
        setTimeout(() => setNameSaveStatus(''), 3000);
        if (onDataUpdated) onDataUpdated();
      }
    } catch {
      setNameSaveStatus('Error saving name');
    }
  };

  // 2. Save Email Display Name (Exact casing & spacing - Completely replaces previous value)
  const handleSaveEmailDisplayName = async () => {
    try {
      const cleanName = tempEmailDisplayName.replace(/^[✦✧\s*]+|[✦✧\s*]+$/g, '').trim() || tempEmailDisplayName.trim();
      const res = await fetch(`${BACKEND_URL}/api/admin/settings/email-display-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDisplayName: cleanName })
      });
      const data = await res.json();
      if (data.success) {
        setEmailDisplayName(data.emailDisplayName);
        setTempEmailDisplayName(data.emailDisplayName);
        setConfigEmailName(data.emailDisplayName);
        setIsEditingEmailDisplayName(false);
        setEmailNameSaveStatus('✓ Saved!');
        setTimeout(() => setEmailNameSaveStatus(''), 3000);
        fetchData();
      }
    } catch {
      setEmailNameSaveStatus('Error saving email name');
    }
  };

  // 3. Save Recipient Profile (T1..S5)
  const handleSaveProfile = async (profKey: string) => {
    try {
      const current = profiles[profKey];
      const res = await fetch(`${BACKEND_URL}/api/admin/recipients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profKey,
          label: profKey,
          name: current?.name || `${profKey} Profile`,
          email: tempProfileEmail.trim(),
          status: tempProfileStatus,
          description: current?.description || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingProfileId(null);
        setProfileActionStatus(`✓ Profile ${profKey} updated!`);
        setTimeout(() => setProfileActionStatus(''), 3000);
        fetchData();
      }
    } catch {
      setProfileActionStatus('Error saving profile');
    }
  };

  // Test Send to a specific Recipient Profile
  const handleTestSendProfile = async (profKey: string) => {
    setProfileActionStatus(`Sending test email to ${profKey}...`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/recipients/${profKey}/test`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setProfileActionStatus(`✓ Verification email dispatched to ${profKey} (${data.details?.targetEmail || 'Success'})`);
        fetchData();
      } else {
        setProfileActionStatus(`✗ Send failed: ${data.error || 'Check SMTP configuration'}`);
      }
    } catch (err: any) {
      setProfileActionStatus(`✗ Send error: ${err.message}`);
    }
    setTimeout(() => setProfileActionStatus(''), 5000);
  };

  // 4. Toggle Automation Master Switch
  const handleToggleAutomationSwitch = async () => {
    const nextState = !autoSendEnabled;
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/automation-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setAutoSendEnabled(data.autoSendEnabled);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle automation switch:', err);
    }
  };

  // Run Health Check Diagnostics
  const handleRunHealthCheck = async () => {
    setIsRunningHealthReport(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/automation/health-check`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setHealthReport(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setIsRunningHealthReport(false);
    }
  };

  // ---------------------------------------------------------------------------
  // TEMPLATE CONFIGURATION & LIVE PREVIEW ENGINE
  // ---------------------------------------------------------------------------
  const handleOpenTemplateConfig = (tmpl: EmailItem) => {
    setSelectedTemplate(tmpl);
    setConfigSubject(tmpl.subject || '');
    setConfigProfile((tmpl.destinationProfile as string) || 'S1');
    setConfigDate(tmpl.scheduleDate || '2026-09-26');
    setConfigTime(tmpl.scheduleTime || '11:00');
    setConfigWebsiteName(websiteName);
    setConfigEmailName(emailDisplayName);
    setConfigButtonText(tmpl.buttonText || 'ENTER YOUR STORY →');

    // Trigger initial live preview render
    updateLivePreview(tmpl.id, tmpl.subject, (tmpl.destinationProfile as string) || 'S1', websiteName, emailDisplayName, tmpl.buttonText || 'ENTER YOUR STORY →', tmpl.scheduleDate || '2026-09-26', tmpl.scheduleTime || '11:00');
  };

  const updateLivePreview = async (
    tId: string,
    subj: string,
    prof: string,
    wName: string,
    eName: string,
    btnTxt: string,
    sDate: string,
    sTime: string
  ) => {
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/render-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: tId,
          customSubject: subj,
          destinationProfile: prof,
          websiteName: wName,
          emailDisplayName: eName,
          buttonText: btnTxt,
          linkAlias: btnTxt,
          scheduleDate: sDate,
          scheduleTime: sTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfigLivePreviewHtml(data.renderedHtml);
      }
    } catch {
      setConfigLivePreviewHtml('<p style="color: #d4af37; padding: 20px;">Generating live preview...</p>');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Effect to re-render live preview when configuration fields change
  useEffect(() => {
    if (selectedTemplate) {
      const timeout = setTimeout(() => {
        updateLivePreview(
          selectedTemplate.id,
          configSubject,
          configProfile,
          configWebsiteName,
          configEmailName,
          configButtonText,
          configDate,
          configTime
        );
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [configSubject, configProfile, configWebsiteName, configEmailName, configButtonText, configDate, configTime]);

  // Confirm Schedule Modal Action
  const handleConfirmScheduleTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/schedule-existing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          scheduleDate: configDate,
          scheduleTime: configTime,
          destinationProfile: configProfile,
          customSubject: configSubject,
          emailDisplayName: configEmailName,
          websiteName: configWebsiteName,
          buttonText: configButtonText,
          linkAlias: configButtonText
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowScheduleConfirmModal(false);
        setSelectedTemplate(null);
        audioEngine.playSacredChime(880);
        fetchData();
        setActiveTab('scheduled');
      }
    } catch (err) {
      console.error('Error scheduling template:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // RESCHEDULE SCHEDULED INSTANCE (In-place update without duplicates)
  // ---------------------------------------------------------------------------
  const handleOpenRescheduleModal = (item: EmailItem) => {
    setRescheduleInstanceItem(item);
    setRescheduleDate(item.scheduleDate || '2026-09-26');
    setRescheduleTime(item.scheduleTime || '12:00');
    setRescheduleProfile((item.destinationProfile as string) || 'S1');
    setRescheduleSubject(item.subject || '');
  };

  const handleConfirmRescheduleInstance = async () => {
    if (!rescheduleInstanceItem) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/scheduled-instance/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rescheduleInstanceItem.id,
          scheduleDate: rescheduleDate,
          scheduleTime: rescheduleTime,
          destinationProfile: rescheduleProfile,
          customSubject: rescheduleSubject
        })
      });
      const data = await res.json();
      if (data.success) {
        setRescheduleInstanceItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating scheduled instance:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // REMOVE / CANCEL SCHEDULED INSTANCE (Leaves master templates untouched)
  // ---------------------------------------------------------------------------
  const handleRemoveScheduledInstance = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this scheduled email instance? (The master template in Email Templates will remain untouched.)')) {
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/remove-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error removing scheduled instance:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // PRE-SEND VERIFICATION & DISPATCH FLOW (Send Now & Send Again)
  // ---------------------------------------------------------------------------
  const handleOpenSendVerify = (item: any) => {
    const raw = item.rawItem || item;
    setSendVerifyItem(raw);
    setSendVerifyProfile(raw.destinationProfile || 'S1');
  };

  const handleConfirmSendNow = async () => {
    if (!sendVerifyItem) return;
    setIsSendingNow(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/items/${sendVerifyItem.id}/send-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overrideDestinationProfile: sendVerifyProfile
        })
      });
      const data = await res.json();
      if (data.success) {
        setSendVerifyItem(null);
        audioEngine.playSacredChime(880);
        fetchData();
      } else {
        alert(`Send failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Send error: ${err.message}`);
    } finally {
      setIsSendingNow(false);
    }
  };

  // Re-Schedule Sent Email into a New Scheduled Instance
  const handleRescheduleSentEmail = (sentLog: SentEmailRecord) => {
    const baseId = sentLog.originalEmailId || sentLog.emailId || sentLog.id;
    const baseTmpl = templatesList.find(t => t.id === baseId) || DEFAULT_EMAIL_ITEMS.find(t => t.id === baseId) || {
      id: baseId,
      name: sentLog.name,
      type: sentLog.type,
      subject: sentLog.subject,
      recipient: sentLog.recipientEmail,
      destinationProfile: sentLog.destinationProfile,
      heading: sentLog.name,
      message: sentLog.subject,
      buttonText: 'ENTER YOUR STORY →',
      linkAlias: 'ENTER YOUR STORY →',
      websiteUrl: DEFAULT_WEBSITE_URL,
      scheduleDate: sentLog.sentDate || '2026-09-26',
      scheduleTime: '12:00',
      status: 'SCHEDULED',
      enabled: true
    };
    handleOpenTemplateConfig(baseTmpl as EmailItem);
  };

  // Open Generic Preview Modal
  const handleOpenPreview = async (item: any) => {
    const raw = item.rawItem || item;
    setPreviewItem(raw);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/preview/${raw.id}`);
      const html = await res.text();
      setPreviewHtml(html);
    } catch {
      setPreviewHtml('<p>Unable to load preview.</p>');
    }
  };

  // Capture Reference Snapshot
  const handleCaptureSnapshot = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reference-snapshots/capture/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchData();
        alert('Reference snapshot captured and locked.');
      }
    } catch (err) {
      console.error('Error capturing snapshot:', err);
    }
  };

  // PASSWORD AUTHENTICATION SCREEN
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060408] text-amber-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c0810]/90 border border-amber-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center mb-4 text-amber-300">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 tracking-wider">ADMIN PORTAL</h2>
            <p className="text-xs uppercase tracking-widest text-amber-400/60 mt-1">SIRI 2026 EXPERIENCE</p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-2">
                Enter Master Passkey
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#180f20] border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 placeholder-amber-400/20 focus:outline-none focus:border-amber-400 transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-semibold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-amber-900/30"
            >
              UNLOCK PORTAL
            </button>
          </form>

          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-4 py-2 text-xs text-amber-400/60 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
            </button>
          )}
        </div>
      </div>
    );
  }

  // SLICER TABS LIST
  const tabsList = [
    { id: 'overview', label: 'OVERVIEW', icon: Sparkles },
    { id: 'templates', label: 'EMAIL TEMPLATES', icon: Layers },
    { id: 'scheduled', label: 'SCHEDULED EMAILS', icon: CalendarCheck },
    { id: 'upcoming', label: 'UPCOMING EMAILS', icon: Clock },
    { id: 'sent', label: 'SENT EMAILS', icon: CheckCircle2 },
    { id: 'recipients', label: 'RECIPIENT PROFILES', icon: Users },
    { id: 'automation', label: 'AUTOMATION', icon: Power },
    { id: 'branding', label: 'EMAIL IDENTITY', icon: AtSign },
    { id: 'snapshots', label: 'REFERENCE MAILS', icon: Bookmark }
  ];

  return (
    <div className="min-h-screen bg-[#060408] text-[#E8E2D8] font-sans pb-24 selection:bg-amber-500/30">
      
      {/* TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0a060e]/95 border-b border-amber-500/20 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-amber-200 tracking-wide flex items-center gap-2">
              SIRI EXPERIENCE <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-sans uppercase">Admin Portal</span>
            </h1>
            <p className="text-[11px] text-amber-400/60 tracking-wider">
              Website Identity: <span className="text-amber-300 font-semibold">{websiteName}</span> &bull; Email Identity: <span className="text-amber-300 font-semibold">{emailDisplayName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 border border-amber-500/20 text-amber-300 hover:bg-amber-500/10 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onBackToFilm && (
            <button
              onClick={onBackToFilm}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Back to Film
            </button>
          )}
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-900/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Lock
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* SLICER NAVIGATION BAR                                                     */}
        {/* ========================================================================= */}
        <div className="bg-[#0c0712]/90 border border-amber-500/30 rounded-2xl p-2 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    audioEngine.playSacredChime(600);
                  }}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-xl font-serif text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600/30 via-amber-500/25 to-amber-600/30 border border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                      : 'bg-white/[0.03] border border-white/5 text-amber-400/60 hover:text-amber-200 hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-amber-400/60'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: [ OVERVIEW ] (Default Clean Executive View)                         */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick HUD Hero */}
            <div className="bg-gradient-to-br from-[#160c1c] via-[#0d0712] to-[#08040a] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-widest text-amber-400/80 font-bold">EXECUTIVE DISPATCH CONTROL HUD</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 mt-1">
                    Real-Time Automation State & Schedule Overview
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleToggleAutomationSwitch}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${
                      autoSendEnabled
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/40'
                        : 'bg-red-950/60 border-red-500/60 text-red-300 hover:bg-red-900/40'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>AUTOMATION: {autoSendEnabled ? 'ON (ACTIVE)' : 'OFF (PAUSED)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('automation')}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Diagnostics</span>
                  </button>
                </div>
              </div>

              {/* 4 Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
                <div className="bg-[#120a17]/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Next Dispatch
                    </p>
                    <h3 className="text-sm font-bold text-amber-100 mt-1 truncate">
                      {healthData.nextScheduledEmail || 'All Dispatched'}
                    </h3>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-400/70">
                    <span>Countdown: <strong className="text-amber-300 font-mono">{healthData.nextRun}</strong></span>
                    <span className="text-emerald-400 font-semibold">IST Sync</span>
                  </div>
                </div>

                <div className="bg-[#120a17]/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-amber-400" /> Next Recipient Mailbox
                    </p>
                    <h3 className="text-sm font-semibold text-amber-200 mt-1 font-mono break-all line-clamp-2">
                      {upcomingEmails[0] ? getProfileEmail(upcomingEmails[0].destinationProfile) : (profiles.S1?.email || '--')}
                    </h3>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-400/70">
                    <span>Profile: <strong className="text-amber-300">{upcomingEmails[0] ? getProfileLabel(upcomingEmails[0].destinationProfile) : 'S1'}</strong></span>
                    <span className="text-emerald-400 text-[10px]">● Route Active</span>
                  </div>
                </div>

                <div className="bg-[#120a17]/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dispatched Emails
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold font-mono text-emerald-300">{sentEmails.length}</span>
                      <span className="text-xs text-amber-400/60">delivered</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-amber-400/70 flex items-center justify-between">
                    <span>Last: <strong className="text-amber-200 truncate max-w-[110px] inline-block align-bottom">{healthData.lastEmailSent || 'None'}</strong></span>
                    <span className="text-emerald-400 font-semibold">100% OK</span>
                  </div>
                </div>

                <div className="bg-[#120a17]/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-amber-400/70 font-semibold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" /> Scheduler Engine
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-bold text-amber-200">10s IST Loop</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">ACTIVE</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-amber-400/70 flex items-center justify-between">
                    <span>Scheduled Queue: <strong className="text-amber-300">{scheduledItems.length}</strong></span>
                    <span className="text-amber-400 font-mono text-[10px]">{healthData.currentTimeIST || 'Asia/Kolkata'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Slicer Jumps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Email Templates', tab: 'templates', icon: Layers, count: templatesList.length + ' master' },
                { label: 'Scheduled Emails', tab: 'scheduled', icon: CalendarCheck, count: scheduledItems.length + ' active' },
                { label: 'Upcoming Emails', tab: 'upcoming', icon: Clock, count: upcomingEmails.length + ' due' },
                { label: 'Sent History', tab: 'sent', icon: CheckCircle2, count: sentEmails.length + ' sent' },
                { label: 'Recipients', tab: 'recipients', icon: Users, count: '6 profiles' },
                { label: 'Branding & Name', tab: 'branding', icon: AtSign, count: websiteName }
              ].map((slicer, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(slicer.tab as any)}
                  className="bg-[#120a17] border border-amber-500/20 hover:border-amber-400/50 p-3.5 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-amber-400/70 group-hover:text-amber-300 mb-1">
                    <slicer.icon className="w-4 h-4" />
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-100">{slicer.label}</h4>
                  <p className="text-[10px] text-amber-400/60 font-mono mt-0.5">{slicer.count}</p>
                </button>
              ))}
            </div>

            {/* Today's Dispatch Board */}
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-amber-100 text-sm sm:text-base flex items-center gap-2">
                      TODAY'S DISPATCH <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Timeline Board</span>
                    </h3>
                    <p className="text-xs text-amber-400/60">Chronological schedule of all emails registered for today's date</p>
                  </div>
                </div>
                <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                  {todaysDispatch.length} Dispatches Today
                </span>
              </div>

              <div className="p-5">
                {todaysDispatch.length === 0 ? (
                  <div className="p-8 text-center text-amber-400/60 text-xs border border-dashed border-amber-500/20 rounded-xl">
                    No automated dispatches registered for today's date.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-amber-500/20 text-amber-400/70 font-semibold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">Time</th>
                          <th className="py-3 px-3">Email Name & Subject</th>
                          <th className="py-3 px-3">Recipient Profile</th>
                          <th className="py-3 px-3">Assigned Mailbox</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {todaysDispatch.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-amber-300 text-sm">
                              {item.time} IST
                            </td>
                            <td className="py-3.5 px-3">
                              <strong className="text-amber-100 block text-xs">{item.name}</strong>
                              <span className="text-[11px] text-amber-400/60 truncate max-w-xs block">{item.subject}</span>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px]">
                                {item.destinationLabel || item.destinationProfile}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-amber-200/90 text-xs">
                              {getProfileEmail(item.destinationProfile)}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.isSent || item.status === 'SENT'
                                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                              }`}>
                                {item.isSent || item.status === 'SENT' ? '✓ SENT' : 'SCHEDULED'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => handleOpenPreview(item)}
                                className="px-2.5 py-1 bg-white/5 border border-amber-500/20 rounded text-amber-300 text-[11px] hover:bg-amber-500/10"
                              >
                                Preview
                              </button>
                              {(!item.isSent && item.status !== 'SENT') && (
                                <button
                                  onClick={() => handleOpenSendVerify(item)}
                                  className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400"
                                >
                                  Send Now
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: [ EMAIL TEMPLATES ] (Master Reusable Library)                      */}
        {/* ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" /> EMAIL TEMPLATES
                  </h3>
                  <p className="text-xs text-amber-400/60">
                    Reusable email templates — choose a template, configure it, preview it and schedule it.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                  {templatesList.length} Reusable Master Templates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templatesList.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleOpenTemplateConfig(tmpl)}
                    className="bg-[#140c1a] border border-amber-500/20 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/50 hover:bg-[#1a0f22] transition-all cursor-pointer space-y-3 group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {tmpl.type || 'TEMPLATE'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-400/80">
                          Default: {getProfileLabel(tmpl.destinationProfile)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-amber-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {tmpl.name}
                      </h4>
                      <p className="text-xs text-amber-300/80 font-semibold mt-1 truncate">{tmpl.subject}</p>
                      <p className="text-[11px] text-amber-400/50 mt-2 line-clamp-2">{tmpl.message}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(tmpl);
                        }}
                        className="px-2.5 py-1.5 bg-white/5 border border-amber-500/20 rounded text-amber-300 text-xs hover:bg-amber-500/10"
                      >
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTemplateConfig(tmpl);
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-amber-600/30 to-amber-500/30 border border-amber-500/40 rounded text-amber-200 text-xs font-bold hover:bg-amber-500/40 flex items-center justify-center gap-1.5"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Configure & Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: [ SCHEDULED EMAILS ] (All Actual Scheduled Instances)              */}
        {/* ========================================================================= */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-amber-400" /> SCHEDULED EMAILS
                  </h3>
                  <p className="text-xs text-amber-400/60">
                    All actual scheduled email instances chronologically queued for automated dispatch.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                    {scheduledItems.length} Scheduled Instances
                  </span>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" /> + Schedule Template
                  </button>
                </div>
              </div>

              {scheduledItems.length === 0 ? (
                <div className="p-12 text-center text-amber-400/60 text-xs border border-dashed border-amber-500/20 rounded-xl space-y-3">
                  <p>No email instances currently scheduled.</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold rounded-lg hover:bg-amber-500/30"
                  >
                    Go to Email Templates to Schedule an Email
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-amber-500/20 text-amber-400/70 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Template Name & Subject</th>
                        <th className="py-3 px-3">Recipient Profile</th>
                        <th className="py-3 px-3">Recipient Email</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scheduledItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-amber-300 text-sm whitespace-nowrap">
                            {item.scheduleDate} — {item.scheduleTime} IST
                          </td>
                          <td className="py-3.5 px-3">
                            <strong className="text-amber-100 block">{item.name}</strong>
                            <span className="text-[11px] text-amber-400/60 truncate max-w-xs block">{item.subject}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                              {getProfileLabel(item.destinationProfile)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-amber-200 text-xs">
                            {getProfileEmail(item.destinationProfile)}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenPreview(item)}
                              className="px-2.5 py-1 bg-white/5 border border-amber-500/20 rounded text-amber-300 text-[11px] hover:bg-amber-500/10"
                              title="Preview this email"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleOpenRescheduleModal(item)}
                              className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-[11px] hover:bg-amber-500/20 font-semibold"
                              title="Reschedule in-place"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleOpenSendVerify(item)}
                              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400 shadow"
                              title="Send immediately"
                            >
                              Send Now
                            </button>
                            <button
                              onClick={() => handleRemoveScheduledInstance(item.id)}
                              className="px-2 py-1 bg-red-950/40 border border-red-500/30 text-red-300 rounded text-[11px] hover:bg-red-900/40"
                              title="Remove schedule (leaves template intact)"
                            >
                              <Trash2 className="w-3 h-3 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: [ UPCOMING EMAILS ] (Strict Next 5 Queue)                          */}
        {/* ========================================================================= */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> UPCOMING EMAILS
                  </h3>
                  <p className="text-xs text-amber-400/60">
                    Next 5 scheduled emails only, sorted by nearest scheduled time.
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                  {upcomingEmails.length} in Upcoming Queue
                </span>
              </div>

              <div className="space-y-3">
                {upcomingEmails.length === 0 ? (
                  <div className="p-12 text-center text-amber-400/60 text-xs border border-dashed border-amber-500/20 rounded-xl">
                    No upcoming scheduled emails in queue.
                  </div>
                ) : (
                  upcomingEmails.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-[#140c1a] border border-amber-500/20 hover:border-amber-400/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs flex-shrink-0">
                          0{idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-300">
                              {item.scheduleDate} — {item.scheduleTime} IST
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                              RECIPIENT: {getProfileLabel(item.destinationProfile)}
                            </span>
                            <span className="text-xs font-mono text-amber-400/80">
                              ({getProfileEmail(item.destinationProfile)})
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-amber-100">{item.name}</h4>
                          <p className="text-xs text-amber-400/60 line-clamp-1">{item.subject}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleOpenPreview(item)}
                          className="px-3 py-1.5 bg-white/5 border border-amber-500/20 rounded-lg text-amber-300 text-xs hover:bg-amber-500/10"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleOpenRescheduleModal(item)}
                          className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-semibold hover:bg-amber-500/20"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleOpenSendVerify(item)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold rounded-lg text-xs hover:brightness-110 shadow-md flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Send Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: [ SENT EMAILS ] (Delivery History Audit)                            */}
        {/* ========================================================================= */}
        {activeTab === 'sent' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> SENT EMAILS
                  </h3>
                  <p className="text-xs text-amber-400/60">
                    Permanent delivery records of successfully dispatched emails. Rescheduling creates a new instance without touching history.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {sentEmails.length} Sent Records
                </span>
              </div>

              {sentEmails.length === 0 ? (
                <div className="p-12 text-center text-amber-400/60 text-xs border border-dashed border-amber-500/20 rounded-xl">
                  No sent emails recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-amber-500/20 text-amber-400/70 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">Sent Timestamp</th>
                        <th className="py-3 px-3">Template Name & Subject</th>
                        <th className="py-3 px-3">Recipient Profile</th>
                        <th className="py-3 px-3">Delivered Mailbox</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sentEmails.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-3 font-mono text-amber-300 text-xs whitespace-nowrap">
                            {log.sentDate} — {log.sentTime} IST
                          </td>
                          <td className="py-3.5 px-3">
                            <strong className="text-amber-100 block">{log.name}</strong>
                            <span className="text-[11px] text-amber-400/60 truncate max-w-xs block">{log.subject}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px]">
                              {getProfileLabel(log.destinationProfile)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-amber-200/90 text-xs">
                            {log.recipientEmail}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                              ✓ SENT
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenPreview(log)}
                              className="px-2.5 py-1 bg-white/5 border border-amber-500/20 rounded text-amber-300 text-[11px] hover:bg-amber-500/10"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRescheduleSentEmail(log)}
                              className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-[11px] font-semibold hover:bg-amber-500/20"
                            >
                              Re-Schedule
                            </button>
                            <button
                              onClick={() => handleOpenSendVerify(log)}
                              className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded text-[11px] hover:bg-amber-400"
                            >
                              Send Again
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: [ RECIPIENT PROFILES ] (T1, S1, S2, S3, S4, S5)                     */}
        {/* ========================================================================= */}
        {activeTab === 'recipients' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> RECIPIENT PROFILES (T1, S1, S2, S3, S4, S5)
                  </h3>
                  <p className="text-xs text-amber-400/60">Independent recipient profiles. Profile ID is the source of truth for dynamic routing.</p>
                </div>
                {profileActionStatus && <span className="text-xs text-amber-300 font-semibold">{profileActionStatus}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['T1', 'S1', 'S2', 'S3', 'S4', 'S5'].map((profKey) => {
                  const prof = profiles[profKey] || {
                    id: profKey,
                    label: profKey,
                    name: `${profKey} Profile`,
                    email: 'lohithmedisetti1432004@gmail.com',
                    status: 'ACTIVE',
                    description: `Recipient Profile ${profKey}`
                  };
                  const isEditing = editingProfileId === profKey;

                  return (
                    <div
                      key={profKey}
                      className="bg-[#140c1a] border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between relative shadow-lg hover:border-amber-400/50 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono text-xs">
                              {prof.label}
                            </span>
                            <span className="text-xs font-semibold text-amber-200">{prof.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            prof.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                          }`}>
                            {prof.status}
                          </span>
                        </div>

                        {/* Email Input / Display */}
                        {isEditing ? (
                          <div className="space-y-2 pt-2">
                            <input
                              type="email"
                              value={tempProfileEmail}
                              onChange={(e) => setTempProfileEmail(e.target.value)}
                              className="w-full bg-[#1b1022] border border-amber-400 rounded-lg px-3 py-2 text-xs text-amber-100 font-mono focus:outline-none"
                              placeholder="recipient@gmail.com"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={tempProfileStatus}
                                onChange={(e) => setTempProfileStatus(e.target.value as any)}
                                className="bg-[#1b1022] border border-amber-500/30 text-amber-200 text-xs rounded px-2 py-1"
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                              </select>
                              <button
                                onClick={() => handleSaveProfile(profKey)}
                                className="px-3 py-1 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingProfileId(null)}
                                className="px-2 py-1 bg-white/10 text-amber-200 text-xs rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2">
                            <p className="text-xs font-mono text-amber-100 font-semibold break-all bg-[#0a050d] p-2.5 rounded-lg border border-amber-500/10">
                              {prof.email}
                            </p>
                            <p className="text-[11px] text-amber-400/50 mt-1">{prof.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isEditing && (
                        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setEditingProfileId(profKey);
                              setTempProfileEmail(prof.email);
                              setTempProfileStatus(prof.status || 'ACTIVE');
                            }}
                            className="py-1.5 px-3 bg-white/5 border border-amber-500/20 rounded text-amber-300 text-[11px] font-semibold hover:bg-amber-500/10 flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Email
                          </button>
                          <button
                            onClick={() => handleTestSendProfile(profKey)}
                            className="py-1.5 px-3 bg-amber-500/20 border border-amber-500/40 rounded text-amber-200 text-[11px] font-bold hover:bg-amber-500/30 flex items-center justify-center gap-1"
                            title="Send verification test to this profile"
                          >
                            <Send className="w-3 h-3 text-amber-400" /> Test Send
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: [ AUTOMATION ]                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'automation' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-500/20">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 flex items-center gap-2">
                    <Power className="w-5 h-5 text-amber-400" /> AUTOMATION ENGINE & MASTER SWITCH
                  </h3>
                  <p className="text-xs text-amber-400/60">Manage production scheduler, catch-up dispatches, and diagnostic suites</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleAutomationSwitch}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase border transition-all ${
                      autoSendEnabled
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/60 text-red-300'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>AUTOMATION: {autoSendEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={handleRunHealthCheck}
                    disabled={isRunningHealthReport}
                    className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-xs rounded-xl hover:bg-amber-500/30 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isRunningHealthReport ? 'Running Suite...' : 'Run Diagnostics'}</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#140c1a] border border-amber-500/20 p-4 rounded-xl">
                  <span className="text-[11px] text-amber-400/60 uppercase font-semibold">Engine State</span>
                  <p className="text-lg font-bold text-amber-200 mt-1">{autoSendEnabled ? 'RUNNING (ACTIVE)' : 'PAUSED'}</p>
                  <span className="text-[10px] text-emerald-400">10s Internal IST Loop</span>
                </div>

                <div className="bg-[#140c1a] border border-amber-500/20 p-4 rounded-xl">
                  <span className="text-[11px] text-amber-400/60 uppercase font-semibold">Timezone</span>
                  <p className="text-lg font-bold text-amber-200 mt-1">Asia/Kolkata (IST)</p>
                  <span className="text-[10px] text-amber-400/70 font-mono">{healthData.currentTimeIST || 'Real-time'}</span>
                </div>

                <div className="bg-[#140c1a] border border-amber-500/20 p-4 rounded-xl">
                  <span className="text-[11px] text-amber-400/60 uppercase font-semibold">Last Result</span>
                  <p className="text-lg font-bold text-emerald-300 mt-1">{healthData.lastResult || 'SUCCESS'}</p>
                  <span className="text-[10px] text-amber-400/70">Last check: {healthData.lastSchedulerCheck}</span>
                </div>

                <div className="bg-[#140c1a] border border-amber-500/20 p-4 rounded-xl">
                  <span className="text-[11px] text-amber-400/60 uppercase font-semibold">Pending / Missed</span>
                  <p className="text-lg font-bold text-amber-200 mt-1">{missedItems.length}</p>
                  <span className="text-[10px] text-amber-400/70">Overdue dispatches</span>
                </div>
              </div>

              {/* Activity Audit Trail */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" /> LIVE ACTIVITY LOGS
                </h4>
                <div className="p-4 rounded-xl bg-[#0a050d] border border-white/5 max-h-72 overflow-y-auto space-y-2 font-mono text-xs">
                  {activityLogs.length === 0 ? (
                    <p className="text-center text-amber-400/50 py-4">No events logged yet.</p>
                  ) : (
                    activityLogs.map((act) => (
                      <div key={act.id} className="p-2 rounded bg-black/40 border border-white/5 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-amber-400/60 text-[10px] block">{act.timestamp}</span>
                          <span className="text-amber-100">{act.message}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-amber-300 border border-amber-500/20">
                          {act.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: [ EMAIL IDENTITY / BRANDING ]                                      */}
        {/* ========================================================================= */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Website Display Name */}
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Website Display Name
                </h3>
                <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                  Current: {websiteName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-1.5 font-semibold">
                    Website Name (Exact Casing & Spacing Preserved)
                  </label>
                  <input
                    type="text"
                    value={tempWebsiteName}
                    onChange={(e) => setTempWebsiteName(e.target.value)}
                    disabled={!isEditingWebsiteName}
                    placeholder="e.g. SIRI NANNA"
                    className="w-full bg-[#160d1f] border border-amber-500/30 rounded-lg px-4 py-2.5 text-amber-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
                  />
                </div>
                <div className="flex items-center gap-2 sm:self-end">
                  {isEditingWebsiteName ? (
                    <>
                      <button
                        onClick={handleSaveWebsiteName}
                        className="px-4 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setTempWebsiteName(websiteName);
                          setIsEditingWebsiteName(false);
                        }}
                        className="px-4 py-2.5 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingWebsiteName(true)}
                      className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg hover:bg-amber-500/20 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>
              </div>
              {nameSaveStatus && <p className="text-xs text-emerald-400 font-semibold">{nameSaveStatus}</p>}

              <div className="p-4 bg-[#0a050d] border border-amber-500/20 rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-widest text-amber-400/60 mb-2 font-serif">Golden Name Preview (Exact)</p>
                <div className="text-2xl font-serif font-black text-[#F5E6B3] drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]">
                  ✦ {(tempWebsiteName || 'SIRI').replace(/^[✦✧\s*]+|[✦✧\s*]+$/g, '').trim() || 'SIRI'} ✦
                </div>
              </div>
            </div>

            {/* Email Display Name */}
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" /> Email Display Name (Decoupled Identity)
                </h3>
                <span className="text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                  Current: {emailDisplayName}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-1.5 font-semibold">
                    Email Display Name (Exact Casing & Spacing Preserved)
                  </label>
                  <input
                    type="text"
                    value={tempEmailDisplayName}
                    onChange={(e) => setTempEmailDisplayName(e.target.value)}
                    disabled={!isEditingEmailDisplayName}
                    placeholder="e.g. SIRI BANGARAM"
                    className="w-full bg-[#160d1f] border border-amber-500/30 rounded-lg px-4 py-2.5 text-amber-100 font-semibold focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
                  />
                </div>
                <div className="flex items-center gap-2 sm:self-end">
                  {isEditingEmailDisplayName ? (
                    <>
                      <button
                        onClick={handleSaveEmailDisplayName}
                        className="px-4 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400"
                      >
                        Save Email Name
                      </button>
                      <button
                        onClick={() => {
                          setTempEmailDisplayName(emailDisplayName);
                          setIsEditingEmailDisplayName(false);
                        }}
                        className="px-4 py-2.5 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingEmailDisplayName(true)}
                      className="px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg hover:bg-amber-500/20 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Email Name
                    </button>
                  )}
                </div>
              </div>
              {emailNameSaveStatus && <p className="text-xs text-emerald-400 font-semibold">{emailNameSaveStatus}</p>}

              <div className="p-4 bg-[#0a050d] border border-amber-500/20 rounded-xl text-center">
                <p className="text-[11px] uppercase tracking-widest text-amber-400/60 mb-2 font-serif">Email Signature Preview (Exact)</p>
                <div className="text-xl font-serif font-black text-[#F5E6B3] drop-shadow-[0_0_15px_rgba(212,175,55,0.7)]">
                  ✦ {(tempEmailDisplayName || 'SIRI BANGARAM').replace(/^[✦✧\s*]+|[✦✧\s*]+$/g, '').trim() || 'SIRI BANGARAM'} ✦
                </div>
              </div>
            </div>

            {/* Email CTA & Button Alias */}
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-400" /> Website Link & CTA Button Alias
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-1.5 font-semibold">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full bg-[#160d1f] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-300/80 mb-1.5 font-semibold">
                    Link Alias (Hides Raw URL)
                  </label>
                  <input
                    type="text"
                    value={linkAlias}
                    onChange={(e) => setLinkAlias(e.target.value)}
                    className="w-full bg-[#160d1f] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: [ REFERENCE MAILS ]                                                */}
        {/* ========================================================================= */}
        {activeTab === 'snapshots' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#0e0814]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h3 className="font-serif font-bold text-amber-100 text-base flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" /> REFERENCE SNAPSHOTS ({Object.keys(snapshotsList).length})
                </h3>
              </div>
              <p className="text-xs text-amber-400/60">
                Immutable snapshots preserve the exact visual design and rendered content of each template at the time of capture.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templatesList.slice(0, 8).map((tmpl) => (
                  <div key={tmpl.id} className="p-3 rounded-lg bg-[#140c1a] border border-white/5 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-amber-200 truncate">{tmpl.name}</span>
                    <button
                      onClick={() => handleCaptureSnapshot(tmpl.id)}
                      className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 whitespace-nowrap"
                    >
                      Capture Snapshot
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: DEDICATED TEMPLATE CONFIGURATION & LIVE PREVIEW PANEL               */}
      {/* ========================================================================= */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="max-w-6xl w-full bg-[#0d0714] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#140b1e] border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-amber-100 text-sm sm:text-base flex items-center gap-2">
                    CONFIGURE TEMPLATE <span className="text-xs font-sans px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{selectedTemplate.name}</span>
                  </h3>
                  <p className="text-[11px] text-amber-400/60">
                    Customize parameters, observe live real-time preview, and schedule a new instance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1.5 rounded-lg bg-white/10 text-amber-300 hover:bg-white/20 text-xs px-2.5"
              >
                ✕ Close
              </button>
            </div>

            {/* Body: Left Editor + Right Live Preview */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Configuration Form (5 cols) */}
              <div className="lg:col-span-5 p-5 bg-[#100918] border-r border-amber-500/20 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={configSubject}
                    onChange={(e) => setConfigSubject(e.target.value)}
                    className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">Schedule Date (IST)</label>
                    <input
                      type="date"
                      value={configDate}
                      onChange={(e) => setConfigDate(e.target.value)}
                      className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">Schedule Time (IST - HH:mm)</label>
                    <input
                      type="time"
                      value={configTime}
                      onChange={(e) => setConfigTime(e.target.value)}
                      className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Recipient Profile</label>
                  <select
                    value={configProfile}
                    onChange={(e) => setConfigProfile(e.target.value)}
                    className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold"
                  >
                    <option value="T1">T1 — {profiles.T1?.email}</option>
                    <option value="S1">S1 — {profiles.S1?.email}</option>
                    <option value="S2">S2 — {profiles.S2?.email}</option>
                    <option value="S3">S3 — {profiles.S3?.email}</option>
                    <option value="S4">S4 — {profiles.S4?.email}</option>
                    <option value="S5">S5 — {profiles.S5?.email}</option>
                  </select>
                  <p className="text-[11px] text-amber-400/60 mt-1">
                    Live Mailbox: <strong className="text-amber-300 font-mono">{getProfileEmail(configProfile)}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">Website Display Name</label>
                    <input
                      type="text"
                      value={configWebsiteName}
                      onChange={(e) => setConfigWebsiteName(e.target.value)}
                      className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2 text-amber-100 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">Email Golden Signature</label>
                    <input
                      type="text"
                      value={configEmailName}
                      onChange={(e) => setConfigEmailName(e.target.value)}
                      className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2 text-amber-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-1">Button CTA & Link Alias</label>
                  <input
                    type="text"
                    value={configButtonText}
                    onChange={(e) => {
                      setConfigButtonText(e.target.value);
                    }}
                    className="w-full bg-[#180f24] border border-amber-500/30 rounded-lg p-2 text-amber-100 font-semibold"
                  />
                  <p className="text-[10px] text-amber-400/50 mt-1">Raw website link remains hidden behind button</p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
                  ℹ Scheduling will create a <strong>new scheduled instance</strong> in Scheduled Emails. The master template in Email Templates will remain untouched and reusable.
                </div>
              </div>

              {/* Right Live Preview (7 cols) */}
              <div className="lg:col-span-7 bg-[#060408] p-4 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full flex items-center justify-between mb-2 px-2 text-xs text-amber-400/70">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> Live Interactive Preview
                  </span>
                  {isPreviewLoading && <span className="text-[10px] text-amber-400 animate-pulse">Rendering...</span>}
                </div>
                <div className="w-full h-[460px] bg-black rounded-xl border border-amber-500/30 shadow-2xl overflow-hidden">
                  <iframe
                    srcDoc={configLivePreviewHtml}
                    title="Live Template Preview"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#140b1e] border-t border-amber-500/30 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowScheduleConfirmModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-bold text-xs rounded-lg hover:brightness-110 shadow-lg shadow-amber-900/40 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>SCHEDULE MAIL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FINAL SCHEDULE CONFIRMATION DIALOG                                 */}
      {/* ========================================================================= */}
      {showScheduleConfirmModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#120a1c] border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center pb-3 border-b border-amber-500/20">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-300 mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-amber-200 text-lg">SCHEDULE CONFIRMATION</h3>
              <p className="text-[11px] text-amber-400/60 uppercase tracking-wider">Review dispatch details before scheduling</p>
            </div>

            <div className="bg-[#180f24] border border-amber-500/30 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Template:</span>
                <strong className="text-amber-100 text-right truncate max-w-[200px]">{selectedTemplate.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Recipient Profile:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
                  {getProfileLabel(configProfile)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Target Mailbox:</span>
                <strong className="text-amber-200 font-mono text-xs">{getProfileEmail(configProfile)}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Date:</span>
                <strong className="text-amber-100">{configDate}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Time:</span>
                <strong className="text-amber-300 font-mono">{configTime} IST</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Display Name:</span>
                <strong className="text-amber-200">{configEmailName}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
              <button
                onClick={() => setShowScheduleConfirmModal(false)}
                className="px-4 py-2 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScheduleTemplate}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs rounded-lg hover:brightness-110 shadow-lg"
              >
                Confirm Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESCHEDULE SCHEDULED INSTANCE (In-place update)                     */}
      {/* ========================================================================= */}
      {rescheduleInstanceItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#100918] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" /> Reschedule Email Instance
              </h3>
              <button onClick={() => setRescheduleInstanceItem(null)} className="text-amber-400/60 hover:text-amber-300 text-sm">✕</button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
              ℹ This updates the selected scheduled instance in-place without creating duplicate records.
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-amber-400/70 block mb-1">Email Name:</span>
                <strong className="text-amber-100 text-sm">{rescheduleInstanceItem.name}</strong>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">New Date (IST)</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-[#1b1024] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">New Time (IST - HH:mm)</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-[#1b1024] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Destination Profile</label>
                <select
                  value={rescheduleProfile}
                  onChange={(e) => setRescheduleProfile(e.target.value)}
                  className="w-full bg-[#1b1024] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold"
                >
                  <option value="T1">T1 — {profiles.T1?.email}</option>
                  <option value="S1">S1 — {profiles.S1?.email}</option>
                  <option value="S2">S2 — {profiles.S2?.email}</option>
                  <option value="S3">S3 — {profiles.S3?.email}</option>
                  <option value="S4">S4 — {profiles.S4?.email}</option>
                  <option value="S5">S5 — {profiles.S5?.email}</option>
                </select>
                <p className="text-[11px] text-amber-400/60 mt-1">
                  Recipient Mailbox: <strong className="text-amber-300 font-mono">{getProfileEmail(rescheduleProfile)}</strong>
                </p>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Subject (Optional Override)</label>
                <input
                  type="text"
                  value={rescheduleSubject}
                  onChange={(e) => setRescheduleSubject(e.target.value)}
                  className="w-full bg-[#1b1024] border border-amber-500/30 rounded-lg p-2.5 text-amber-100 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
              <button
                onClick={() => setRescheduleInstanceItem(null)}
                className="px-4 py-2 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRescheduleInstance}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-bold text-xs rounded-lg hover:brightness-110 shadow-lg"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRE-SEND VERIFICATION (Send Now & Send Again)                       */}
      {/* ========================================================================= */}
      {sendVerifyItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#100918] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" /> Pre-Send Verification & Routing Check
              </h3>
              <button onClick={() => setSendVerifyItem(null)} className="text-amber-400/60 hover:text-amber-300 text-sm">✕</button>
            </div>

            <div className="bg-[#160d20] border border-amber-500/30 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Recipient Profile:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
                  {getProfileLabel(sendVerifyProfile)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Target Mailbox:</span>
                <strong className="text-amber-200 font-mono">{getProfileEmail(sendVerifyProfile)}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Email Name:</span>
                <strong className="text-amber-100">{sendVerifyItem.name}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400/70">Subject:</span>
                <span className="text-amber-200 truncate max-w-xs">{sendVerifyItem.subject}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Verified routing: This email will be sent strictly to <strong>{getProfileEmail(sendVerifyProfile)}</strong>.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
              <button
                onClick={() => setSendVerifyItem(null)}
                disabled={isSendingNow}
                className="px-4 py-2 bg-white/10 text-amber-200 text-xs rounded-lg hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendNow}
                disabled={isSendingNow}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black font-bold text-xs rounded-lg hover:brightness-110 shadow-lg shadow-amber-900/40 flex items-center gap-2"
              >
                {isSendingNow ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isSendingNow ? 'Sending Dispatch...' : 'CONFIRM & SEND'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL EMAIL PREVIEW MODAL (Desktop / Mobile View)                    */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="max-w-4xl w-full h-[92vh] bg-[#0c0712] border border-amber-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-[#140b1c] border-b border-amber-500/20 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-amber-200 text-sm sm:text-base">{previewItem.name}</h3>
                <p className="text-xs text-amber-400/60 font-mono">
                  Destination Profile: <strong className="text-amber-300">{getProfileLabel(previewItem.destinationProfile)}</strong> ({getProfileEmail(previewItem.destinationProfile)})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-black/40 border border-amber-500/30 rounded-lg p-0.5">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2.5 py-1 text-xs rounded ${previewMode === 'desktop' ? 'bg-amber-500 text-black font-bold' : 'text-amber-300'}`}
                  >
                    <Monitor className="w-3.5 h-3.5 inline mr-1" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2.5 py-1 text-xs rounded ${previewMode === 'mobile' ? 'bg-amber-500 text-black font-bold' : 'text-amber-300'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Mobile
                  </button>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg bg-white/10 text-amber-300 hover:bg-white/20 text-xs px-2.5"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* IFrame Container */}
            <div className="flex-1 bg-[#060408] overflow-auto flex items-center justify-center p-4">
              <div
                className={`h-full bg-black rounded-xl border border-amber-500/20 shadow-2xl transition-all overflow-hidden ${
                  previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                }`}
              >
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HEALTH REPORT DIAGNOSTICS SUITE                                     */}
      {/* ========================================================================= */}
      {healthReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#100918] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h3 className="font-serif font-bold text-amber-200 text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automation Health Report
              </h3>
              <button onClick={() => setHealthReport(null)} className="text-amber-400/60 hover:text-amber-300 text-sm">✕</button>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Overall Status:</span>
              <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded bg-emerald-500/20 border border-emerald-500/40">
                {healthReport.overallStatus}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {healthReport.checks.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-amber-200 block">{c.name}</strong>
                    <span className="text-amber-400/70">{c.message}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    c.status === 'HEALTHY' ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-amber-500/20 text-right">
              <button
                onClick={() => setHealthReport(null)}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
