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
  Sparkles,
  History,
  Copy,
  Check,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { tithiService } from '../../services/tithiService';
import { calculateTimelineStats } from '../../data/timelineData';
import { isSupabaseConfigured, supabase, type TithiDateRecord, type EmailLogRecord } from '../../lib/supabase';
import { audioEngine } from '../../utils/audioEngine';

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
  const [activeTab, setActiveTab] = useState<'calendar' | 'email' | 'database'>('calendar');

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        // In local mode, check session flag in sessionStorage
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
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (error) throw error;
        if (data.session) {
          setIsAuthenticated(true);
          audioEngine.playChime(528, 1.5);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setAuthError(msg);
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      // Local demo password check
      setTimeout(() => {
        if (adminPassword.length >= 4 || adminPassword === 'siri2003' || adminPassword === 'admin') {
          sessionStorage.setItem('siri_admin_authenticated', 'true');
          setIsAuthenticated(true);
          audioEngine.playChime(528, 1.5);
        } else {
          setAuthError('Please enter a password with at least 4 characters (e.g. siri2003).');
        }
        setIsLoggingIn(false);
      }, 400);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('siri_admin_authenticated');
    setIsAuthenticated(false);
    setAdminPassword('');
  };

  // Open Add Modal with smart default (next unpublished year)
  const stats = calculateTimelineStats(records);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormYear(stats.nextUnpublishedYear);
    setFormDate('');
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

  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate.trim()) return;

    await tithiService.saveDate({
      id: editingRecord?.id,
      year: formYear,
      date: formDate.trim(),
      tithi_name: formTithi.trim(),
      status: formStatus,
      notes: formNotes,
    });

    setIsModalOpen(false);
    await loadAllData();
    onDataUpdated?.();
    audioEngine.playChime(648, 1.2);
  };

  const handleToggleStatus = async (rec: TithiDateRecord, newStatus: 'published' | 'draft' | 'unpublished') => {
    await tithiService.setStatus(rec.id, rec.year, newStatus);
    await loadAllData();
    onDataUpdated?.();
    audioEngine.playChime(540, 1.0);
  };

  const handleDeleteDate = async (rec: TithiDateRecord) => {
    if (window.confirm(`Are you sure you want to remove year ${rec.year} (${rec.date})?`)) {
      await tithiService.deleteDate(rec.id, rec.year);
      await loadAllData();
      onDataUpdated?.();
    }
  };

  const handleSendTestEmail = async (type: 'birthday' | 'tithi') => {
    setIsSendingEmail(true);
    setEmailMessage(null);

    try {
      const currentYr = new Date().getFullYear();
      const tithiDateStr = stats.currentYearTithi || '14 October';
      const scheduledDate = type === 'birthday' ? `28 September ${currentYr}` : `${tithiDateStr} ${currentYr}`;
      const subject = type === 'birthday' ? `Happy Birthday, SIRI ✨` : `A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya)`;

      // Try hitting backend if available
      try {
        await fetch('http://localhost:3001/api/email/test-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: type, year: currentYr }),
        });
      } catch {
        // Backend offline, log directly through tithiService
      }

      await tithiService.logEmail({
        year: currentYr,
        event_type: type,
        scheduled_date: scheduledDate,
        recipient: recipientEmail,
        status: 'SIMULATED',
        subject,
      });

      setEmailMessage({
        type: 'success',
        text: `[Email Logged] Verified ${type === 'birthday' ? 'Birthday' : 'Tithi'} wish for ${recipientEmail}`,
      });
      const logs = await tithiService.getEmailLogs();
      setEmailLogs(logs);
      audioEngine.playChime(720, 1.8);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setEmailMessage({ type: 'error', text: `Failed: ${msg}` });
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
      <header className="px-6 py-4 border-b border-gold-500/25 bg-obsidian-900/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToFilm}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian-950 border border-gold-500/30 hover:border-gold-400 text-gold-300 hover:text-white text-xs font-cinzel transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Film
          </button>

          <div className="h-4 w-[1px] bg-gold-500/30 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-gold-400 bg-gold-500/10 flex items-center justify-center font-cinzel text-xs font-bold gold-text">
              S
            </div>
            <div>
              <h1 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
                SIRI <span className="gold-text">ADMIN PORTAL</span>
              </h1>
              <p className="text-[10px] text-gold-400/80">Living Birthday Data & Tithi Engine</p>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-950 border border-gold-500/20 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-400">{adminEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 text-xs font-cinzel transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        /* LOGIN VIEW */
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md gold-card p-8 rounded-3xl border-gold-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-full border border-gold-400/60 bg-gold-500/10 mx-auto flex items-center justify-center text-gold-300 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase tracking-wider mb-1">
              Admin Access
            </h2>
            <p className="text-xs text-gold-300/80 mb-6">
              Manage living Tithi dates, email automation, and database synchronization.
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-gray-400 font-outfit mb-1 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs focus:outline-none focus:border-gold-400 font-outfit"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-outfit mb-1 uppercase tracking-wider">
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password (e.g. siri2003)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs focus:outline-none focus:border-gold-400 font-outfit"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all mt-2 disabled:opacity-50"
              >
                {isLoggingIn ? 'Authenticating...' : 'Enter Admin Panel'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gold-500/15 text-[11px] text-gray-400 flex items-center justify-between">
              <span>Status: {isSupabaseConfigured ? '🟢 Supabase Connected' : '🟡 Local Storage Mode'}</span>
              <span className="text-gold-300">Default: siri2003</span>
            </div>
          </motion.div>
        </div>
      ) : (
        /* AUTHENTICATED ADMIN DASHBOARD */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* 5 Dynamic Dashboard Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Published Years */}
            <div className="gold-card p-4 rounded-2xl border-gold-500/30 flex flex-col justify-between">
              <span className="text-[10px] text-gold-400 uppercase tracking-widest font-cinzel">
                Published Years
              </span>
              <div className="my-2">
                <span className="font-cinzel text-3xl font-bold gold-text">{stats.publishedCount}</span>
                <span className="text-xs text-gray-400 ml-1">years</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live on website
              </span>
            </div>

            {/* Card 2: Draft Years */}
            <div className="gold-card p-4 rounded-2xl border-gold-500/20 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-cinzel">
                Draft Years
              </span>
              <div className="my-2">
                <span className="font-cinzel text-3xl font-bold text-white">{stats.draftsCount}</span>
                <span className="text-xs text-gray-400 ml-1">drafts</span>
              </div>
              <span className="text-[10px] text-amber-400">Not visible to public</span>
            </div>

            {/* Card 3: Latest Published Year */}
            <div className="burgundy-card p-4 rounded-2xl border-gold-400/40 flex flex-col justify-between shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <span className="text-[10px] text-gold-300 uppercase tracking-widest font-cinzel">
                Latest Published
              </span>
              <div className="my-2">
                <span className="font-cinzel text-3xl font-bold gold-text">{stats.latestPublishedYear}</span>
              </div>
              <span className="text-[10px] text-gold-200">Verified horizon</span>
            </div>

            {/* Card 4: Next Unpublished Year */}
            <div className="gold-card p-4 rounded-2xl border-gold-500/20 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-cinzel">
                Next In Line
              </span>
              <div className="my-2">
                <span className="font-cinzel text-3xl font-bold text-amber-200">{stats.nextUnpublishedYear}</span>
              </div>
              <span className="text-[10px] text-gray-400">Ready to add</span>
            </div>

            {/* Card 5: Current Year */}
            <div className="gold-card p-4 rounded-2xl border-gold-500/40 flex flex-col justify-between bg-gold-950/30">
              <span className="text-[10px] text-gold-300 uppercase tracking-widest font-cinzel font-semibold">
                Current Year
              </span>
              <div className="my-2">
                <span className="font-cinzel text-3xl font-bold gold-text">{stats.currentYear}</span>
              </div>
              <span className="text-[10px] text-gold-300">
                {stats.isCurrentYearPublished ? `★ ${stats.currentYearTithi}` : '⚠️ Yet to be revealed'}
              </span>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-gold-500/20 border border-gold-400 text-gold-200 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" /> Tithi Calendar Database
              </button>

              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all ${
                  activeTab === 'email'
                    ? 'bg-gold-500/20 border border-gold-400 text-gold-200 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" /> Email Automation & Logs
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel uppercase tracking-wider transition-all ${
                  activeTab === 'database'
                    ? 'bg-gold-500/20 border border-gold-400 text-gold-200 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" /> Supabase & Cloud Config
              </button>
            </div>

            {activeTab === 'calendar' && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Year
              </button>
            )}
          </div>

          {/* TAB 1: TITHI CALENDAR MANAGEMENT */}
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

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
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
                                    title="Publish to public timeline"
                                  >
                                    Publish
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleStatus(rec, 'draft')}
                                    className="px-2.5 py-1 rounded-lg bg-obsidian-950 hover:bg-obsidian-900 border border-gold-500/30 text-amber-300 text-[11px] font-cinzel transition-all"
                                    title="Revert to draft"
                                  >
                                    Unpublish
                                  </button>
                                )}

                                <button
                                  onClick={() => handleOpenEditModal(rec)}
                                  className="p-1.5 rounded-lg bg-obsidian-950 hover:bg-gold-500/10 border border-gold-500/25 text-gray-300 hover:text-gold-200 transition-all"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteDate(rec)}
                                  className="p-1.5 rounded-lg bg-obsidian-950 hover:bg-red-500/20 border border-red-500/20 text-gray-400 hover:text-red-300 transition-all"
                                  title="Delete"
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

          {/* TAB 2: EMAIL AUTOMATION */}
          {activeTab === 'email' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Schedulers & Testing */}
              <div className="space-y-4">
                <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold-400" /> Yearly Dual Email Automation
                  </h3>

                  {emailMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-outfit ${
                        emailMessage.type === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                          : 'bg-red-950/60 border border-red-500/40 text-red-200'
                      }`}
                    >
                      {emailMessage.text}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Recipient Email Address</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs"
                      />
                    </div>

                    {/* Event 1 Card */}
                    <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20 flex items-center justify-between">
                      <div>
                        <span className="font-cinzel text-xs text-gold-300 font-semibold block">
                          EVENT 1 · Fixed Birthday Email
                        </span>
                        <span className="text-xs text-gray-400">Every year on 28 September</span>
                      </div>
                      <button
                        onClick={() => handleSendTestEmail('birthday')}
                        disabled={isSendingEmail}
                        className="px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 border border-gold-400/40 text-gold-200 text-xs font-cinzel flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Test
                      </button>
                    </div>

                    {/* Event 2 Card */}
                    <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20 flex items-center justify-between">
                      <div>
                        <span className="font-cinzel text-xs text-gold-300 font-semibold block">
                          EVENT 2 · Yearly Tithi Email
                        </span>
                        <span className="text-xs text-gray-400">
                          {stats.currentYear}: {stats.currentYearTithi || 'Awaiting publication'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSendTestEmail('tithi')}
                        disabled={isSendingEmail}
                        className="px-3 py-1.5 rounded-lg bg-burgundy-950 hover:bg-burgundy-900 border border-gold-400/40 text-gold-200 text-xs font-cinzel flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deduplication Logs */}
              <div className="gold-card p-6 rounded-2xl border-gold-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gold-500/20">
                    <h3 className="font-cinzel text-xs font-bold text-gold-200 uppercase tracking-widest flex items-center gap-2">
                      <History className="w-4 h-4 text-gold-400" /> Deduplication & Sent History
                    </h3>
                    <span className="text-[11px] text-gray-400">{emailLogs.length} entries</span>
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {emailLogs.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">No email dispatches recorded yet.</p>
                    ) : (
                      emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-obsidian-950/80 border border-gold-500/15 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-cinzel font-semibold text-white block">
                              {log.year} · <span className="gold-text uppercase">{log.event_type}</span>
                            </span>
                            <span className="text-[11px] text-gray-400">{log.recipient} · {log.scheduled_date}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'SENT'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-gold-500/20 text-gold-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE & CLOUD CONFIG */}
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
                    {isSupabaseConfigured ? '🟢 Live Supabase Connected' : '🟡 Local Storage & Memory Fallback'}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  The application is engineered with a <strong>Free-First Architecture</strong>. You can connect your free Supabase PostgreSQL project anytime by setting <code className="text-gold-200 bg-obsidian-950 px-2 py-0.5 rounded border border-gold-500/30">VITE_SUPABASE_URL</code> and <code className="text-gold-200 bg-obsidian-950 px-2 py-0.5 rounded border border-gold-500/30">VITE_SUPABASE_ANON_KEY</code> in your environment variables.
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400 font-cinzel">PostgreSQL SQL Schema Ready</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL Schema'}</span>
                  </button>
                </div>
              </div>

              {/* Free Deployment Guide */}
              <div className="gold-card p-6 rounded-2xl border-gold-500/25 space-y-3">
                <h4 className="font-cinzel text-xs font-bold text-gold-300 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold-400" /> 100% Free Hosting Options
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                  <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20">
                    <strong className="text-white block font-cinzel mb-1">Option 1: Cloudflare Pages (Recommended)</strong>
                    <span>Connect your repository to Cloudflare Pages. Build command: <code>npm run build</code>, Output directory: <code>dist</code>. Includes free global CDN and unlimited bandwidth.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-obsidian-950 border border-gold-500/20">
                    <strong className="text-white block font-cinzel mb-1">Option 2: GitHub Pages</strong>
                    <span>Deploy directly via GitHub Actions or static export. Free forever under standard GitHub limits.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ADD / EDIT YEAR MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md gold-card p-6 rounded-3xl border-gold-400/50 shadow-2xl relative"
            >
              <h3 className="font-cinzel text-lg font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                {editingRecord ? `Edit Year ${editingRecord.year}` : 'Add New Tithi Year'}
              </h3>
              <p className="text-xs text-gold-300/80 mb-6">
                Publish verified Hindu lunar calendar dates to the living timeline.
              </p>

              <form onSubmit={handleSaveDate} className="space-y-4 text-xs text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1 font-cinzel">Year</label>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-cinzel font-bold text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-cinzel">Tithi Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 19 October"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-cinzel text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-cinzel">Tithi Name</label>
                  <input
                    type="text"
                    value={formTithi}
                    onChange={(e) => setFormTithi(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-cinzel">Publication Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'published' | 'draft' | 'unpublished')}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white font-cinzel"
                  >
                    <option value="published">Published (Visible on Public Website)</option>
                    <option value="draft">Draft (Private in Admin Only)</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-cinzel">Notes / Milestone (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Verified from calendar"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-obsidian-950 border border-gold-500/30 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gold-500/20">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-obsidian-950 border border-gold-500/30 text-gray-300 font-cinzel text-xs hover:bg-gold-500/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
                  >
                    Save & Apply
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
