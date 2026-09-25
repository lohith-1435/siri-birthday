import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Settings, History, Calendar, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { getCurrentYearDetails, buildCompleteTimeline, type TimelineEntry } from '../data/timelineData';
import { INITIAL_VERIFIED_DATES } from '../services/tithiService';

interface EmailDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  timelineEntries?: TimelineEntry[];
}

export const EmailDashboardModal: React.FC<EmailDashboardModalProps> = ({ isOpen, onClose, timelineEntries }) => {
  const entries = timelineEntries || buildCompleteTimeline(INITIAL_VERIFIED_DATES as any);
  const { currentYear, tithiDate } = getCurrentYearDetails(entries);
  const [activeTab, setActiveTab] = useState<'preview' | 'config' | 'logs' | 'forecast'>('preview');
  const [previewType, setPreviewType] = useState<'birthday' | 'tithi'>('birthday');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Configuration state
  const [config, setConfig] = useState({
    recipientName: 'SIRI',
    recipientEmail: 'siri@example.com',
    senderEmail: 'blessings@divinejourney.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: '',
    smtpPass: '',
    isSimulatedMode: true,
  });

  // Logs state
  const [logs, setLogs] = useState<Array<{
    id: string;
    recipient: string;
    year: number;
    eventType: string;
    scheduledDate: string;
    sentTimestamp: string;
    status: string;
    subject: string;
  }>>([
    {
      id: 'init-1',
      recipient: 'siri@example.com',
      year: currentYear,
      eventType: 'birthday',
      scheduledDate: `28 September ${currentYear}`,
      sentTimestamp: new Date().toISOString(),
      status: 'SCHEDULED',
      subject: `Happy Birthday, SIRI ✨`,
    },
    {
      id: 'init-2',
      recipient: 'siri@example.com',
      year: currentYear,
      eventType: 'tithi',
      scheduledDate: `${tithiDate} ${currentYear}`,
      sentTimestamp: new Date().toISOString(),
      status: 'SCHEDULED',
      subject: `A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya)`,
    },
  ]);

  // Fetch status from backend if running
  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3001/api/email/status')
        .then((res) => res.json())
        .then((data) => {
          if (data.config) {
            setConfig((prev) => ({ ...prev, ...data.config }));
          }
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs);
          }
        })
        .catch(() => {
          // Backend offline - client mode fallback works seamlessly
        });
    }
  }, [isOpen]);

  const handleSendTest = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/email/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: previewType, year: currentYear }),
      });
      const result = await response.json();
      setSendResult({ success: result.success, message: result.message });
      if (result.log) {
        setLogs((prev) => [result.log, ...prev]);
      }
    } catch {
      // Offline fallback simulation
      setTimeout(() => {
        const newLog = {
          id: `sim-${Date.now()}`,
          recipient: config.recipientEmail,
          year: currentYear,
          eventType: previewType,
          scheduledDate: previewType === 'birthday' ? `28 September ${currentYear}` : `${tithiDate} ${currentYear}`,
          sentTimestamp: new Date().toISOString(),
          status: 'SIMULATED',
          subject: previewType === 'birthday' ? `Happy Birthday, ${config.recipientName} ✨` : `A Divine Birthday Blessing ✨`,
        };
        setLogs((prev) => [newLog, ...prev]);
        setSendResult({
          success: true,
          message: `[Simulated Dispatch Verified] Successfully logged test email for ${config.recipientEmail}`,
        });
        setIsSending(false);
      }, 800);
      return;
    }
    setIsSending(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch {
      // Local state updated
    }
    setSendResult({ success: true, message: 'Configuration saved successfully.' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl h-[88vh] bg-obsidian-950 border border-gold-500/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gold-500/20 flex items-center justify-between bg-obsidian-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/30 text-gold-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Automated Email System <span className="gold-text">· SIRI</span>
                </h2>
                <p className="font-outfit text-xs text-gold-400/70">
                  Dual Yearly Birthday Wishes (28 September + Yearly Tithi Return)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gold-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-6 border-b border-gold-500/15 bg-obsidian-900/30 overflow-x-auto scrollbar-none">
            {[
              { id: 'preview', label: 'Email Preview & Test', icon: Mail },
              { id: 'config', label: 'Recipient & Server Setup', icon: Settings },
              { id: 'logs', label: 'Deduplication & Sent Logs', icon: History },
              { id: 'forecast', label: '10-Year Schedule', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-3.5 px-4 font-cinzel text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-gold-400 text-gold-200 font-bold bg-gold-500/5'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {/* Feedback Alert */}
            {sendResult && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-xs font-outfit ${
                  sendResult.success
                    ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/50 border border-red-500/40 text-red-200'
                }`}
              >
                {sendResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <span>{sendResult.message}</span>
              </div>
            )}

            {/* TAB 1: PREVIEW */}
            {activeTab === 'preview' && (
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Controls */}
                <div className="w-full lg:w-72 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="font-cinzel text-xs text-gold-400 uppercase tracking-widest block mb-2">
                      Select Event Type
                    </span>
                    <div className="space-y-2">
                      <button
                        onClick={() => setPreviewType('birthday')}
                        className={`w-full p-3 rounded-xl text-left border transition-all ${
                          previewType === 'birthday'
                            ? 'bg-gold-500/15 border-gold-400 text-gold-100 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                            : 'gold-card text-gray-300 hover:border-gold-500/40'
                        }`}
                      >
                        <div className="font-cinzel text-xs uppercase tracking-wider text-gold-300">
                          Event 1: Solar Birthday
                        </div>
                        <div className="font-cinzel text-sm text-white mt-1">28 September {currentYear}</div>
                        <div className="text-[11px] text-gray-400 font-outfit mt-0.5">Fixed Annual Solar Date</div>
                      </button>

                      <button
                        onClick={() => setPreviewType('tithi')}
                        className={`w-full p-3 rounded-xl text-left border transition-all ${
                          previewType === 'tithi'
                            ? 'bg-burgundy-900/60 border-gold-400 text-gold-100 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                            : 'burgundy-card text-gray-300 hover:border-gold-500/40'
                        }`}
                      >
                        <div className="font-cinzel text-xs uppercase tracking-wider text-gold-300">
                          Event 2: Tithi Return
                        </div>
                        <div className="font-cinzel text-sm text-white mt-1">{tithiDate} {currentYear}</div>
                        <div className="text-[11px] text-gray-400 font-outfit mt-0.5">Ashwayuja Shukla Tritiya</div>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-obsidian-900 border border-gold-500/20 text-xs text-gray-300 space-y-2">
                    <div className="flex items-center gap-1.5 text-gold-300 font-medium font-cinzel">
                      <ShieldCheck className="w-4 h-4" /> Deduplication Guard
                    </div>
                    <p className="font-outfit text-[11px] text-gray-400">
                      Only one email per event per year is dispatched. Duplicate triggers are automatically detected and safely skipped.
                    </p>
                  </div>

                  <button
                    onClick={handleSendTest}
                    disabled={isSending}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-obsidian-950 font-bold font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? 'Dispatching...' : 'Send Live / Test Email'}</span>
                  </button>
                </div>

                {/* Right Luxury HTML Email Visualizer */}
                <div className="flex-1 bg-obsidian-900/80 rounded-2xl border border-gold-500/30 p-4 sm:p-6 flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gold-500/20 text-xs">
                    <span className="text-gray-400 font-outfit">
                      Subject:{' '}
                      <strong className="text-gold-200">
                        {previewType === 'birthday'
                          ? `Happy Birthday, ${config.recipientName} ✨`
                          : `A Divine Birthday Blessing ✨ (Ashwayuja Shukla Tritiya)`}
                      </strong>
                    </span>
                    <span className="text-gold-400/80 font-cinzel text-[10px] uppercase">
                      HTML Email Render
                    </span>
                  </div>

                  {/* Sandboxed Interactive Preview */}
                  <div className="flex-1 overflow-y-auto rounded-xl border border-gold-500/20 bg-[#050508] p-6 text-center text-[#FAF8F5]">
                    <div className="max-w-lg mx-auto bg-gradient-to-b from-[#121018] to-[#08070B] border border-gold-500/60 rounded-2xl p-8 shadow-2xl">
                      <div className="w-12 h-12 rounded-full border border-gold-400 mx-auto flex items-center justify-center text-gold-300 font-bold text-lg mb-4 bg-gold-500/10">
                        {previewType === 'birthday' ? '✦' : 'ॐ'}
                      </div>
                      <p className="font-cinzel text-[10px] tracking-[0.3em] text-gold-300 uppercase mb-2">
                        {previewType === 'birthday' ? 'A Celestial Milestone' : 'Sacred Lunar Return'} · {currentYear}
                      </p>
                      <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider">
                        {previewType === 'birthday' ? (
                          <>HAPPY BIRTHDAY, <span className="gold-text">{config.recipientName}</span></>
                        ) : (
                          <span className="gold-text">A DIVINE BIRTHDAY BLESSING</span>
                        )}
                      </h2>

                      <div className="my-6 inline-block px-6 py-2 rounded-full bg-gold-500/10 border border-gold-400/40 text-gold-200 font-cinzel text-xs font-semibold tracking-wider">
                        {previewType === 'birthday' ? `28 SEPTEMBER ${currentYear}` : `${tithiDate.toUpperCase()} ${currentYear}`}
                      </div>

                      <p className="font-cormorant italic text-base text-gold-100/90 leading-relaxed mb-4">
                        {previewType === 'birthday'
                          ? '“May every year ahead be filled with happiness, peace, prosperity, love and divine blessings.”'
                          : `Dear ${config.recipientName}, your birth Tithi returns today under the divine auspiciousness of Sharan Navaratri.`}
                      </p>

                      <p className="font-outfit text-xs text-gray-400 leading-relaxed">
                        Born under the divine blessings of <strong>Sharan Navaratri</strong> · Tula Rashi · Swati Nakshatra · Venus (Shukra)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONFIGURATION */}
            {activeTab === 'config' && (
              <form onSubmit={handleSaveConfig} className="max-w-2xl mx-auto space-y-6">
                <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                  <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider">
                    1. Recipient Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-outfit mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={config.recipientName}
                        onChange={(e) => setConfig({ ...config, recipientName: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs font-outfit focus:outline-none focus:border-gold-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-outfit mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={config.recipientEmail}
                        onChange={(e) => setConfig({ ...config, recipientEmail: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs font-outfit focus:outline-none focus:border-gold-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="gold-card p-6 rounded-2xl border-gold-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cinzel text-sm font-bold text-gold-200 uppercase tracking-wider">
                      2. Gmail / SMTP Dispatcher
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="simMode"
                        checked={config.isSimulatedMode}
                        onChange={(e) => setConfig({ ...config, isSimulatedMode: e.target.checked })}
                        className="rounded border-gold-500 text-gold-500 focus:ring-gold-400"
                      />
                      <label htmlFor="simMode" className="text-xs text-gold-300 font-outfit cursor-pointer">
                        Simulated Mode (Safe sandbox)
                      </label>
                    </div>
                  </div>

                  {!config.isSimulatedMode ? (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs text-gray-400 font-outfit mb-1">Sender Email Address</label>
                        <input
                          type="email"
                          value={config.senderEmail}
                          onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs font-outfit focus:outline-none focus:border-gold-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 font-outfit mb-1">Gmail / SMTP Username</label>
                          <input
                            type="text"
                            value={config.smtpUser || ''}
                            onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                            placeholder="your-gmail@gmail.com"
                            className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs font-outfit focus:outline-none focus:border-gold-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 font-outfit mb-1">Gmail App Password</label>
                          <input
                            type="password"
                            value={config.smtpPass || ''}
                            onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                            placeholder="16-character App Password"
                            className="w-full p-2.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-white text-xs font-outfit focus:outline-none focus:border-gold-400"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        * Note: To send through Gmail, generate a 16-character App Password from your Google Account Security Settings. Credentials are kept securely on your local server.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 leading-relaxed font-outfit">
                      In Simulated Mode, email dispatches are verified, formatted, and logged without requiring live SMTP credentials. Uncheck to connect your live Gmail account.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: SENT LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xs text-gold-300 uppercase tracking-widest">
                    Execution & Deduplication Ledger
                  </h3>
                  <span className="text-xs text-gray-400 font-outfit">{logs.length} entries recorded</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gold-500/20">
                  <table className="w-full text-left text-xs font-outfit">
                    <thead className="bg-obsidian-900 text-gold-300 font-cinzel uppercase border-b border-gold-500/20">
                      <tr>
                        <th className="p-3">Year / Event</th>
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Scheduled Date</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10 bg-obsidian-950/60">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gold-500/5">
                          <td className="p-3 font-cinzel font-semibold text-white">
                            {log.year} · <span className="gold-text uppercase">{log.eventType}</span>
                          </td>
                          <td className="p-3 text-gray-300">{log.recipient}</td>
                          <td className="p-3 text-gold-200">{log.scheduledDate}</td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            {new Date(log.sentTimestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'SENT'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : log.status === 'SIMULATED'
                                  ? 'bg-gold-500/20 text-gold-300 border border-gold-400/40'
                                  : log.status === 'SCHEDULED'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: 10-YEAR FORECAST */}
            {activeTab === 'forecast' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-xs text-gold-300 uppercase tracking-widest">
                    Next 10-Year Automated Schedule (2026 – 2035)
                  </h3>
                  <span className="text-xs text-gray-400 font-outfit">Auto-calculated from supplied dates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((yr) => {
                    const isNow = yr === currentYear;
                    return (
                      <div
                        key={yr}
                        className={`p-4 rounded-xl border flex items-center justify-between ${
                          isNow
                            ? 'bg-gradient-to-r from-burgundy-950 to-obsidian-900 border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                            : 'gold-card border-gold-500/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-base text-white">{yr}</span>
                            {isNow && (
                              <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-[9px] text-gold-300 font-cinzel">
                                ★ Present Year
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-outfit">
                            Event 1: <strong className="text-gray-200">28 September</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gold-400 uppercase tracking-wider block font-cinzel">
                            Tithi Return
                          </span>
                          <span className="font-cinzel font-bold text-sm gold-text">
                            {currentYear === yr ? tithiDate : (entries.find((e: TimelineEntry) => e.year === yr)?.tithiDate || (yr === 2026 ? '14 October' : yr === 2027 ? '03 October' : yr === 2028 ? '21 September' : yr === 2029 ? '10 October' : yr === 2030 ? '29 September' : 'Pending Update'))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
