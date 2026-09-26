import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Mail,
  History,
  Settings,
  Key,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Camera,
  ExternalLink,
  Lock,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Search,
  Smartphone,
  Monitor,
  Power,
  Check,
  Sparkles,
  Layers,
  AtSign,
} from 'lucide-react';
import { tithiService } from '../../services/tithiService';
import { isSupabaseConfigured, supabase, type TithiDateRecord, type EmailLogRecord } from '../../lib/supabase';
import { BIRTH_DETAILS } from '../../data/timelineData';
import { audioEngine } from '../../utils/audioEngine';
import {
  DEFAULT_EMAIL_ITEMS,
  DEFAULT_WEBSITE_URL,
  type EmailItem,
  type ReferenceSnapshot,
} from '../../../server/emailTemplates';

const BACKEND_URL = 'http://localhost:3001';

export interface AdminPanelProps {
  onBackToFilm?: () => void;
  onDataUpdated?: () => void;
  onBack?: () => void;
  onTithiDataUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToFilm,
  onDataUpdated,
  onBack,
  onTithiDataUpdated,
}) => {
  const handleExit = onBackToFilm || onBack || (() => window.history.back());

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'logs' | 'settings'>('dashboard');

  // Website Name Settings (Controls Website Identity)
  const [websiteName, setWebsiteName] = useState('SIRI');
  const [tempWebsiteName, setTempWebsiteName] = useState('SIRI');
  const [isEditingWebsiteName, setIsEditingWebsiteName] = useState(false);
  const [isSavingWebsiteName, setIsSavingWebsiteName] = useState(false);

  // Email Display Name Settings (Independent Email-Specific Setting)
  const [emailDisplayName, setEmailDisplayName] = useState('SIRI BANGARAM');
  const [tempEmailDisplayName, setTempEmailDisplayName] = useState('SIRI BANGARAM');
  const [isEditingEmailDisplayName, setIsEditingEmailDisplayName] = useState(false);
  const [isSavingEmailDisplayName, setIsSavingEmailDisplayName] = useState(false);
  const [emailDisplayNameNotice, setEmailDisplayNameNotice] = useState<string | null>(null);

  // Automation Master Switch State
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [isTogglingSwitch, setIsTogglingSwitch] = useState(false);
  const [pendingEmailsCount, setPendingEmailsCount] = useState(0);

  // Email Items Collection State
  const [emailItems, setEmailItems] = useState<EmailItem[]>(DEFAULT_EMAIL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');

  // Reference Snapshots State
  const [snapshots, setSnapshots] = useState<ReferenceSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ReferenceSnapshot | null>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  // Pre-Send Verification Modal State (SEND -> PREVIEW -> CONFIRM FLOW)
  const [preSendItem, setPreSendItem] = useState<EmailItem | null>(null);
  const [isPreSendModalOpen, setIsPreSendModalOpen] = useState(false);
  const [preSendCustomRecipient, setPreSendCustomRecipient] = useState('');
  const [isPreSendTestMode, setIsPreSendTestMode] = useState(false);
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sendResultMsg, setSendResultMsg] = useState('');

  // Standalone Email Preview Modal
  const [previewEmailItem, setPreviewEmailItem] = useState<EmailItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Create / Edit Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState<EmailItem>({
    id: '',
    name: '',
    type: 'ADVANCE',
    subject: '',
    recipient: '',
    heading: '',
    topLabel: '',
    message: '',
    websiteUrl: DEFAULT_WEBSITE_URL,
    linkAlias: '',
    buttonText: 'ENTER YOUR STORY →',
    scheduleDate: '',
    scheduleTime: '',
    status: 'SCHEDULED',
    enabled: true,
    useGlobalEmailDisplayName: true,
    customDisplayName: '',
  });

  // Pending Emails Batch Dispatch Modal
  const [isSendAllPendingModalOpen, setIsSendAllPendingModalOpen] = useState(false);
  const [isSendingAllPending, setIsSendingAllPending] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Calendar / Tithi State
  const [calendarRecords, setCalendarRecords] = useState<TithiDateRecord[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingCalendarId, setEditingCalendarId] = useState<string | null>(null);
  const [formYear, setFormYear] = useState<number>(2026);
  const [formDate, setFormDate] = useState('');
  const [formTithi, setFormTithi] = useState('Ashwayuja Shukla Tritiya');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'unpublished'>('published');
  const [formNotes, setFormNotes] = useState('');

  // Logs State
  const [logs, setLogs] = useState<EmailLogRecord[]>([]);

  // SMTP Settings State
  const [smtpConfig, setSmtpConfig] = useState({
    websiteName: 'SIRI',
    displayName: 'SIRI',
    emailDisplayName: 'SIRI BANGARAM',
    websiteUrl: DEFAULT_WEBSITE_URL,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: 'lohithmedisetti@gmail.com',
    smtpPass: '',
    fromEmail: 'lohithmedisetti@gmail.com',
    recipientEmail: 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
    testRecipientEmail: 'lohithmedisetti1432004@gmail.com',
    autoSendEnabled: true,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Check auth session on load
  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsAuthenticated(true);
            loadAllData();
            return;
          }
        } catch {
          // Fallback
        }
      }
      const isDemoAuth = sessionStorage.getItem('siri_admin_authenticated');
      if (isDemoAuth === 'true') {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const loadAllData = async () => {
    try {
      // 1. Load Calendar Records
      const records = await tithiService.getAllDatesForAdmin();
      setCalendarRecords(records);

      // 2. Load Email Items
      try {
        const res = await fetch(`${BACKEND_URL}/api/email/items`);
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setEmailItems(data.items);
          } else {
            setEmailItems(DEFAULT_EMAIL_ITEMS);
          }
        } else {
          setEmailItems(DEFAULT_EMAIL_ITEMS);
        }
      } catch {
        setEmailItems(DEFAULT_EMAIL_ITEMS);
      }

      // 3. Load System Status & Automation Master Switch
      try {
        const statusRes = await fetch(`${BACKEND_URL}/api/email/status`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.autoSendEnabled !== undefined) {
            setAutoSendEnabled(statusData.autoSendEnabled);
          }
          if (statusData.websiteName) {
            setWebsiteName(statusData.websiteName);
            setTempWebsiteName(statusData.websiteName);
          } else if (statusData.displayName) {
            setWebsiteName(statusData.displayName);
            setTempWebsiteName(statusData.displayName);
          }
          if (statusData.emailDisplayName) {
            setEmailDisplayName(statusData.emailDisplayName);
            setTempEmailDisplayName(statusData.emailDisplayName);
          } else if (statusData.recipientName) {
            setEmailDisplayName(statusData.recipientName);
            setTempEmailDisplayName(statusData.recipientName);
          }
          if (statusData.pendingEmailsCount !== undefined) {
            setPendingEmailsCount(statusData.pendingEmailsCount);
          }
          if (statusData.recentLogs) {
            setLogs(statusData.recentLogs);
          }
        } else {
          const emailLogs = await tithiService.getEmailLogs();
          setLogs(emailLogs);
        }
      } catch {
        const emailLogs = await tithiService.getEmailLogs();
        setLogs(emailLogs);
      }

      // 4. Load Reference Snapshots
      try {
        const snapRes = await fetch(`${BACKEND_URL}/api/reference-snapshots`);
        if (snapRes.ok) {
          const snapData = await snapRes.json();
          setSnapshots(snapData.snapshots || []);
        }
      } catch {
        // Fallback
      }

      // 5. Load Email Config
      try {
        const configRes = await fetch(`${BACKEND_URL}/api/email/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          setSmtpConfig({
            websiteName: configData.websiteName || 'SIRI',
            displayName: configData.displayName || 'SIRI',
            emailDisplayName: configData.emailDisplayName || 'SIRI BANGARAM',
            websiteUrl: configData.websiteUrl || DEFAULT_WEBSITE_URL,
            smtpHost: configData.smtpHost || 'smtp.gmail.com',
            smtpPort: configData.smtpPort || 465,
            smtpUser: configData.smtpUser || 'lohithmedisetti@gmail.com',
            smtpPass: configData.smtpPass || '',
            fromEmail: configData.fromEmail || 'lohithmedisetti@gmail.com',
            recipientEmail: configData.recipientEmail || 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
            testRecipientEmail: configData.testRecipientEmail || 'lohithmedisetti1432004@gmail.com',
            autoSendEnabled: configData.autoSendEnabled !== undefined ? configData.autoSendEnabled : true,
          });
          if (configData.websiteName) {
            setWebsiteName(configData.websiteName);
            setTempWebsiteName(configData.websiteName);
          } else if (configData.displayName) {
            setWebsiteName(configData.displayName);
            setTempWebsiteName(configData.displayName);
          }
          if (configData.emailDisplayName) {
            setEmailDisplayName(configData.emailDisplayName);
            setTempEmailDisplayName(configData.emailDisplayName);
          }
        }
      } catch {
        // Fallback
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  // Helper to format golden name with luxury spacing
  const formatGoldenName = (name: string) => {
    if (!name) return '✦ S I R I ✦';
    const clean = name.trim().toUpperCase();
    const words = clean.split(/\s+/);
    return '✦ ' + words.map((w) => w.split('').join(' ')).join('   ') + ' ✦';
  };

  // Helper to determine effective email display name for an item
  const getEffectiveEmailDisplayName = (item?: EmailItem | null) => {
    if (!item) return emailDisplayName || 'SIRI BANGARAM';
    if (item.useGlobalEmailDisplayName === false && item.customDisplayName && item.customDisplayName.trim()) {
      return item.customDisplayName.trim();
    }
    return emailDisplayName || 'SIRI BANGARAM';
  };

  // Dynamic Calculation of Next Two Upcoming Emails
  const actionableUpcoming = emailItems
    .filter(
      (it) =>
        it.enabled &&
        (it.status === 'SCHEDULED' || it.status === 'READY' || it.status === 'PENDING') &&
        it.scheduleDate &&
        it.scheduleTime
    )
    .sort((a, b) => `${a.scheduleDate} ${a.scheduleTime}`.localeCompare(`${b.scheduleDate} ${b.scheduleTime}`));

  const nextEmail = actionableUpcoming[0] || null;
  const secondUpcomingEmail = actionableUpcoming[1] || null;

  // Helper to get snapshot for an email
  const getSnapshotForEmail = (emailId: string): ReferenceSnapshot | undefined => {
    return snapshots.find((s) => s.emailId === emailId);
  };

  // -------------------------------------------------------------
  // Auth Handlers
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('siri_admin_authenticated', 'true');
        audioEngine.playSacredChime(540, 2.5);
        await loadAllData();
        return;
      }
    } catch {
      // Fallback local check
    }

    if (password === 'mendu' || password === 'admin123' || password === 'siri143' || password === 'divine2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('siri_admin_authenticated', 'true');
      audioEngine.playSacredChime(540, 2.5);
      await loadAllData();
    } else {
      setAuthError('Invalid Admin Password. Access Denied.');
      audioEngine.playSacredChime(270, 1.0);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('siri_admin_authenticated');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  // -------------------------------------------------------------
  // Website Name Settings Handlers
  // -------------------------------------------------------------
  const handleSaveWebsiteName = async () => {
    if (!tempWebsiteName.trim()) return;
    setIsSavingWebsiteName(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings/name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteName: tempWebsiteName.trim(), displayName: tempWebsiteName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setWebsiteName(data.websiteName || data.displayName);
        setIsEditingWebsiteName(false);
        showToast(`Website Name updated to "${data.websiteName || data.displayName}"!`);
        if (onDataUpdated) onDataUpdated();
      } else {
        alert('Error saving website name');
      }
    } catch (err) {
      console.error(err);
      setWebsiteName(tempWebsiteName.trim());
      setIsEditingWebsiteName(false);
      showToast(`Website Name updated to "${tempWebsiteName.trim()}" (Local)!`);
    } finally {
      setIsSavingWebsiteName(false);
    }
  };

  // -------------------------------------------------------------
  // Email Display Name Settings Handlers (Independent Email-Specific)
  // -------------------------------------------------------------
  const handleSaveEmailDisplayName = async () => {
    if (!tempEmailDisplayName.trim()) return;
    setIsSavingEmailDisplayName(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings/email-display-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailDisplayName: tempEmailDisplayName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailDisplayName(data.emailDisplayName);
        setIsEditingEmailDisplayName(false);
        setEmailDisplayNameNotice('✓ EMAIL DISPLAY NAME UPDATED');
        setTimeout(() => setEmailDisplayNameNotice(null), 5000);
        showToast(`Email Display Name updated to "${data.emailDisplayName}"!`);
        await loadAllData();
      } else {
        alert('Error saving email display name');
      }
    } catch (err) {
      console.error(err);
      setEmailDisplayName(tempEmailDisplayName.trim());
      setIsEditingEmailDisplayName(false);
      setEmailDisplayNameNotice('✓ EMAIL DISPLAY NAME UPDATED (Local)');
      setTimeout(() => setEmailDisplayNameNotice(null), 5000);
      showToast(`Email Display Name updated to "${tempEmailDisplayName.trim()}" (Local)!`);
    } finally {
      setIsSavingEmailDisplayName(false);
    }
  };

  // -------------------------------------------------------------
  // Automation Master Switch Handler
  // -------------------------------------------------------------
  const handleToggleAutomationSwitch = async () => {
    const newState = !autoSendEnabled;
    setIsTogglingSwitch(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/automation-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState }),
      });
      if (res.ok) {
        const data = await res.json();
        setAutoSendEnabled(data.autoSendEnabled);
        setPendingEmailsCount(data.pendingItemsCount || 0);
        showToast(data.message || (newState ? 'Automation Activated!' : 'Automation Paused.'));
      }
    } catch (err) {
      console.error(err);
      setAutoSendEnabled(newState);
      showToast(newState ? 'Automation Activated (Local)' : 'Automation Paused (Local)');
    } finally {
      setIsTogglingSwitch(false);
    }
  };

  const handleSendAllPending = async () => {
    setIsSendingAllPending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/send-all-pending`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsSendAllPendingModalOpen(false);
        showToast(`Successfully dispatched ${data.dispatchedCount} pending emails!`);
        await loadAllData();
      } else {
        alert('Error dispatching pending emails');
      }
    } catch (err) {
      console.error(err);
      alert('Network error dispatching pending emails');
    } finally {
      setIsSendingAllPending(false);
    }
  };

  // -------------------------------------------------------------
  // Email Items Handlers
  // -------------------------------------------------------------
  const handleOpenAddEmail = () => {
    setIsEditingEmail(false);
    setEmailForm({
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Advance ${String(emailItems.length + 1).padStart(2, '0')} — Custom Letter`,
      type: 'ADVANCE',
      subject: 'A Special Note For You, SIRI ✨',
      recipient: smtpConfig.recipientEmail || 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com',
      heading: 'A HEARTFELT MOMENT FOR YOU',
      topLabel: 'ADVANCE BIRTHDAY DISPATCH',
      message: `Some moments are meant to be cherished, and some people make the world brighter just by being in it.

May your days always be filled with joy and gentle peace, {NAME}.`,
      websiteUrl: smtpConfig.websiteUrl || DEFAULT_WEBSITE_URL,
      linkAlias: 'ENTER YOUR STORY →',
      buttonText: 'ENTER YOUR STORY →',
      scheduleDate: '2026-09-27',
      scheduleTime: '12:00',
      status: 'SCHEDULED',
      enabled: true,
      useGlobalEmailDisplayName: true,
      customDisplayName: '',
    });
    setIsEmailModalOpen(true);
  };

  const handleOpenEditEmail = (item: EmailItem) => {
    setIsEditingEmail(true);
    setEmailForm({
      ...item,
      useGlobalEmailDisplayName: item.useGlobalEmailDisplayName !== undefined ? item.useGlobalEmailDisplayName : true,
      customDisplayName: item.customDisplayName || '',
    });
    setIsEmailModalOpen(true);
  };

  const handleSaveEmailForm = async (saveAsDraft: boolean = false) => {
    if (!emailForm.name.trim() || !emailForm.subject.trim()) {
      alert('Please provide Email Name and Subject Line');
      return;
    }

    const payload: EmailItem = {
      ...emailForm,
      status: saveAsDraft ? 'DRAFT' : emailForm.status,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/email/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(isEditingEmail ? 'Email updated successfully!' : 'Email created and scheduled!');
        setIsEmailModalOpen(false);
        await loadAllData();
      } else {
        alert('Failed to save email item on server.');
      }
    } catch (err) {
      console.error(err);
      if (isEditingEmail) {
        setEmailItems(emailItems.map((it) => (it.id === payload.id ? payload : it)));
      } else {
        setEmailItems([...emailItems, payload]);
      }
      setIsEmailModalOpen(false);
      showToast('Saved locally!');
    }
  };

  const handleDeleteEmailConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/items/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Email deleted successfully.');
        setDeleteConfirmId(null);
        await loadAllData();
      } else {
        alert('Error deleting email on server.');
      }
    } catch (err) {
      console.error(err);
      setEmailItems(emailItems.filter((it) => it.id !== deleteConfirmId));
      setDeleteConfirmId(null);
      showToast('Deleted locally.');
    }
  };

  // -------------------------------------------------------------
  // Pre-Send Verification Flow (SEND -> PREVIEW -> CONFIRM)
  // -------------------------------------------------------------
  const handleInitiateSend = (item: EmailItem, isTest: boolean = false) => {
    setPreSendItem(item);
    setIsPreSendTestMode(isTest);
    setPreSendCustomRecipient(
      isTest
        ? smtpConfig.testRecipientEmail || 'lohithmedisetti1432004@gmail.com'
        : item.recipient || smtpConfig.recipientEmail
    );
    setSendingState('idle');
    setSendResultMsg('');
    setIsPreSendModalOpen(true);
  };

  const handleConfirmAndSend = async () => {
    if (!preSendItem) return;
    setSendingState('sending');
    setSendResultMsg('Connecting to SMTP relay and dispatching luxury email...');

    try {
      const res = await fetch(`${BACKEND_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: preSendItem.id,
          recipient: preSendCustomRecipient,
          mode: isPreSendTestMode ? 'test' : 'real',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendingState('success');
        setSendResultMsg(`✓ Email delivered successfully! Message ID: ${data.messageId || 'OK'}`);
        audioEngine.playSacredChime(648, 2.8);
        showToast(`Dispatched: ${preSendItem.name}`);
        await loadAllData();
        setTimeout(() => {
          setIsPreSendModalOpen(false);
        }, 2200);
      } else {
        setSendingState('error');
        setSendResultMsg(`Send failed: ${data.error || 'SMTP rejection'}`);
      }
    } catch (err: any) {
      setSendingState('error');
      setSendResultMsg(`Network send error: ${err.message || 'Check server connection'}`);
    }
  };

  // Standalone Preview Opener
  const handleOpenPreview = (item: EmailItem) => {
    setPreviewEmailItem(item);
    setIsPreviewModalOpen(true);
  };

  // Reference Snapshot Capture / Replace
  const handleCaptureSnapshot = async (item: EmailItem) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reference-snapshots/capture/${item.id}`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast(`Reference snapshot captured for "${item.name}"!`);
        await loadAllData();
      } else {
        alert('Failed to capture snapshot on server.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error capturing snapshot');
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#1a0f24] border border-[#D4AF37] text-[#F5E6B3] font-cinzel text-xs font-bold tracking-wider shadow-[0_10px_30px_rgba(212,175,55,0.4)] flex items-center gap-2 animate-bounce';
    toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  // Filtered Email Items for Section 7: All Emails
  const filteredEmailItems = emailItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.linkAlias && item.linkAlias.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedTypeFilter === 'ALL' || item.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Calendar Record Handlers
  const handleSaveCalendarRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recordData = {
        id: editingCalendarId || undefined,
        year: formYear,
        date: formDate,
        tithi_name: formTithi,
        status: formStatus,
        notes: formNotes,
      };

      await tithiService.saveDate(recordData);
      showToast(editingCalendarId ? 'Tithi date updated!' : 'Tithi date created!');
      setIsCalendarModalOpen(false);
      const records = await tithiService.getAllDatesForAdmin();
      setCalendarRecords(records);
      if (onTithiDataUpdated) onTithiDataUpdated();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to save tithi date.');
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/email/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...smtpConfig,
          websiteName,
          displayName: websiteName,
          emailDisplayName,
        }),
      });
      if (res.ok) {
        showToast('Settings saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (err) {
      console.error(err);
      showToast('Config saved locally');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordChangeStatus({ success: false, message: 'New passwords do not match' });
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordChangeStatus({ success: true, message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordChangeStatus({ success: false, message: data.error || 'Failed to change password' });
      }
    } catch {
      setPasswordChangeStatus({ success: false, message: 'Server error changing password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // =============================================================
  // 1. ADMIN AUTHENTICATION SCREEN (PRESERVED PASSWORD GATE)
  // =============================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070409] text-[#FAF8F5] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1435] via-[#070409] to-[#040206] opacity-80" />
        <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#120a17]/90 border border-[#C5A059]/40 backdrop-blur-xl shadow-[0_0_50px_rgba(197,160,89,0.15)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37] mx-auto flex items-center justify-center bg-gradient-to-tr from-[#2a1338] to-[#120a17] text-[#F3E5AB] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
              <Lock className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#F5E6B3] tracking-widest uppercase pt-2">
              ADMIN PORTAL
            </h2>
            <p className="text-xs text-[#C5A059] tracking-wider">
              Enter Administrator credentials to access dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#C5A059]/40 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5E6B3] to-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? 'Verifying...' : 'Access Admin Portal →'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={handleExit}
              className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // 2. AUTHENTICATED ADMIN PORTAL DASHBOARD (8-SECTION HIERARCHY)
  // =============================================================
  return (
    <div className="min-h-screen bg-[#060408] text-[#FAF8F5] pb-20 font-sans selection:bg-[#D4AF37]/30 selection:text-[#F5E6B3]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0712]/95 backdrop-blur-md border-b border-[#C5A059]/30 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37] flex items-center justify-center bg-gradient-to-tr from-[#25102f] to-[#120718] text-[#F3E5AB] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              👑
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-serif font-bold text-[#F5E6B3] tracking-widest uppercase">
                ADMIN PORTAL
              </h1>
              <p className="text-[10px] text-[#C5A059] tracking-wider hidden sm:block">
                SIRI Birthday Experience & Email Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Navigation */}
            <div className="flex items-center bg-black/60 rounded-xl p-1 border border-[#C5A059]/30">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Tithi Dates
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'logs'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Logs
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </div>

            <button
              onClick={handleExit}
              className="px-3 py-1.5 rounded-lg border border-[#C5A059]/40 text-[#C5A059] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Website
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: EMAIL DASHBOARD HIERARCHY                          */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* ======================================================= */}
            {/* 1. TOP SECTION: SIRI NAME SETTINGS (WEBSITE IDENTITY)   */}
            {/* ======================================================= */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1c0d1e] via-[#0e0714] to-[#1c0d1e] border border-[#D4AF37]/40 shadow-[0_10px_35px_rgba(212,175,55,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" /> SIRI — NAME SETTINGS
                </div>
                <p className="text-xs text-gray-400">
                  Controls the main identity name used across the public website experience.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* Live Website Name Preview */}
                <div className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Website Preview:</span>
                  <span className="font-serif text-xs sm:text-sm font-bold tracking-widest text-[#F5E6B3] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                    {websiteName}
                  </span>
                </div>

                {/* Edit / Save Form */}
                {isEditingWebsiteName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempWebsiteName}
                      onChange={(e) => setTempWebsiteName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-black/80 border border-[#D4AF37] text-white focus:outline-none w-36 font-semibold uppercase"
                      placeholder="e.g. SIRI"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveWebsiteName}
                      disabled={isSavingWebsiteName}
                      className="px-3 py-1.5 text-xs font-bold uppercase rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 flex items-center gap-1 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5 text-black" />
                      SAVE
                    </button>
                    <button
                      onClick={() => {
                        setTempWebsiteName(websiteName);
                        setIsEditingWebsiteName(false);
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-600 text-gray-400 hover:text-white"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-300">
                      <span className="text-gray-500 mr-1.5">DISPLAY NAME:</span>
                      <strong className="text-white font-mono bg-black/40 px-2.5 py-1 rounded border border-[#C5A059]/30 uppercase">
                        [{websiteName}]
                      </strong>
                    </div>
                    <button
                      onClick={() => {
                        setTempWebsiteName(websiteName);
                        setIsEditingWebsiteName(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold uppercase rounded-lg border border-[#D4AF37]/50 text-[#F5E6B3] hover:bg-[#D4AF37]/10 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                      EDIT
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================= */}
            {/* 2. EMAIL DISPLAY NAME (INDEPENDENT EMAIL-SPECIFIC)      */}
            {/* ======================================================= */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#180a1c] via-[#09040c] to-[#180a1c] border-2 border-[#D4AF37] shadow-[0_10px_40px_rgba(212,175,55,0.22)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-serif font-black text-[#F5E6B3] uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    EMAIL DISPLAY NAME
                  </div>
                  <p className="text-xs text-[#C5A059]">
                    Name shown inside outgoing birthday and advance emails (Independent from website name)
                  </p>
                </div>

                {/* Live Golden Email Preview */}
                <div className="text-center sm:text-right bg-black/70 px-4 py-2 rounded-xl border border-[#D4AF37]/40 shadow-inner">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                    Live Email Golden Preview:
                  </div>
                  <div className="text-sm sm:text-base font-serif font-bold tracking-widest text-[#F5E6B3] drop-shadow-[0_0_12px_rgba(212,175,55,0.8)] pt-0.5">
                    {formatGoldenName(emailDisplayName)}
                  </div>
                </div>
              </div>

              {/* Status / Notice Toast */}
              {emailDisplayNameNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                  <CheckCircle className="w-4 h-4" />
                  <span>{emailDisplayNameNotice}</span>
                </div>
              )}

              {/* Edit / Change Form */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    CURRENT EMAIL DISPLAY NAME:
                  </div>
                  <div className="text-sm font-serif font-bold tracking-widest text-[#F5E6B3] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
                    {formatGoldenName(emailDisplayName)}
                  </div>
                </div>

                {isEditingEmailDisplayName ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={tempEmailDisplayName}
                        onChange={(e) => setTempEmailDisplayName(e.target.value)}
                        className="px-3.5 py-2 text-xs rounded-lg bg-black/90 border border-[#D4AF37] text-white font-serif font-bold tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-[#D4AF37] w-56"
                        placeholder="e.g. SIRI BANGARAM"
                        autoFocus
                      />
                      {tempEmailDisplayName.trim() !== emailDisplayName && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          Change: <span className="text-gray-300">{emailDisplayName}</span> → <span className="text-[#D4AF37] font-bold">{tempEmailDisplayName.trim()}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSaveEmailDisplayName}
                      disabled={isSavingEmailDisplayName}
                      className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F5E6B3] to-[#D4AF37] text-black hover:brightness-110 shadow-md flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      SAVE CHANGE
                    </button>
                    <button
                      onClick={() => {
                        setTempEmailDisplayName(emailDisplayName);
                        setIsEditingEmailDisplayName(false);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-gray-600 text-gray-300 hover:text-white"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTempEmailDisplayName(emailDisplayName);
                      setIsEditingEmailDisplayName(true);
                    }}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-[#D4AF37] text-[#F5E6B3] hover:bg-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-1.5 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    EDIT EMAIL DISPLAY NAME
                  </button>
                )}
              </div>
            </div>

            {/* ======================================================= */}
            {/* 3. EMAIL AUTOMATION HEALTH (MASTER SWITCH & STATUS BAR) */}
            {/* ======================================================= */}
            <div className="p-5 rounded-2xl bg-[#140b19] border border-[#C5A059]/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Master Switch */}
                <div className="space-y-1">
                  <div className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <Power className="w-4 h-4 text-[#D4AF37]" />
                    EMAIL AUTOMATION
                  </div>
                  <button
                    onClick={handleToggleAutomationSwitch}
                    disabled={isTogglingSwitch}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                      autoSendEnabled
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-red-950/80 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${autoSendEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {autoSendEnabled ? '● ACTIVE' : '● PAUSED'}
                  </button>
                </div>

                <div className="h-8 w-px bg-[#C5A059]/20 hidden sm:block" />

                {/* Next Automatic Email */}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">NEXT AUTOMATIC EMAIL</div>
                  <div className="text-xs font-mono font-bold text-[#F5E6B3]">
                    {nextEmail ? `${nextEmail.scheduleDate} · ${nextEmail.scheduleTime} IST` : 'No upcoming scheduled email'}
                  </div>
                </div>

                <div className="h-8 w-px bg-[#C5A059]/20 hidden sm:block" />

                {/* Pending Emails */}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">PENDING EMAILS</div>
                  <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{pendingEmailsCount}</span>
                    {pendingEmailsCount > 0 && (
                      <button
                        onClick={() => setIsSendAllPendingModalOpen(true)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 uppercase"
                      >
                        Review ({pendingEmailsCount})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleInitiateSend(emailItems[0] || DEFAULT_EMAIL_ITEMS[0], true)}
                  className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#C5A059]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  SEND TEST
                </button>
                <button
                  onClick={handleOpenAddEmail}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
                  ADD EMAIL
                </button>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 4. UPCOMING EMAILS (EXACTLY NEXT TWO ACTIONABLE EMAILS) */}
            {/* ======================================================= */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    UPCOMING EMAILS
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    The next two actionable scheduled dispatches in chronological order.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#D4AF37]">
                  {actionableUpcoming.length} Actionable in Queue
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* UPCOMING EMAIL #1 (NEXT EMAIL) */}
                {nextEmail ? (
                  <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#201026] via-[#140a18] to-[#0b060d] border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.25)] space-y-4 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black font-serif font-black text-[10px] uppercase tracking-widest shadow-md">
                      UPCOMING EMAIL #1 · NEXT EMAIL
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F5E6B3] border border-[#D4AF37]/40">
                          {nextEmail.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          UPCOMING
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email Name:</div>
                        <h3 className="text-base font-bold text-white font-serif tracking-wide">{nextEmail.name}</h3>
                        <p className="text-xs text-gray-300 italic mt-0.5">{nextEmail.subject}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/60 border border-[#C5A059]/20 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Scheduled:</span>
                          <span className="text-[#F5E6B3] font-mono font-bold">{nextEmail.scheduleDate}</span>
                          <span className="text-[#D4AF37] font-mono block text-[11px]">{nextEmail.scheduleTime} IST</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Recipient:</span>
                          <span className="text-[#F5E6B3] font-serif font-bold text-xs tracking-wider block drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]">
                            {formatGoldenName(getEffectiveEmailDisplayName(nextEmail))}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono truncate block">{nextEmail.recipient}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#C5A059]/30">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPreview(nextEmail)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#C5A059]/50 text-[#F5E6B3] hover:bg-[#D4AF37]/15 flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> VIEW
                        </button>
                        <button
                          onClick={() => handleOpenPreview(nextEmail)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/15 flex items-center gap-1.5 transition-all"
                        >
                          PREVIEW
                        </button>
                      </div>

                      <button
                        onClick={() => handleInitiateSend(nextEmail, false)}
                        className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F5E6B3] to-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2"
                      >
                        <Send className="w-4 h-4 text-black stroke-[2.5]" />
                        SEND
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#140b19] border border-[#C5A059]/20 text-center text-gray-400 flex flex-col items-center justify-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
                    <p className="text-sm font-semibold text-white">All Scheduled Emails Completed</p>
                    <p className="text-xs text-gray-500">No upcoming emails currently in queue.</p>
                  </div>
                )}

                {/* UPCOMING EMAIL #2 (AFTER THAT) */}
                {secondUpcomingEmail ? (
                  <div className="relative p-6 rounded-2xl bg-[#160d1b] border border-[#C5A059]/40 hover:border-[#D4AF37]/70 shadow-lg space-y-4 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl bg-black/80 border-b border-l border-[#C5A059]/30 text-[#C5A059] font-serif font-bold text-[10px] uppercase tracking-widest">
                      UPCOMING EMAIL #2 · AFTER THAT
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#C5A059] border border-[#D4AF37]/30">
                          {secondUpcomingEmail.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40">
                          UPCOMING
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email Name:</div>
                        <h3 className="text-base font-bold text-white font-serif tracking-wide">{secondUpcomingEmail.name}</h3>
                        <p className="text-xs text-gray-300 italic mt-0.5">{secondUpcomingEmail.subject}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/60 border border-[#C5A059]/20 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Scheduled:</span>
                          <span className="text-[#F5E6B3] font-mono font-bold">{secondUpcomingEmail.scheduleDate}</span>
                          <span className="text-[#D4AF37] font-mono block text-[11px]">{secondUpcomingEmail.scheduleTime} IST</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Recipient:</span>
                          <span className="text-[#F5E6B3] font-serif font-bold text-xs tracking-wider block drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]">
                            {formatGoldenName(getEffectiveEmailDisplayName(secondUpcomingEmail))}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono truncate block">{secondUpcomingEmail.recipient}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#C5A059]/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPreview(secondUpcomingEmail)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#C5A059]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> VIEW
                        </button>
                        <button
                          onClick={() => handleOpenPreview(secondUpcomingEmail)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/15 flex items-center gap-1.5 transition-all"
                        >
                          PREVIEW
                        </button>
                      </div>

                      <button
                        onClick={() => handleInitiateSend(secondUpcomingEmail, false)}
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-md flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                        SEND
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#140b19] border border-[#C5A059]/20 text-center text-gray-400 flex flex-col items-center justify-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-amber-400 opacity-60" />
                    <p className="text-sm font-semibold text-white">No Second Email Scheduled</p>
                    <p className="text-xs text-gray-500">Only one scheduled email remaining in queue.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================= */}
            {/* 5. REFERENCE MAILS (SEPARATE DEDICATED SECTION)         */}
            {/* ======================================================= */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#D4AF37]" />
                    REFERENCE MAILS
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Saved immutable Reference Snapshots captured for each email. Verification & preview audit.
                  </p>
                </div>
                <span className="text-[10px] text-[#C5A059] font-mono">
                  {snapshots.length} Snapshots Saved
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailItems.map((item) => {
                  const snap = getSnapshotForEmail(item.id);
                  const snapDisplayName = snap ? (snap.emailDisplayName || emailDisplayName) : getEffectiveEmailDisplayName(item);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[#140b19] border border-[#C5A059]/30 hover:border-[#D4AF37]/60 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] font-serif">
                            REFERENCE MAIL
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              snap
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {snap ? 'REFERENCE: ● SAVED' : 'REFERENCE: ● NOT SAVED'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white truncate font-serif">{item.name}</h4>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            <span className="text-gray-500">Associated Email:</span> {item.id}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-black/50 border border-[#C5A059]/15 text-[11px] text-gray-300 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Saved:</span>
                            <span className="font-mono text-[#F5E6B3]">
                              {snap ? new Date(snap.referenceCapturedTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No reference snapshot saved yet.'}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase">Recipient:</div>
                            <div className="text-xs text-[#F5E6B3] font-serif font-bold tracking-wider drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]">
                              {formatGoldenName(snapDisplayName)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#C5A059]/20">
                        {snap ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSnapshot(snap);
                                setIsSnapshotModalOpen(true);
                              }}
                              className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5E6B3] hover:bg-[#D4AF37]/30 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                              VIEW REFERENCE
                            </button>
                            <button
                              onClick={() => handleCaptureSnapshot(item)}
                              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#C5A059]/40 text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-1"
                              title="Replace Reference Snapshot"
                            >
                              <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
                              REPLACE
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCaptureSnapshot(item)}
                            className="w-full py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-500/50 text-amber-300 hover:bg-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            CREATE REFERENCE
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ======================================================= */}
            {/* 6. RECIPIENT MAILS (SEPARATE IDENTITY & DESTINATION)    */}
            {/* ======================================================= */}
            <div className="p-5 rounded-2xl bg-[#140b19] border border-[#C5A059]/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                <div className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-[#D4AF37]" />
                  RECIPIENT MAILS
                </div>
                <span className="text-[10px] text-gray-400">
                  Destination Mailbox vs. Email Display Name
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/60 border border-[#C5A059]/20 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">RECIPIENT EMAIL</span>
                  <span className="text-white font-mono break-all font-semibold block">
                    {smtpConfig.recipientEmail || 'lohithmedisetti1432004@gmail.com,lohithmedisetti0305@gmail.com'}
                  </span>
                  <p className="text-[10px] text-gray-500 pt-0.5">Where all automated emails are delivered</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-[#D4AF37]/30 space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">EMAIL DISPLAY NAME</span>
                  <span className="text-[#F5E6B3] font-serif font-bold tracking-wider text-sm block drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]">
                    {formatGoldenName(emailDisplayName)}
                  </span>
                  <p className="text-[10px] text-gray-500 pt-0.5">Visual golden identity rendered inside the email</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/60 border border-[#C5A059]/20 space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">STATUS</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE & CONFIGURED
                    </span>
                  </div>
                  <div className="text-[10px] text-[#C5A059] font-mono">
                    Test Destination: {smtpConfig.testRecipientEmail || 'lohithmedisetti1432004@gmail.com'}
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 7. ALL EMAILS (COMPLETE COLLECTION TABLE & ACTIONS)     */}
            {/* ======================================================= */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#140b19] border border-[#C5A059]/30">
                <div>
                  <h2 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    ALL EMAILS
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Complete scheduled and custom email collection with search, filtering, and per-email overrides.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search email name, subject..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-black/60 border border-[#C5A059]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] w-56"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-black/60 border border-[#C5A059]/30 text-[#F5E6B3] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Types ▼</option>
                    <option value="ADVANCE">Advance Emails</option>
                    <option value="BIRTHDAY">Birthday Emails</option>
                    <option value="BIRTH MOMENT">Birth Moment</option>
                    <option value="TITHI">Tithi Emails</option>
                    <option value="TEST">Test Emails</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>

              {/* Emails Table */}
              <div className="overflow-x-auto rounded-xl border border-[#C5A059]/30 bg-[#120917]/90 shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#C5A059]/20 bg-black/60 text-[#C5A059] font-serif uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">EMAIL NAME</th>
                      <th className="py-3 px-3">TYPE</th>
                      <th className="py-3 px-4">SUBJECT & DISPLAY NAME</th>
                      <th className="py-3 px-3">SCHEDULE (IST)</th>
                      <th className="py-3 px-3">CTA ALIAS</th>
                      <th className="py-3 px-3">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A059]/15">
                    {filteredEmailItems.map((item) => {
                      const itemDisplayName = getEffectiveEmailDisplayName(item);
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{item.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{item.id}</div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 text-[#F5E6B3] border border-[#D4AF37]/30">
                              {item.type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-gray-200 font-medium">{item.subject}</div>
                            <div className="text-[10px] text-[#D4AF37] font-serif pt-0.5">
                              {formatGoldenName(itemDisplayName)}
                              {item.useGlobalEmailDisplayName === false && (
                                <span className="ml-1.5 px-1 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[9px] border border-purple-500/40">
                                  CUSTOM OVERRIDE
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[#F5E6B3]">
                            <div>{item.scheduleDate}</div>
                            <div className="text-[10px] text-gray-400">{item.scheduleTime} IST</div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="text-[#D4AF37] font-semibold text-[11px]">
                              {item.linkAlias || item.buttonText}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'SENT'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : item.status === 'FAILED'
                                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                                  : item.status === 'PENDING'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : 'bg-[#D4AF37]/20 text-[#F5E6B3] border border-[#D4AF37]/40'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenPreview(item)}
                                className="p-1.5 rounded-lg border border-[#C5A059]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20"
                                title="View Email Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditEmail(item)}
                                className="p-1.5 rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/20"
                                title="Edit Email"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleInitiateSend(item, false)}
                                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black font-bold uppercase text-[10px] hover:brightness-110 flex items-center gap-1"
                                title="Send Email Now"
                              >
                                <Send className="w-3 h-3 text-black stroke-[2.5]" />
                                Send
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20"
                                title="Delete Email"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 8. AUTOMATION ACTIVITY / RECENT LOGS SUMMARY            */}
            {/* ======================================================= */}
            <div className="p-5 rounded-2xl bg-[#140b19] border border-[#C5A059]/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                <div className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-[#D4AF37]" />
                  AUTOMATION ACTIVITY & AUDIT LOGS
                </div>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-[10px] text-[#F5E6B3] hover:underline"
                >
                  View All Logs ({logs.length}) →
                </button>
              </div>

              <div className="space-y-2">
                {logs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-black/50 border border-[#C5A059]/15 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.status === 'SENT' ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                      />
                      <span className="font-semibold text-white">{log.subject}</span>
                      <span className="text-[10px] text-gray-500 font-mono">To: {log.recipient}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {log.sent_at || log.attempted_at || log.created_at || 'Recently'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TITHI DATES MANAGEMENT                             */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#140b19] border border-[#C5A059]/30">
              <div>
                <h2 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-widest">
                  TITHI DATE CALENDAR
                </h2>
                <p className="text-[11px] text-gray-400">
                  Birth Tithi: {BIRTH_DETAILS.tithi} ({BIRTH_DETAILS.rashi})
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCalendarId(null);
                  setFormYear(2027);
                  setFormDate('');
                  setFormTithi('Ashwayuja Shukla Tritiya');
                  setFormStatus('published');
                  setFormNotes('');
                  setIsCalendarModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Tithi Year
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#C5A059]/30 bg-[#120917]/90 shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#C5A059]/20 bg-black/60 text-[#C5A059] font-serif uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">YEAR</th>
                    <th className="py-3 px-4">TITHI DATE</th>
                    <th className="py-3 px-4">TITHI NAME</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-4">NOTES</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/15">
                  {calendarRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-bold font-mono text-[#F5E6B3]">{rec.year}</td>
                      <td className="py-3 px-4 text-white font-semibold">{rec.date}</td>
                      <td className="py-3 px-4 text-gray-300">{rec.tithi_name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">{rec.notes || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingCalendarId(rec.id);
                            setFormYear(rec.year);
                            setFormDate(rec.date);
                            setFormTithi(rec.tithi_name);
                            setFormStatus(rec.status as any);
                            setFormNotes(rec.notes || '');
                            setIsCalendarModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SYSTEM LOGS                                        */}
        {/* ========================================================= */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#140b19] border border-[#C5A059]/30 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-widest">
                SYSTEM EMAIL LOGS ({logs.length})
              </h2>
              <button
                onClick={loadAllData}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#C5A059]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#C5A059]/30 bg-[#120917]/90 shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#C5A059]/20 bg-black/60 text-[#C5A059] font-serif uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">SUBJECT</th>
                    <th className="py-3 px-4">RECIPIENT</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-4">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/15 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-gray-400">
                        {log.sent_at || log.attempted_at || log.created_at || 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-white font-sans font-semibold">{log.subject}</td>
                      <td className="py-3 px-4 text-[#F5E6B3]">{log.recipient}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'SENT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-950 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[10px] truncate max-w-xs font-sans">
                        {log.error_message || `ID: ${log.provider_message_id || 'OK'}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SETTINGS & PASSWORD                                */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP & Global Settings */}
            <div className="p-6 rounded-2xl bg-[#140b19] border border-[#C5A059]/30 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                SMTP & Global Settings
              </h3>

              <form onSubmit={handleSaveSmtpConfig} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Website Name</label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Email Display Name</label>
                  <input
                    type="text"
                    value={emailDisplayName}
                    onChange={(e) => setEmailDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#D4AF37]/50 text-[#F5E6B3] font-serif font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Recipient Email (Delivery Address)</label>
                  <input
                    type="text"
                    value={smtpConfig.recipientEmail}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, recipientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Test Recipient Email</label>
                  <input
                    type="text"
                    value={smtpConfig.testRecipientEmail}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, testRecipientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpConfig.smtpHost}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">SMTP User / Sender</label>
                  <input
                    type="text"
                    value={smtpConfig.smtpUser}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpUser: e.target.value, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">SMTP App Password</label>
                  <input
                    type="password"
                    value={smtpConfig.smtpPass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtpPass: e.target.value })}
                    placeholder="Enter Gmail App Password..."
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-md mt-2"
                >
                  {isSavingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </form>
            </div>

            {/* Change Admin Password */}
            <div className="p-6 rounded-2xl bg-[#140b19] border border-[#C5A059]/30 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-[#D4AF37]" />
                Change Admin Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white"
                  />
                </div>

                {passwordChangeStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      passwordChangeStatus.success
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-950 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {passwordChangeStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-md mt-2"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Admin Password'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL 1: CREATE / EDIT EMAIL MODAL                        */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0e0714] border border-[#D4AF37]/50 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.25)] text-[#FAF8F5] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A059]/20 bg-[#160c1d]">
              <div>
                <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider">
                  {isEditingEmail ? 'Edit Email Template' : 'Add New Scheduled Email'}
                </h3>
                <p className="text-[11px] text-[#C5A059]">
                  Configure luxury content, timing, recipient, and per-email overrides.
                </p>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Optional Per-Email Display Name Override */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1b0c1e] to-[#0d0712] border border-[#D4AF37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-serif font-bold text-[#F5E6B3] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      USE GLOBAL EMAIL DISPLAY NAME
                    </span>
                    <p className="text-[10px] text-gray-400">
                      Global: <strong className="text-[#D4AF37]">{formatGoldenName(emailDisplayName)}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEmailForm({
                        ...emailForm,
                        useGlobalEmailDisplayName: !emailForm.useGlobalEmailDisplayName,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                      emailForm.useGlobalEmailDisplayName !== false
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                        : 'bg-purple-950/90 text-purple-300 border-purple-500/50'
                    }`}
                  >
                    {emailForm.useGlobalEmailDisplayName !== false ? '● ON (GLOBAL)' : '● OFF (CUSTOM)'}
                  </button>
                </div>

                {emailForm.useGlobalEmailDisplayName === false && (
                  <div className="pt-2 border-t border-[#D4AF37]/20 space-y-1">
                    <label className="block text-gray-300 font-semibold">CUSTOM EMAIL DISPLAY NAME</label>
                    <input
                      type="text"
                      value={emailForm.customDisplayName || ''}
                      onChange={(e) => setEmailForm({ ...emailForm, customDisplayName: e.target.value })}
                      placeholder="e.g. SIRI NANNA"
                      className="w-full px-3 py-2 rounded bg-black/70 border border-[#D4AF37] text-[#F5E6B3] font-serif font-bold tracking-wider uppercase focus:outline-none"
                    />
                    <div className="text-[10px] text-gray-400">
                      Preview: <strong className="text-[#F5E6B3]">{formatGoldenName(emailForm.customDisplayName || 'SIRI')}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Internal Email Name</label>
                  <input
                    type="text"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Email Type</label>
                  <select
                    value={emailForm.type}
                    onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-[#F5E6B3] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ADVANCE">ADVANCE (Countdown Progression)</option>
                    <option value="BIRTHDAY">BIRTHDAY (Midnight Cosmic)</option>
                    <option value="BIRTH MOMENT">BIRTH MOMENT (08:00 AM Genesis)</option>
                    <option value="TITHI">TITHI (Traditional Blessing)</option>
                    <option value="TEST">TEST</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Subject Line</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Destination Recipient Email</label>
                  <input
                    type="text"
                    value={emailForm.recipient}
                    onChange={(e) => setEmailForm({ ...emailForm, recipient: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Main Heading (Uppercase)</label>
                  <input
                    type="text"
                    value={emailForm.heading}
                    onChange={(e) => setEmailForm({ ...emailForm, heading: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Top Subtitle / Badge</label>
                  <input
                    type="text"
                    value={emailForm.topLabel || ''}
                    onChange={(e) => setEmailForm({ ...emailForm, topLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Message Body</label>
                <textarea
                  rows={6}
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full p-3 rounded bg-black/60 border border-[#C5A059]/30 text-white font-sans text-xs focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Write the heartfelt email text here..."
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {['{NAME}', '{AGE}', '{YEAR}', '{DATE}', '{TITHI_NAME}', '{LINK}'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEmailForm({ ...emailForm, message: `${emailForm.message} ${tag}` })}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/30"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL & Alias Settings */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/30 space-y-3">
                <div className="text-[11px] font-bold text-[#F5E6B3] uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Link & CTA Alias Configuration (Raw URL is Hidden)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Website Destination URL</label>
                    <input
                      type="text"
                      value={emailForm.websiteUrl}
                      onChange={(e) => setEmailForm({ ...emailForm, websiteUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Link Display Text / Alias</label>
                    <input
                      type="text"
                      value={emailForm.linkAlias || ''}
                      onChange={(e) => setEmailForm({ ...emailForm, linkAlias: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="ENTER YOUR STORY →"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={emailForm.buttonText}
                      onChange={(e) => setEmailForm({ ...emailForm, buttonText: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="ENTER YOUR STORY →"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Schedule Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={emailForm.scheduleDate}
                    onChange={(e) => setEmailForm({ ...emailForm, scheduleDate: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Schedule Time (IST 24h)</label>
                  <input
                    type="time"
                    value={emailForm.scheduleTime}
                    onChange={(e) => setEmailForm({ ...emailForm, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">Status</label>
                  <select
                    value={emailForm.status}
                    onChange={(e) => setEmailForm({ ...emailForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="READY">READY</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#C5A059]/20 bg-[#160c1d]">
              <button
                type="button"
                onClick={() => handleSaveEmailForm(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Save Draft
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C5A059]/30 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEmailForm(false)}
                  className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  Save & Schedule
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PRE-SEND PREVIEW CONFIRMATION (READY TO SEND?)   */}
      {/* ========================================================= */}
      {isPreSendModalOpen && preSendItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#0b080f] border border-[#D4AF37] rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.35)] text-[#FAF8F5] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#1c0d1e] via-[#0b080f] to-[#1c0d1e]">
              <div>
                <h3 className="text-lg font-bold text-[#F5E6B3] font-serif uppercase tracking-widest flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#D4AF37]" />
                  READY TO SEND? — Pre-Send Verification
                </h3>
                <p className="text-xs text-[#C5A059]">
                  Review the live rendered luxury email before confirming dispatch.
                </p>
              </div>
              <button onClick={() => setIsPreSendModalOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[#140a17] border-b border-[#C5A059]/20 text-xs">
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">RECIPIENT NAME</span>
                <span className="text-[#D4AF37] font-bold block text-sm font-serif">{formatGoldenName(getEffectiveEmailDisplayName(preSendItem))}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">EMAIL ADDRESS</span>
                <span className="text-white font-mono text-[11px] break-all block">{preSendCustomRecipient}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">SUBJECT LINE</span>
                <span className="text-white truncate block">{preSendItem.subject}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase text-[10px]">CTA BUTTON ALIAS</span>
                <span className="text-[#D4AF37] font-bold">{preSendItem.linkAlias || preSendItem.buttonText}</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-[#060408] p-2 min-h-[400px]">
              <iframe
                title="Pre-Send Email Preview"
                src={`${BACKEND_URL}/api/email/preview/${preSendItem.id}`}
                className="w-full h-full border border-[#C5A059]/20 rounded-lg min-h-[400px]"
              />
            </div>

            {sendResultMsg && (
              <div
                className={`px-6 py-2 text-xs flex items-center gap-2 ${
                  sendingState === 'success'
                    ? 'bg-emerald-950/90 text-emerald-300 border-t border-emerald-500/40'
                    : 'bg-red-950/90 text-red-300 border-t border-red-500/40'
                }`}
              >
                {sendingState === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {sendResultMsg}
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#D4AF37]/30 bg-[#160c1d]">
              <button
                type="button"
                onClick={() => {
                  setIsPreSendModalOpen(false);
                  handleOpenEditEmail(preSendItem);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/10 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Email First
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreSendModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#C5A059]/30 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingState === 'sending'}
                  onClick={handleConfirmAndSend}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F5E6B3] to-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-black stroke-[2.5]" />
                  {sendingState === 'sending' ? 'Sending...' : 'Confirm & Send Now'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: STANDALONE LIVE PREVIEW MODAL                    */}
      {/* ========================================================= */}
      {isPreviewModalOpen && previewEmailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#0b080f] border border-[#C5A059]/40 rounded-2xl shadow-2xl text-[#FAF8F5] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5A059]/20 bg-[#160c1d]">
              <div>
                <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider">
                  Live Email Preview: {previewEmailItem.name}
                </h3>
                <p className="text-[11px] text-[#C5A059]">
                  Recipient: <span className="font-bold">{formatGoldenName(getEffectiveEmailDisplayName(previewEmailItem))}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded border ${previewDevice === 'desktop' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'border-gray-700 text-gray-400'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded border ${previewDevice === 'mobile' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'border-gray-700 text-gray-400'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button onClick={() => setIsPreviewModalOpen(false)} className="text-gray-400 hover:text-white text-lg ml-2">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#060408] p-4 flex justify-center items-center">
              <div className={`transition-all duration-300 h-full w-full ${previewDevice === 'mobile' ? 'max-w-[390px] border-2 border-gray-700 rounded-3xl overflow-hidden p-1 bg-black' : 'max-w-3xl'}`}>
                <iframe
                  title="Live Email Preview Frame"
                  src={`${BACKEND_URL}/api/email/preview/${previewEmailItem.id}`}
                  className="w-full h-full min-h-[500px] border-0 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-[#C5A059]/20 bg-[#160c1d] text-xs">
              <span className="text-gray-400">
                Subject: <strong className="text-white">{previewEmailItem.subject}</strong>
              </span>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-black hover:brightness-110"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REFERENCE SNAPSHOT VIEWER                        */}
      {/* ========================================================= */}
      {isSnapshotModalOpen && selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#0b080f] border border-[#D4AF37] rounded-2xl shadow-2xl text-[#FAF8F5] overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#1c0d1e] via-[#0b080f] to-[#1c0d1e]">
              <div>
                <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  Immutable Reference Snapshot Viewer
                </h3>
                <p className="text-[11px] text-[#C5A059]">
                  Captured at: {new Date(selectedSnapshot.referenceCapturedTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              <button onClick={() => setIsSnapshotModalOpen(false)} className="text-gray-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#140a17] border-b border-[#C5A059]/20 text-[11px]">
              <div><span className="text-gray-400 block">Name:</span> <span className="text-white font-semibold">{selectedSnapshot.name}</span></div>
              <div><span className="text-gray-400 block">Saved Display Name:</span> <span className="text-[#D4AF37] font-serif font-bold">{selectedSnapshot.emailDisplayName || emailDisplayName}</span></div>
              <div><span className="text-gray-400 block">Scheduled Send:</span> <span className="text-[#F5E6B3] font-mono">{selectedSnapshot.scheduledSendTime}</span></div>
              <div><span className="text-gray-400 block">Snapshot Status:</span> <span className="text-emerald-300 font-bold">{selectedSnapshot.snapshotStatus}</span></div>
            </div>

            <div className="flex-1 overflow-hidden bg-[#060408] p-2 min-h-[450px]">
              <iframe
                title="Snapshot HTML Viewer"
                srcDoc={selectedSnapshot.renderedHtml}
                className="w-full h-full border border-[#C5A059]/20 rounded-lg min-h-[450px]"
              />
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-[#D4AF37]/30 bg-[#160c1d]">
              <span className="text-xs text-gray-400">
                Saved Recipient: <strong className="text-[#D4AF37]">{formatGoldenName(selectedSnapshot.emailDisplayName || emailDisplayName)}</strong>
              </span>
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#D4AF37] text-black hover:brightness-110"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: BATCH DISPATCH PENDING EMAILS                    */}
      {/* ========================================================= */}
      {isSendAllPendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#140b19] border border-amber-500/40 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-amber-500/40 mx-auto flex items-center justify-center bg-amber-950/40 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif uppercase">Dispatch Pending Missed Emails?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Found {pendingEmailsCount} scheduled emails queued while automation was off. Dispatch now?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsSendAllPendingModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                disabled={isSendingAllPending}
                onClick={handleSendAllPending}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38F2D] text-black hover:brightness-110 shadow-lg"
              >
                {isSendingAllPending ? 'Dispatching...' : `Dispatch All (${pendingEmailsCount}) Now`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: DELETE CONFIRMATION                              */}
      {/* ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#140b19] border border-red-500/40 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full border border-red-500/40 mx-auto flex items-center justify-center bg-red-950/40 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif uppercase">Delete Email Permanently?</h3>
              <p className="text-xs text-gray-400 mt-1">
                This email record will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmailConfirm}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                Delete Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: CALENDAR RECORD MODAL                            */}
      {/* ========================================================= */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#140b19] border border-[#C5A059]/40 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
              <h3 className="text-sm font-bold text-[#F5E6B3] font-serif uppercase tracking-wider">
                {editingCalendarId ? 'Edit Tithi Year' : 'Add Tithi Year'}
              </h3>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCalendarRecord} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Year</label>
                <input
                  type="number"
                  required
                  value={formYear}
                  onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Date (e.g. 14 October)</label>
                <input
                  type="text"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Tithi Name</label>
                <input
                  type="text"
                  value={formTithi}
                  onChange={(e) => setFormTithi(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/60 border border-[#C5A059]/30 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="px-4 py-2 text-xs rounded border border-gray-600 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase rounded bg-[#D4AF37] text-black hover:brightness-110"
                >
                  Save Tithi Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
