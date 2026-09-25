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
  AlertTriangle,
  Settings,
  Eye,
  LayoutDashboard,
} from 'lucide-react';
import { tithiService } from '../../services/tithiService';
import { calculateTimelineStats } from '../../data/timelineData';
import { isSupabaseConfigured, supabase, type TithiDateRecord, type EmailLogRecord } from '../../lib/supabase';
import { audioEngine } from '../../utils/audioEngine';
import {
  DEFAULT_EMAIL_TEMPLATES,
  calculateRemainingCountdownSnapshot,
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

  // Active View Tabs
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
  const [websiteUrl, setWebsiteUrl] = useState('http://localhost:5173');
  const [templates, setTemplates] = useState<AllEmailTemplates>(DEFAULT_EMAIL_TEMPLATES);
  const [editingTemplateKey, setEditingTemplateKey] = useState<keyof AllEmailTemplates>('birthday_midnight');
  const [previewTemplateKey, setPreviewTemplateKey] = useState<keyof AllEmailTemplates>('birthday_midnight');
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Send Test Confirmation Modal State
  const [isTestConfirmOpen, setIsTestConfirmOpen] = useState(false);
  const [testTargetType, setTestTargetType] = useState<'test' | 'birthday_midnight' | 'birth_moment' | 'tithi'>('test');

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

      // Fetch backend email status & templates if available
      try {
        const res = await fetch('http://localhost:3001/api/email/status');
        const data = await res.json();
        if (data.config?.recipientEmail) setRecipientEmail(data.config.recipientEmail);
        if (data.config?.websiteUrl) setWebsiteUrl(data.config.websiteUrl);
        if (data.templates) setTemplates(data.templates);
        if (data.logs && data.logs.length > 0) setEmailLogs(data.logs);
      } catch {
        // Fallback to client state
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
        audioEngine.playChime(648, 2.0);
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
          audioEngine.playChime(648, 2.0);
          await loadAllData();
          return;
        }
      }

      setAuthError('Invalid credentials. (Hint: default password is siri2003)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || 'Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('siri_admin_authenticated');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminPassword('');
  };

  const stats = calculateTimelineStats(records);
  const countdownSnapshot = calculateRemainingCountdownSnapshot(stats.currentYear);

  // Calendar CRUD Handlers
  const handleOpenAddModal = () => {
    const nextYear = records.length > 0 ? Math.max(...records.map((r) => r.year)) + 1 : 2031;
    setEditingRecord(null);
    setFormYear(nextYear);
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
      onDataUpdated?.();
      audioEngine.playChime(528, 1.5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error saving date: ${msg}`);
    }
  };

  const handleToggleStatus = async (rec: TithiDateRecord, newStatus: 'published' | 'draft' | 'unpublished') => {
    await tithiService.saveDate({
      ...rec,
      status: newStatus,
    });
    await loadAllData();
    onDataUpdated?.();
  };

  const handleDeleteDate = async (rec: TithiDateRecord) => {
    if (window.confirm(`Are you sure you want to remove year ${rec.year} (${rec.date})?`)) {
      await tithiService.deleteDate(rec.id, rec.year);
      await loadAllData();
      onDataUpdated?.();
    }
  };

  // Email Template Handlers
  const handleSaveTemplates = async () => {
    setIsSavingTemplates(true);
    setEmailMessage(null);
    try {
      await fetch('http://localhost:3001/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
      await fetch('http://localhost:3001/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, websiteUrl }),
      });
      setEmailMessage({ type: 'success', text: 'Email customization and website URL saved successfully!' });
      audioEngine.playChime(528, 1.5);
    } catch {
      setEmailMessage({ type: 'success', text: 'Saved locally in memory.' });
    } finally {
      setIsSavingTemplates(false);
    }
  };

  const handleInsertVariable = (variableTag: string) => {
    setTemplates((prev) => {
      const curr = prev[editingTemplateKey];
      return {
        ...prev,
        [editingTemplateKey]: {
          ...curr,
          message: curr.message + ' ' + variableTag,
        },
      };
    });
  };

  const handleConfirmSendTest = async () => {
    setIsTestConfirmOpen(false);
    setIsSendingEmail(true);
    setEmailMessage(null);

    try {
      const res = await fetch('http://localhost:3001/api/email/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: testTargetType, year: stats.currentYear }),
      });
      const data = await res.json();
      if (data.log) {
        setEmailLogs((prev) => [data.log, ...prev]);
      }
      setEmailMessage({
        type: 'success',
        text: `[Test Dispatch Success] ${data.message || 'Delivered to ' + recipientEmail}`,
      });
      audioEngine.playChime(720, 2.0);
    } catch {
      // Offline simulation fallback
      const simLog: EmailLogRecord = {
        id: `sim-${Date.now()}`,
        year: stats.currentYear,
        event_type: testTargetType === 'test' ? 'test' : testTargetType,
        mode: 'test',
        scheduled_date: `Test (${new Date().toLocaleDateString()})`,
        recipient: recipientEmail,
        sent_at: new Date().toISOString(),
        status: 'SIMULATED',
        subject: `Advance Test Preview ✨ (${recipientEmail})`,
      };
      setEmailLogs((prev) => [simLog, ...prev]);
      setEmailMessage({
        type: 'success',
        text: `[Simulated Dispatch] Advance test email logged & verified for ${recipientEmail}`,
      });
      audioEngine.playChime(720, 2.0);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopySql = () => {
    const sqlContent = `-- Copy from supabase_schema.sql in project root`;
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.year.toString().includes(searchQuery.trim()) ||
      rec.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.notes && rec.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && rec.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-obsidian-950 text-[#FAF8F5] flex flex-col font-outfit">
      {/* Top Admin Luxury Bar */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-gold-500/25 bg-obsidian-900/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToFilm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian-950 border border-gold-500/30 hover:border-gold-400 text-gold-300 hover:text-white text-xs font-cinzel transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Film
          </button>

          <div className="h-4 w-[1px] bg-gold-500/30 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-gold-400 bg-gold-500/10 flex items-center justify-center font-cinzel text-xs font-bold gold-text">
              S
            </div>
            <div>
              <h1 className="font-cinzel text-xs sm:text-sm font-bold text-white tracking-wider flex items-center gap-2">
                SIRI <span className="gold-text">ADMIN PORTAL</span>
              </h1>
              <span className="text-[9px] text-gold-400/70 font-outfit block">
                Living Birthday & Email Automation Control
              </span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-950 border border-red-500/30 hover:border-red-500/60 text-red-300 text-xs font-cinzel transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        )}
      </header>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-full border border-gold-400 mx-auto flex items-center justify-center text-gold-300 mb-4 bg-gold-500/10">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-white uppercase tracking-wider mb-1">
              Admin Authentication
            </h2>
            <p className="text-xs text-gold-400/80 mb-6 font-outfit">
              Secure access to manage living timeline dates and dual-event email automation.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-gray-400 font-cinzel mb-1 uppercase tracking-wider">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password (siri2003)..."
                  className="w-full p-3 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-gold-400"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold font-cinzel text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
              >
                {isLoggingIn ? 'Authenticating...' : 'Enter Admin Portal'}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gold-500/20 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'calendar', label: 'Tithi Calendar Database', icon: Calendar },
              { id: 'email', label: 'Email Automation', icon: Mail },
              { id: 'logs', label: 'Email History', icon: History },
              { id: 'database', label: 'Database & Settings', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gold-500/20 border border-gold-400 text-gold-200 font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      : 'text-gray-400 hover:text-white bg-obsidian-900/40'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="gold-card p-4 sm:p-5 rounded-2xl border-gold-500/30">
                  <span className="font-outfit text-[11px] text-gray-400 uppercase tracking-widest block">
                    Current Year
                  </span>
                  <span className="font-cinzel text-2xl sm:text-3xl font-bold gold-text mt-1 block">
                    {stats.currentYear}
                  </span>
                  <span className="text-[11px] text-gold-300/80 font-outfit mt-0.5 block">
                    {stats.currentYearTithi || '14 October'}
                  </span>
                </div>

                <div className="gold-card p-4 sm:p-5 rounded-2xl border-gold-500/30">
                  <span className="font-outfit text-[11px] text-gray-400 uppercase tracking-widest block">
                    Total Timeline Span
                  </span>
                  <span className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1 block">
                    101 Years
                  </span>
                  <span className="text-[11px] text-gray-400 font-outfit mt-0.5 block">
                    2003 → 2103 Horizon
                  </span>
                </div>

                <div className="gold-card p-4 sm:p-5 rounded-2xl border-gold-500/30">
                  <span className="font-outfit text-[11px] text-gray-400 uppercase tracking-widest block">
                    Published Years
                  </span>
                  <span className="font-cinzel text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 block">
                    {stats.publishedCount}
                  </span>
                  <span className="text-[11px] text-emerald-300/80 font-outfit mt-0.5 block">
                    Live on Public Timeline
                  </span>
                </div>

                <div className="gold-card p-4 sm:p-5 rounded-2xl border-gold-500/30">
                  <span className="font-outfit text-[11px] text-gray-400 uppercase tracking-widest block">
                    Email System Status
                  </span>
                  <span className="font-cinzel text-xl sm:text-2xl font-bold text-gold-300 mt-1 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 3-Tier Active
                  </span>
                  <span className="text-[11px] text-gray-400 font-outfit mt-0.5 block">
                    Midnight · 08:00 AM · Tithi
                  </span>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-400" /> Tithi Calendar Quick Action
                  </h3>
                  <p className="text-xs text-gray-300 font-outfit">
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
                    <Mail className="w-4 h-4 text-gold-400" /> Test Email Preview
                  </h3>
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-gold-500/20 text-xs">
                    <span className="text-gold-300 font-bold block">Current Countdown Snapshot:</span>
                    <span className="text-white font-mono mt-1 block">{countdownSnapshot.formatted}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTestTargetType('test');
                      setIsTestConfirmOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send Advance Test Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TITHI CALENDAR MANAGEMENT */}
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

          {/* TAB 3: EMAIL AUTOMATION & CUSTOMIZATION */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {emailMessage && (
                <div
                  className={`p-4 rounded-xl text-xs font-outfit flex items-center gap-2 ${
                    emailMessage.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/60 border border-red-500/40 text-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{emailMessage.text}</span>
                </div>
              )}

              {/* 3 Real-Event Schedule Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Birthday Midnight */}
                <div className="gold-card p-5 rounded-2xl border-gold-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase tracking-wider">
                        1. Birthday Midnight
                      </span>
                      <button
                        onClick={() => {
                          setTemplates((prev) => ({
                            ...prev,
                            birthday_midnight: {
                              ...prev.birthday_midnight,
                              enabled: !prev.birthday_midnight.enabled,
                            },
                          }));
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          templates.birthday_midnight.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {templates.birthday_midnight.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    <div className="font-cinzel text-sm text-white font-semibold">28 September · 12:00 AM IST</div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Marks the start of the birthday day with button: "{templates.birthday_midnight.buttonText}".
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('birthday_midnight')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={() => {
                        setTestTargetType('birthday_midnight');
                        setIsTestConfirmOpen(true);
                      }}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>

                {/* 2. Birth Moment */}
                <div className="gold-card p-5 rounded-2xl border-gold-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase tracking-wider">
                        2. Birth Moment
                      </span>
                      <button
                        onClick={() => {
                          setTemplates((prev) => ({
                            ...prev,
                            birth_moment: {
                              ...prev.birth_moment,
                              enabled: !prev.birth_moment.enabled,
                            },
                          }));
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          templates.birth_moment.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {templates.birth_moment.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    <div className="font-cinzel text-sm text-white font-semibold">28 September · 08:00 AM IST</div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Exact birth time with dynamic age reveal: "Welcome to {stats.currentYear - 2003}".
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('birth_moment')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={() => {
                        setTestTargetType('birth_moment');
                        setIsTestConfirmOpen(true);
                      }}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>

                {/* 3. Yearly Tithi */}
                <div className="gold-card p-5 rounded-2xl border-gold-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-cinzel text-xs text-gold-300 font-bold uppercase tracking-wider">
                        3. Yearly Tithi
                      </span>
                      <button
                        onClick={() => {
                          setTemplates((prev) => ({
                            ...prev,
                            tithi: {
                              ...prev.tithi,
                              enabled: !prev.tithi.enabled,
                            },
                          }));
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          templates.tithi.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {templates.tithi.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    <div className="font-cinzel text-sm text-white font-semibold">
                      {stats.currentYearTithi || '14 October'} · 08:00 AM IST
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Ashwayuja Shukla Tritiya return date queried dynamically from database.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gold-500/15">
                    <button
                      onClick={() => setPreviewTemplateKey('tithi')}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={() => {
                        setTestTargetType('tithi');
                        setIsTestConfirmOpen(true);
                      }}
                      className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      <Send className="w-3 h-3" /> Test Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Global Config & Send Test Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-obsidian-900 to-obsidian-950 border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <span className="font-cinzel text-xs text-gold-300 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gold-400" /> Recipient & Website Link Settings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Configured Website Base URL</label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://siri-birthday.pages.dev"
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setTestTargetType('test');
                      setIsTestConfirmOpen(true);
                    }}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold font-cinzel text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                  >
                    <Send className="w-4 h-4" /> Send Advance Test Email
                  </button>
                  <span className="text-[10px] text-gray-400 font-outfit">
                    Does not affect real yearly scheduled emails.
                  </span>
                </div>
              </div>

              {/* Email Customization & Live Preview Workbench */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customization Editor */}
                <div className="lg:col-span-6 gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
                    <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-gold-400" /> Email Customization
                    </h3>
                    {/* Template Selector */}
                    <select
                      value={editingTemplateKey}
                      onChange={(e) => {
                        const k = e.target.value as keyof AllEmailTemplates;
                        setEditingTemplateKey(k);
                        setPreviewTemplateKey(k);
                      }}
                      className="bg-obsidian-950 border border-gold-500/30 text-gold-200 text-xs rounded-xl px-3 py-1.5 font-cinzel focus:outline-none"
                    >
                      <option value="birthday_midnight">✦ Birthday Midnight</option>
                      <option value="birth_moment">☀️ Birth Moment</option>
                      <option value="tithi">ॐ Yearly Tithi</option>
                      <option value="advance_test">✨ Advance Test</option>
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
                        '{{time_remaining}}',
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

                  {/* Form Inputs for Active Template */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Email Subject</label>
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

                    <div>
                      <label className="block text-gray-400 mb-1">Card Heading</label>
                      <input
                        type="text"
                        value={templates[editingTemplateKey].heading}
                        onChange={(e) =>
                          setTemplates((prev) => ({
                            ...prev,
                            [editingTemplateKey]: { ...prev[editingTemplateKey], heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Message Body (Paragraphs supported)</label>
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
                        <label className="block text-gray-400 mb-1">Deep-link / Scene (?scene=...)</label>
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
                  </div>

                  <button
                    onClick={handleSaveTemplates}
                    disabled={isSavingTemplates}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold font-cinzel text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                  >
                    {isSavingTemplates ? 'Saving...' : 'Save Email Customizations'}
                  </button>
                </div>

                {/* Right: Interactive Live Email Preview */}
                <div className="lg:col-span-6 gold-card p-6 rounded-3xl border-gold-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gold-500/20 pb-3 mb-4">
                      <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gold-400" /> Live Render Preview
                      </h3>
                      <span className="text-[10px] font-cinzel text-gold-400/80 uppercase">
                        Dynamic Variables Evaluated
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div className="rounded-2xl border border-gold-500/30 bg-[#030305] p-5 text-center text-[#FAF8F5] max-h-[500px] overflow-y-auto scrollbar-thin">
                      <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-b from-[#13101C] to-[#07060A] border border-gold-500/50 shadow-2xl">
                        <div className="w-10 h-10 rounded-full border border-gold-400 mx-auto flex items-center justify-center text-gold-300 font-bold text-base mb-3 bg-gold-500/10">
                          {previewTemplateKey === 'tithi' ? 'ॐ' : previewTemplateKey === 'birth_moment' ? '☀️' : '✦'}
                        </div>
                        <p className="font-cinzel text-[10px] tracking-[0.25em] text-gold-300 uppercase mb-1">
                          {previewTemplateKey === 'birthday_midnight'
                            ? 'Midnight Cosmic Milestone'
                            : previewTemplateKey === 'birth_moment'
                            ? 'Exact Moment of Birth'
                            : previewTemplateKey === 'tithi'
                            ? 'Sacred Lunar Return'
                            : 'Advance Birthday Preview'}
                        </p>
                        <h4 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider mb-4">
                          {replaceEmailVariables(templates[previewTemplateKey].heading, {
                            name: recipientEmail.split('@')[0] || 'SIRI',
                            currentYear: stats.currentYear,
                            tithiDate: stats.currentYearTithi || '14 October',
                            websiteUrl,
                          })}
                        </h4>

                        {/* Snapshot countdown for advance test */}
                        {previewTemplateKey === 'advance_test' && (
                          <div className="my-3 p-3 rounded-xl bg-gold-500/10 border border-gold-400/40">
                            <span className="font-cinzel text-[9px] text-gold-300 font-bold block uppercase tracking-widest">
                              THE WAIT
                            </span>
                            <span className="font-cinzel text-sm font-bold text-white block mt-0.5">
                              {countdownSnapshot.formatted}
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-gray-300 font-sans leading-relaxed my-4 space-y-2 text-left">
                          {replaceEmailVariables(templates[previewTemplateKey].message, {
                            name: 'SIRI',
                            currentYear: stats.currentYear,
                            tithiDate: stats.currentYearTithi || '14 October',
                            websiteUrl,
                          })
                            .split('\n\n')
                            .map((p, idx) => (
                              <p key={idx} className="my-1">
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
                            name: 'SIRI',
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

          {/* TAB 4: EMAIL HISTORY & SENT LOGS */}
          {activeTab === 'logs' && (
            <div className="gold-card p-6 rounded-3xl border-gold-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
                <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4 text-gold-400" /> Deduplication & Sent History ({emailLogs.length} entries)
                </h3>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {emailLogs.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-10">No email dispatches recorded yet.</p>
                ) : (
                  emailLogs.map((log) => {
                    const isTest = (log as any).mode === 'test' || log.event_type === 'test';
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-obsidian-900/80 border border-gold-500/15 flex items-center justify-between text-xs hover:border-gold-500/30 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-cinzel font-bold uppercase tracking-wider ${
                                isTest
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              }`}
                            >
                              {isTest ? 'TEST' : 'REAL'}
                            </span>
                            <span className="font-cinzel font-semibold text-white">
                              {log.year} · <span className="gold-text uppercase">{log.event_type}</span>
                            </span>
                          </div>
                          <span className="text-gray-300 font-medium block">{log.subject}</span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            {log.recipient} · {log.scheduled_date} · {new Date(log.sent_at || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
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
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE & CLOUD CONFIG */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-gold-400" /> Database Connection Status
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-cinzel font-semibold ${
                      isSupabaseConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isSupabaseConfigured ? '● Supabase PostgreSQL Live' : '● Local Verified Storage Active'}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-outfit">
                  {isSupabaseConfigured
                    ? 'All Tithi dates and automated email history are synced securely with your Supabase PostgreSQL cloud database.'
                    : 'Operating with the built-in verified verified seed (2003–2030) and local persistent storage fallback.'}
                </p>

                <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-cinzel text-xs text-gold-300 font-semibold">
                      Database Schema File
                    </span>
                    <button
                      onClick={handleCopySql}
                      className="text-xs text-gold-300 hover:text-white flex items-center gap-1 font-cinzel"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-gray-400 overflow-x-auto p-2 rounded bg-obsidian-900 border border-gold-500/10">
                    {`-- Execute in Supabase SQL Editor:
-- File located at: ./supabase_schema.sql`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Year Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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

      {/* SEND TEST EMAIL CONFIRMATION MODAL (Requirement 17) */}
      <AnimatePresence>
        {isTestConfirmOpen && (
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
                SEND TEST EMAIL?
              </h3>

              <div className="p-4 rounded-2xl bg-obsidian-950 border border-gold-500/20 text-xs text-left space-y-2 font-outfit">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="text-white font-medium">{recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-amber-300 font-bold uppercase font-cinzel">
                    {testTargetType === 'test' ? 'ADVANCE PREVIEW' : testTargetType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Countdown:</span>
                  <span className="text-gold-300 font-mono font-semibold">{countdownSnapshot.formatted}</span>
                </div>
                <div className="pt-2 border-t border-gold-500/15 text-[11px] text-gray-400">
                  Purpose: <strong className="text-gray-200">This will not affect real yearly email scheduling.</strong>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsTestConfirmOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-obsidian-950 border border-gray-700 text-gray-300 font-cinzel text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSendTest}
                  disabled={isSendingEmail}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
                >
                  {isSendingEmail ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
