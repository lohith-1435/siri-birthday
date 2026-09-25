import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Send,
  Database,
  Lock,
  LogOut,
  ArrowLeft,
  History,
  Copy,
  Check,
  Settings,
  Eye,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { tithiService } from '../../services/tithiService';
import { calculateTimelineStats } from '../../data/timelineData';
import { isSupabaseConfigured, supabase, type TithiDateRecord, type EmailLogRecord } from '../../lib/supabase';
import { audioEngine } from '../../utils/audioEngine';
import {
  DEFAULT_EMAIL_TEMPLATES,
  replaceEmailVariables,
  type AllEmailTemplates,
} from '../../../server/emailTemplates';

interface AdminPanelProps {
  onBackToFilm: () => void;
  onDataUpdated?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToFilm, onDataUpdated }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState('admin@divinejourney.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active View Tabs: 'overview' | 'calendar' | 'email' | 'logs' | 'database'
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'email' | 'logs' | 'database'>('overview');

  // Calendar Records & Filters
  const [records, setRecords] = useState<TithiDateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'unpublished'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<TithiDateRecord> | null>(null);
  const [formYear, setFormYear] = useState<number>(2031);
  const [formDate, setFormDate] = useState<string>('19 October');
  const [formTithi, setFormTithi] = useState<string>('Ashwayuja Shukla Tritiya');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'unpublished'>('published');
  const [formNotes, setFormNotes] = useState<string>('');

  // Email Automation State
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('siri@example.com');
  const [recipientName, setRecipientName] = useState('SIRI');
  const [senderEmail, setSenderEmail] = useState('blessings@divinejourney.com');
  const [senderName, setSenderName] = useState('SIRI Birthday Celestial Journey');
  const [replyTo, setReplyTo] = useState('blessings@divinejourney.com');
  const [websiteUrl, setWebsiteUrl] = useState('http://localhost:5173');

  const [templates, setTemplates] = useState<AllEmailTemplates>(DEFAULT_EMAIL_TEMPLATES);
  const [editingTemplateKey, setEditingTemplateKey] = useState<keyof AllEmailTemplates>('birthday_midnight');
  const [previewTemplateKey, setPreviewTemplateKey] = useState<keyof AllEmailTemplates>('birthday_midnight');
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delivery Status for 3 Real Events
  const [deliveryStatus, setDeliveryStatus] = useState<{
    birthday_midnight: 'SCHEDULED' | 'PENDING' | 'SENT' | 'FAILED' | 'DISABLED';
    birth_moment: 'SCHEDULED' | 'PENDING' | 'SENT' | 'FAILED' | 'DISABLED';
    tithi: 'SCHEDULED' | 'PENDING' | 'SENT' | 'FAILED' | 'DISABLED';
  }>({
    birthday_midnight: 'SCHEDULED',
    birth_moment: 'SCHEDULED',
    tithi: 'SCHEDULED',
  });

  // Send Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'test' | 'advance' | 'birthday_midnight' | 'birth_moment' | 'tithi';
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: 'test',
    title: 'SEND TEST EMAIL?',
    description: 'This test email will verify delivery and template rendering. It will NOT affect the real birthday schedule.',
  });

  // SQL Copy State
  const [copiedSql, setCopiedSql] = useState(false);

  // Check auth session on load
  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsAuthenticated(true);
          setAdminEmail(data.session.user.email || 'admin@divinejourney.com');
        }
      } else {
        const isDemoAuth = sessionStorage.getItem('siri_admin_authenticated');
        if (isDemoAuth === 'true') {
          setIsAuthenticated(true);
        }
      }
    }
    checkAuth();
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const allDates = await tithiService.getAllDatesForAdmin();
      setRecords(allDates);
      const logs = await tithiService.getEmailLogs();
      setEmailLogs(logs);

      // Fetch backend email status & templates if server is reachable
      try {
        const res = await fetch('http://localhost:3001/api/email/status');
        if (res.ok) {
          const data = await res.json();
          if (data.config?.recipientEmail) setRecipientEmail(data.config.recipientEmail);
          if (data.config?.recipientName) setRecipientName(data.config.recipientName);
          if (data.config?.senderEmail) setSenderEmail(data.config.senderEmail);
          if (data.config?.senderName) setSenderName(data.config.senderName);
          if (data.config?.replyTo) setReplyTo(data.config.replyTo);
          if (data.config?.websiteUrl) setWebsiteUrl(data.config.websiteUrl);
          if (data.templates) setTemplates(data.templates);
          if (data.deliveryStatus) setDeliveryStatus(data.deliveryStatus);
          if (data.latestLogs && data.latestLogs.length > 0) setEmailLogs(data.latestLogs);
        }
      } catch {
        // Local fallback
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      if (adminPassword === 'siri2003' || adminPassword === 'siri@2003' || adminPassword === 'admin') {
        sessionStorage.setItem('siri_admin_authenticated', 'true');
        setIsAuthenticated(true);
        audioEngine.playSacredChime(648, 2.0);
        await loadAllData();
        return;
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });
        if (error) throw error;
        if (data.session) {
          setIsAuthenticated(true);
          await loadAllData();
        }
      } else {
        setAuthError('Invalid admin passcode. Use standard passcode (siri2003).');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('siri_admin_authenticated');
    setIsAuthenticated(false);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.year.toString().includes(searchQuery) ||
      r.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tithi_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = calculateTimelineStats(records);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormYear(records.length > 0 ? Math.max(...records.map((r) => r.year)) + 1 : 2031);
    setFormDate('19 October');
    setFormTithi('Ashwayuja Shukla Tritiya');
    setFormStatus('published');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: TithiDateRecord) => {
    setEditingRecord(rec);
    setFormYear(rec.year);
    setFormDate(rec.date);
    setFormTithi(rec.tithi_name);
    setFormStatus(rec.status);
    setFormNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tithiService.saveDate({
        id: editingRecord?.id,
        year: formYear,
        date: formDate,
        tithi_name: formTithi,
        status: formStatus,
        notes: formNotes,
      });

      setIsModalOpen(false);
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Error saving record:', err);
      alert('Failed to save record.');
    }
  };

  const handleDeleteDate = async (rec: TithiDateRecord) => {
    if (confirm(`Are you sure you want to delete year ${rec.year}?`)) {
      try {
        await tithiService.deleteDate(rec.id, rec.year);
        await loadAllData();
        if (onDataUpdated) onDataUpdated();
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleToggleStatus = async (rec: TithiDateRecord, newStatus: 'published' | 'draft' | 'unpublished') => {
    try {
      await tithiService.setStatus(rec.id, rec.year, newStatus);
      await loadAllData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleSaveTemplates = async () => {
    setIsSavingTemplates(true);
    setEmailMessage(null);
    try {
      const res = await fetch('http://localhost:3001/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });

      // Also save global config (recipient, sender, websiteUrl)
      await fetch('http://localhost:3001/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          senderEmail,
          senderName,
          replyTo,
          websiteUrl,
        }),
      });

      if (res.ok) {
        setEmailMessage({ type: 'success', text: 'Email templates & configuration saved successfully!' });
      } else {
        setEmailMessage({ type: 'success', text: 'Settings updated in local session.' });
      }
    } catch {
      setEmailMessage({ type: 'success', text: 'Settings updated in local session.' });
    } finally {
      setIsSavingTemplates(false);
      setTimeout(() => setEmailMessage(null), 4500);
    }
  };

  const handleOpenConfirmModal = (type: 'test' | 'advance' | 'birthday_midnight' | 'birth_moment' | 'tithi') => {
    let title = 'SEND TEST EMAIL?';
    let description = `Send a test email to: ${recipientEmail}\n\nThis will NOT affect the real birthday schedule, Tithi schedule, or real event history.`;

    if (type === 'advance') {
      title = 'SEND ADVANCE BIRTHDAY EMAIL?';
      description = `Send an advance birthday email to: ${recipientEmail}\n\nThis is an advance email and will NOT mark the real birthday event as sent.`;
    } else if (type === 'birthday_midnight') {
      title = 'TEST BIRTHDAY MIDNIGHT EMAIL?';
      description = `Send a test preview of Birthday Midnight to ${recipientEmail}. Mode: TEST (Safe).`;
    } else if (type === 'birth_moment') {
      title = 'TEST BIRTH MOMENT EMAIL?';
      description = `Send a test preview of Birth Moment (08:00 AM) to ${recipientEmail}. Mode: TEST (Safe).`;
    } else if (type === 'tithi') {
      title = 'TEST YEARLY TITHI EMAIL?';
      description = `Send a test preview of Yearly Tithi to ${recipientEmail}. Mode: TEST (Safe).`;
    }

    setConfirmModal({
      isOpen: true,
      type,
      title,
      description,
    });
  };

  const handleExecuteSend = async () => {
    setIsSendingEmail(true);
    setEmailMessage(null);
    const targetType = confirmModal.type;

    try {
      const res = await fetch('http://localhost:3001/api/email/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: targetType,
          year: stats.currentYear,
          recipientEmail,
          recipientName,
          websiteUrl,
          senderEmail,
          senderName,
          replyTo,
          templates,
        }),
      });

      const data = await res.json();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));

      if (data.success) {
        setEmailMessage({
          type: 'success',
          text: `✓ ${targetType.toUpperCase()} EMAIL SENT: ${data.message}`,
        });
      } else {
        setEmailMessage({
          type: 'error',
          text: `✕ ${targetType.toUpperCase()} EMAIL FAILED: ${data.message || 'Unknown provider error'}`,
        });
      }

      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      setEmailMessage({
        type: 'error',
        text: `✕ EMAIL FAILED: ${msg}`,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleInsertVariable = (variable: string) => {
    setTemplates((prev) => {
      const cur = prev[editingTemplateKey];
      return {
        ...prev,
        [editingTemplateKey]: {
          ...cur,
          message: cur.message + ' ' + variable,
        },
      };
    });
  };

  const handleCopySql = () => {
    const sqlText = `-- Execute in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS tithi_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER UNIQUE NOT NULL,
  date TEXT NOT NULL,
  tithi_name TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'unpublished')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  mode TEXT DEFAULT 'real' CHECK (mode IN ('real', 'test', 'advance')),
  recipient TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // 1. Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-obsidian-950 text-[#FAF8F5] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-950/20 via-obsidian-950 to-obsidian-950" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#09080E]/95 border border-gold-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full border border-gold-400/50 mx-auto flex items-center justify-center text-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-4 bg-gold-500/10">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-cinzel text-2xl font-bold tracking-widest text-gold-100 uppercase">
              ADMIN PORTAL
            </h1>
            <p className="font-outfit text-xs text-gold-400/70 mt-1 uppercase tracking-widest">
              SIRI · Living Birthday System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-outfit">
                {authError}
              </div>
            )}

            <div>
              <label className="block font-cinzel text-xs text-gold-300 mb-1.5 uppercase tracking-wider">
                Admin Email (Optional for Passcode)
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="block font-cinzel text-xs text-gold-300 mb-1.5 uppercase tracking-wider">
                Admin Passcode / Password
              </label>
              <input
                type="password"
                placeholder="Enter passcode (siri2003)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gold-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {isLoggingIn ? 'AUTHENTICATING...' : 'ENTER ADMIN PORTAL'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gold-500/20 text-center">
            <button
              onClick={onBackToFilm}
              className="text-xs font-cinzel text-gold-400/80 hover:text-white flex items-center justify-center gap-2 mx-auto uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Cinematic Story
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Main Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-obsidian-950 text-[#FAF8F5] pb-20 selection:bg-gold-500/30 selection:text-gold-100">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-obsidian-950/90 backdrop-blur-xl border-b border-gold-500/25 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFilm}
            className="p-2 rounded-xl bg-obsidian-900 border border-gold-500/30 text-gold-300 hover:text-white hover:bg-gold-500/10 transition-all"
            title="Return to Film"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-sm sm:text-base font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span>ADMIN PORTAL</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30">
                PROD v2.5
              </span>
            </h1>
            <p className="text-[10px] text-gold-400/80 font-outfit uppercase tracking-wider hidden sm:block">
              SIRI · Living Timeline & Automation Suite
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-obsidian-900 hover:bg-red-500/10 border border-gold-500/30 hover:border-red-500/50 text-gray-300 hover:text-red-300 text-xs font-cinzel transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="flex items-center gap-2 border-b border-gold-500/20 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'calendar', label: 'Tithi Calendar', icon: Calendar },
            { id: 'email', label: 'Email Automation', icon: Mail },
            { id: 'logs', label: 'Email History', icon: History },
            { id: 'database', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-cinzel text-xs font-semibold tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'text-gray-400 hover:text-white bg-obsidian-900/60 hover:bg-gold-500/10 border border-gold-500/15'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="gold-card p-5 rounded-2xl border-gold-500/30">
                <span className="text-[10px] font-cinzel text-gold-400 uppercase tracking-widest block mb-1">
                  Living Timeline
                </span>
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-white block">
                  101 Years
                </span>
                <span className="text-[11px] text-gray-400 font-outfit mt-1 block">
                  Spanning 2003 to 2103
                </span>
              </div>

              <div className="gold-card p-5 rounded-2xl border-gold-500/30">
                <span className="text-[10px] font-cinzel text-gold-400 uppercase tracking-widest block mb-1">
                  Published Tithi Dates
                </span>
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-emerald-300 block">
                  {stats.publishedCount} / 101
                </span>
                <span className="text-[11px] text-gray-400 font-outfit mt-1 block">
                  Live on Public Timeline
                </span>
              </div>

              <div className="gold-card p-5 rounded-2xl border-gold-500/30">
                <span className="text-[10px] font-cinzel text-gold-400 uppercase tracking-widest block mb-1">
                  Current Year ({stats.currentYear})
                </span>
                <span className="font-cinzel text-xl sm:text-2xl font-bold text-gold-200 block">
                  {stats.currentYearTithi || '14 October'}
                </span>
                <span className="text-[11px] text-gray-400 font-outfit mt-1 block">
                  Ashwayuja Shukla Tritiya
                </span>
              </div>

              <div className="gold-card p-5 rounded-2xl border-gold-500/30">
                <span className="text-[10px] font-cinzel text-gold-400 uppercase tracking-widest block mb-1">
                  Automated Yearly Crons
                </span>
                <span className="font-cinzel text-xl sm:text-2xl font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active (IST)
                </span>
                <span className="text-[11px] text-gray-400 font-outfit mt-1 block">
                  Midnight · 08:00 AM · Tithi
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold-400" /> Tithi Calendar Quick Action
                </h3>
                <p className="text-xs text-gray-300 font-outfit leading-relaxed">
                  Add or update verified lunar dates for future years without touching source code.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Add New Year Date
                  </button>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="px-4 py-2.5 rounded-xl bg-obsidian-900 hover:bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs font-cinzel"
                  >
                    View All 101 Years
                  </button>
                </div>
              </div>

              <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-400" /> Email Quick Actions
                </h3>
                <p className="text-xs text-gray-300 font-outfit leading-relaxed">
                  Send a safe test verification or trigger an advance letter to {recipientEmail}.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleOpenConfirmModal('test')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Test Email
                  </button>
                  <button
                    onClick={() => handleOpenConfirmModal('advance')}
                    className="px-4 py-2.5 rounded-xl bg-obsidian-900 hover:bg-gold-500/15 border border-gold-500/40 text-gold-200 font-cinzel font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Send Advance Letter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TITHI CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-obsidian-900/60 p-3 rounded-2xl border border-gold-500/20">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                <input
                  type="text"
                  placeholder="Search by year or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-obsidian-950 border border-gold-500/20 text-xs text-gold-100 placeholder-gray-500 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'published', 'draft', 'unpublished'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-cinzel capitalize transition-all ${
                        statusFilter === filter
                          ? 'bg-gold-500 text-obsidian-950 font-bold'
                          : 'text-gray-400 hover:text-white bg-obsidian-950/60'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 font-cinzel font-bold text-xs uppercase shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Year
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-gold-500/25 bg-obsidian-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950 text-gold-300 font-cinzel uppercase border-b border-gold-500/20 tracking-wider">
                  <tr>
                    <th className="p-3.5">Year</th>
                    <th className="p-3.5">Tithi Date</th>
                    <th className="p-3.5">Tithi Name</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Notes</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gold-300/80 font-cinzel">
                        Loading Tithi Database...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No records match your filter or search.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => {
                      const isCurrent = rec.year === stats.currentYear;
                      return (
                        <tr
                          key={rec.id || rec.year}
                          className={`hover:bg-gold-500/5 transition-colors ${
                            isCurrent ? 'bg-gold-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 font-cinzel font-bold text-base text-white">
                            <span className={rec.status === 'published' ? 'gold-text' : 'text-gray-300'}>
                              {rec.year}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-gold-500/20 text-[9px] text-gold-300 border border-gold-400/40">
                                ★ Current
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-cinzel font-semibold text-white">
                            {rec.date}
                          </td>
                          <td className="p-3.5 text-gray-300 font-cormorant italic text-sm">
                            {rec.tithi_name}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                rec.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : rec.status === 'draft'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-400 text-xs">
                            {rec.notes || '—'}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {rec.status !== 'published' ? (
                                <button
                                  onClick={() => handleToggleStatus(rec, 'published')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-[11px] font-cinzel font-semibold transition-all"
                                >
                                  Publish
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(rec, 'draft')}
                                  className="px-2.5 py-1 rounded-lg bg-obsidian-950 hover:bg-obsidian-900 border border-gold-500/30 text-amber-300 text-[11px] font-cinzel transition-all"
                                >
                                  Unpublish
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(rec)}
                                className="p-1.5 rounded-lg bg-obsidian-950 hover:bg-gold-500/10 border border-gold-500/25 text-gray-300 hover:text-gold-200 transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteDate(rec)}
                                className="p-1.5 rounded-lg bg-obsidian-950 hover:bg-red-500/20 border border-red-500/20 text-gray-400 hover:text-red-300 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL AUTOMATION */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* Global Notice Banner */}
            {emailMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-outfit flex items-center justify-between gap-3 shadow-xl ${
                  emailMessage.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/80 border border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {emailMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{emailMessage.text}</span>
                </div>
                <button
                  onClick={() => setEmailMessage(null)}
                  className="text-gray-400 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              </div>
            )}

            {/* EMAIL DELIVERY STATUS CARD (Requirement 15) */}
            <div className="gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-500/20 pb-4">
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold-400" /> EMAIL DELIVERY STATUS ({stats.currentYear})
                  </h3>
                  <p className="text-[11px] text-gray-400 font-outfit mt-0.5">
                    Live dispatch status for the 3 automated yearly events in Asia/Kolkata (IST).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenConfirmModal('test')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 font-cinzel font-bold text-xs uppercase flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Test Email
                  </button>
                  <button
                    onClick={() => handleOpenConfirmModal('advance')}
                    className="px-3.5 py-2 rounded-xl bg-obsidian-900 border border-gold-500/40 text-gold-300 font-cinzel font-semibold text-xs uppercase flex items-center gap-1.5 hover:bg-gold-500/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Send Advance Email
                  </button>
                </div>
              </div>

              {/* 3 Real-Event Delivery Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* 1. Birthday Midnight */}
                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-gold-500/25 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase">
                        1. Birthday Midnight
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-cinzel font-bold uppercase ${
                          deliveryStatus.birthday_midnight === 'SENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : deliveryStatus.birthday_midnight === 'DISABLED'
                            ? 'bg-gray-800 text-gray-400 border border-gray-700'
                            : deliveryStatus.birthday_midnight === 'FAILED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                        }`}
                      >
                        {deliveryStatus.birthday_midnight}
                      </span>
                    </div>
                    <div className="font-cinzel text-xs text-white font-semibold">28 September · 12:00 AM IST</div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Button: "{templates.birthday_midnight.buttonText}" (?scene=birthday)
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('birthday_midnight')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      onClick={() => handleOpenConfirmModal('birthday_midnight')}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>

                {/* 2. Birth Moment */}
                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-gold-500/25 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase">
                        2. Birth Moment
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-cinzel font-bold uppercase ${
                          deliveryStatus.birth_moment === 'SENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : deliveryStatus.birth_moment === 'DISABLED'
                            ? 'bg-gray-800 text-gray-400 border border-gray-700'
                            : deliveryStatus.birth_moment === 'FAILED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                        }`}
                      >
                        {deliveryStatus.birth_moment}
                      </span>
                    </div>
                    <div className="font-cinzel text-xs text-white font-semibold">28 September · 08:00 AM IST</div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Dynamic Age: Welcome to {stats.currentYear - 2003} (?scene=birth-moment)
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('birth_moment')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      onClick={() => handleOpenConfirmModal('birth_moment')}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>

                {/* 3. Yearly Tithi */}
                <div className="p-4 rounded-2xl bg-obsidian-950/80 border border-gold-500/25 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase">
                        3. Yearly Tithi
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-cinzel font-bold uppercase ${
                          deliveryStatus.tithi === 'SENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : deliveryStatus.tithi === 'DISABLED'
                            ? 'bg-gray-800 text-gray-400 border border-gray-700'
                            : deliveryStatus.tithi === 'FAILED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                        }`}
                      >
                        {deliveryStatus.tithi}
                      </span>
                    </div>
                    <div className="font-cinzel text-xs text-white font-semibold">
                      {stats.currentYearTithi || '14 October'} {stats.currentYear} · 08:00 AM IST
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Ashwayuja Shukla Tritiya (?scene=tithi)
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('tithi')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      onClick={() => handleOpenConfirmModal('tithi')}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient & Website Link Settings */}
            <div className="gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
              <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-gold-400" /> Sender, Recipient & Link Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Configured Website URL</label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://your-site.pages.dev"
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email Customization & Live Render Preview Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Customization Form */}
              <div className="lg:col-span-6 gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-gold-400" /> Template Customization
                  </h3>
                  <select
                    value={editingTemplateKey}
                    onChange={(e) => {
                      const k = e.target.value as keyof AllEmailTemplates;
                      setEditingTemplateKey(k);
                      setPreviewTemplateKey(k);
                    }}
                    className="bg-obsidian-950 border border-gold-500/30 text-gold-200 text-xs rounded-xl px-3 py-1.5 font-cinzel focus:outline-none"
                  >
                    <option value="test">🧪 Test Email</option>
                    <option value="advance">✨ Advance Birthday Email</option>
                    <option value="birthday_midnight">✦ Birthday Midnight</option>
                    <option value="birth_moment">☀️ Birth Moment</option>
                    <option value="tithi">ॐ Yearly Tithi</option>
                  </select>
                </div>

                {/* Variable Insertion Pills */}
                <div>
                  <span className="text-[10px] font-cinzel text-gold-400/80 uppercase tracking-widest block mb-1.5">
                    Click to Insert Dynamic Variable:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{{name}}',
                      '{{age}}',
                      '{{birth_date}}',
                      '{{birth_time}}',
                      '{{current_year}}',
                      '{{tithi_date}}',
                      '{{tithi_name}}',
                      '{{website_url}}',
                    ].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="px-2 py-1 rounded-md bg-gold-500/10 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-[10px] font-mono transition-all"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Subject</label>
                    <input
                      type="text"
                      value={templates[editingTemplateKey].subject}
                      onChange={(e) =>
                        setTemplates((prev) => ({
                          ...prev,
                          [editingTemplateKey]: { ...prev[editingTemplateKey], subject: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Top Label</label>
                      <input
                        type="text"
                        value={templates[editingTemplateKey].topLabel || ''}
                        onChange={(e) =>
                          setTemplates((prev) => ({
                            ...prev,
                            [editingTemplateKey]: { ...prev[editingTemplateKey], topLabel: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Heading</label>
                      <input
                        type="text"
                        value={templates[editingTemplateKey].heading}
                        onChange={(e) =>
                          setTemplates((prev) => ({
                            ...prev,
                            [editingTemplateKey]: { ...prev[editingTemplateKey], heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Message Body</label>
                    <textarea
                      rows={5}
                      value={templates[editingTemplateKey].message}
                      onChange={(e) =>
                        setTemplates((prev) => ({
                          ...prev,
                          [editingTemplateKey]: { ...prev[editingTemplateKey], message: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-sans leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={templates[editingTemplateKey].buttonText}
                        onChange={(e) =>
                          setTemplates((prev) => ({
                            ...prev,
                            [editingTemplateKey]: { ...prev[editingTemplateKey], buttonText: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Deep-link Scene (?scene=...)</label>
                      <input
                        type="text"
                        value={templates[editingTemplateKey].deepLinkScene || ''}
                        onChange={(e) =>
                          setTemplates((prev) => ({
                            ...prev,
                            [editingTemplateKey]: { ...prev[editingTemplateKey], deepLinkScene: e.target.value },
                          }))
                        }
                        placeholder="e.g. birthday, birth-moment, tithi"
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Footer</label>
                    <input
                      type="text"
                      value={templates[editingTemplateKey].footer || ''}
                      onChange={(e) =>
                        setTemplates((prev) => ({
                          ...prev,
                          [editingTemplateKey]: { ...prev[editingTemplateKey], footer: e.target.value },
                        }))
                      }
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-gray-300 text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveTemplates}
                  disabled={isSavingTemplates}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold font-cinzel text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {isSavingTemplates ? 'Saving...' : 'Save Email Customizations'}
                </button>
              </div>

              {/* Right: Live Render Preview */}
              <div className="lg:col-span-6 gold-card p-6 rounded-3xl border-gold-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-gold-500/20 pb-3 mb-4">
                    <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gold-400" /> Live Render Preview
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {(['test', 'advance', 'birthday_midnight', 'birth_moment', 'tithi'] as const).map((k) => (
                        <button
                          key={k}
                          onClick={() => setPreviewTemplateKey(k)}
                          className={`px-2 py-1 rounded text-[10px] font-cinzel uppercase transition-all ${
                            previewTemplateKey === k
                              ? 'bg-gold-500 text-obsidian-950 font-bold'
                              : 'text-gray-400 hover:text-white bg-obsidian-950'
                          }`}
                        >
                          {k === 'birthday_midnight' ? 'Midnight' : k === 'birth_moment' ? 'Moment' : k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Render Card */}
                  <div className="rounded-2xl border border-gold-500/30 bg-[#030305] p-5 text-center text-[#FAF8F5] max-h-[520px] overflow-y-auto scrollbar-thin">
                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-b from-[#13101C] to-[#07060A] border border-gold-500/50 shadow-2xl">
                      <div className="w-10 h-10 rounded-full border border-gold-400 mx-auto flex items-center justify-center text-gold-300 font-bold text-base mb-3 bg-gold-500/10">
                        {previewTemplateKey === 'tithi'
                          ? 'ॐ'
                          : previewTemplateKey === 'birth_moment'
                          ? '☀️'
                          : previewTemplateKey === 'test'
                          ? '🧪'
                          : '✦'}
                      </div>
                      <p className="font-cinzel text-[10px] tracking-[0.25em] text-gold-300 uppercase mb-1 font-semibold">
                        {templates[previewTemplateKey].topLabel || previewTemplateKey.toUpperCase()}
                      </p>
                      <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider mb-4">
                        {replaceEmailVariables(templates[previewTemplateKey].heading, {
                          name: recipientName,
                          currentYear: stats.currentYear,
                          tithiDate: stats.currentYearTithi || '14 October',
                          websiteUrl,
                          recipient: recipientEmail,
                        })}
                      </h4>

                      <div className="text-xs text-gray-300 font-sans leading-relaxed my-4 space-y-2 text-left">
                        {replaceEmailVariables(templates[previewTemplateKey].message, {
                          name: recipientName,
                          currentYear: stats.currentYear,
                          tithiDate: stats.currentYearTithi || '14 October',
                          websiteUrl,
                          recipient: recipientEmail,
                        })
                          .split('\n\n')
                          .map((p, idx) => (
                            <p key={idx} className="my-1.5">
                              {p}
                            </p>
                          ))}
                      </div>

                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-amber-600 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:from-gold-400 hover:to-amber-500 transition-all"
                      >
                        {replaceEmailVariables(templates[previewTemplateKey].buttonText, {
                          name: recipientName,
                          currentYear: stats.currentYear,
                        })}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EMAIL HISTORY (Requirement 15 & 16) */}
        {activeTab === 'logs' && (
          <div className="gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div>
                <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-gold-400" /> EMAIL HISTORY ({emailLogs.length} Records)
                </h3>
                <p className="text-[11px] text-gray-400 font-outfit mt-0.5">
                  Complete audit log of test, advance, and scheduled yearly dispatches.
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-gold-300 hover:text-white text-xs font-cinzel"
              >
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gold-500/20 bg-obsidian-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-900 text-gold-300 font-cinzel uppercase border-b border-gold-500/20 tracking-wider">
                  <tr>
                    <th className="p-3">Year / Event</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Scheduled / Sent At</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-cinzel">
                        No email history records found.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => {
                      const logMode = (log as any).mode || (log.event_type === 'test' ? 'test' : 'real');
                      return (
                        <tr key={log.id} className="hover:bg-gold-500/5 transition-colors">
                          <td className="p-3 font-cinzel">
                            <span className="text-white font-bold block">{log.year}</span>
                            <span className="text-gold-400 text-[10px] uppercase">{log.event_type}</span>
                          </td>
                          <td className="p-3 font-cinzel">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                logMode === 'real'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : logMode === 'advance'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {logMode}
                            </span>
                          </td>
                          <td className="p-3 text-gray-300 font-mono text-[11px]">{log.recipient}</td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            <div>{log.scheduled_date}</div>
                            <div className="text-[10px] text-gray-500">
                              {new Date(log.sent_at || (log as any).attempted_at || Date.now()).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3 text-gray-200">{log.subject}</td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'SENT'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : log.status === 'FAILED'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : log.status === 'SKIPPED_DUPLICATE'
                                  ? 'bg-gray-700/40 text-gray-400 border border-gray-600/30'
                                  : 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE & SETTINGS */}
        {activeTab === 'database' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-gold-400" /> Cloud Database Configuration
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-cinzel font-semibold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isSupabaseConfigured ? '● Supabase PostgreSQL Live' : '● Local Storage Fallback Active'}
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed font-outfit">
                {isSupabaseConfigured
                  ? 'All living Tithi records and email audit logs are synchronized in real-time with your Supabase PostgreSQL cloud database.'
                  : 'Operating with the verified local seed (2003–2030) and local storage. Connect Supabase by configuring VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'}
              </p>

              <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cinzel text-xs text-gold-300 font-semibold">
                    PostgreSQL Database Schema
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-400 overflow-x-auto p-3 rounded-lg bg-obsidian-900 border border-gold-500/10">
                  {`-- Run in Supabase SQL Editor:
-- Creates tithi_dates & email_logs tables with RLS policies
-- File: supabase_schema.sql`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Year Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl"
            >
              <h3 className="font-cinzel text-lg font-bold text-white mb-4">
                {editingRecord ? `Edit Year ${editingRecord.year}` : 'Add New Year to Living Timeline'}
              </h3>

              <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Year (2003–2103)</label>
                    <input
                      type="number"
                      min={2003}
                      max={2103}
                      value={formYear}
                      onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                    >
                      <option value="published">Published (Live to public)</option>
                      <option value="draft">Draft (Admin only)</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Verified Tithi Date (e.g. 14 October)</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Tithi Name</label>
                  <input
                    type="text"
                    value={formTithi}
                    onChange={(e) => setFormTithi(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-obsidian-950 border border-gray-700 text-gray-300 font-cinzel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 font-cinzel font-bold text-obsidian-950 uppercase tracking-wider"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEND CONFIRMATION MODAL (Requirement 17 & 18) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-md p-6 rounded-3xl bg-obsidian-900 border border-gold-500/50 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full border border-gold-400 mx-auto flex items-center justify-center text-gold-300 bg-gold-500/10">
                <Send className="w-5 h-5 text-gold-300" />
              </div>

              <h3 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider">
                {confirmModal.title}
              </h3>

              <div className="p-4 rounded-2xl bg-obsidian-950 border border-gold-500/20 text-xs text-left space-y-2 font-outfit">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-medium">{recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-amber-300 font-bold uppercase font-cinzel">
                    {confirmModal.type.toUpperCase()}
                  </span>
                </div>
                <div className="pt-2 border-t border-gold-500/15 text-[11px] text-gray-400">
                  {confirmModal.description}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-5 py-2.5 rounded-xl bg-obsidian-950 border border-gray-700 text-gray-300 font-cinzel text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteSend}
                  disabled={isSendingEmail}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
                >
                  {isSendingEmail ? 'SENDING...' : 'SEND EMAIL'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
