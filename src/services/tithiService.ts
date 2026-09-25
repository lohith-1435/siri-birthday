import { supabase, isSupabaseConfigured, type TithiDateRecord, type EmailLogRecord } from '../lib/supabase';

// Verified Initial Dataset through 2030
export const INITIAL_VERIFIED_DATES: Array<Omit<TithiDateRecord, 'id' | 'created_at' | 'updated_at' | 'published_at'>> = [
  { year: 2003, date: '28 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published', notes: 'Birth Year' },
  { year: 2004, date: '16 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2005, date: '06 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2006, date: '25 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2007, date: '14 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2008, date: '02 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2009, date: '21 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2010, date: '11 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2011, date: '29 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2012, date: '18 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2013, date: '07 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2014, date: '26 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2015, date: '15 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2016, date: '04 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2017, date: '23 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2018, date: '12 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2019, date: '01 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2020, date: '19 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2021, date: '08 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2022, date: '28 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2023, date: '17 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2024, date: '05 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2025, date: '24 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2026, date: '14 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published', notes: 'Present Verified Year' },
  { year: 2027, date: '03 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2028, date: '21 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2029, date: '10 October', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published' },
  { year: 2030, date: '29 September', tithi_name: 'Ashwayuja Shukla Tritiya', status: 'published', notes: 'Initial Verified Horizon' },
];

const LOCAL_STORAGE_KEY = 'siri_tithi_dates_v2';
const LOCAL_STORAGE_LOGS_KEY = 'siri_email_logs_v2';

// Helper to get local records
function getLocalRecords(): TithiDateRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read from localStorage:', err);
  }

  // Seed default 2003-2030 records
  const now = new Date().toISOString();
  const seeded: TithiDateRecord[] = INITIAL_VERIFIED_DATES.map((item, index) => ({
    id: `seed-${item.year}-${index}`,
    ...item,
    created_at: now,
    updated_at: now,
    published_at: item.status === 'published' ? now : null,
  }));

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore storage quota
  }
  return seeded;
}

function saveLocalRecords(records: TithiDateRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

function getLocalEmailLogs(): EmailLogRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return [];
}

function saveLocalEmailLogs(logs: EmailLogRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs));
  } catch {
    // Fallback
  }
}

export const tithiService = {
  /**
   * Fetch all PUBLISHED Tithi dates for the public cinematic website
   */
  async getPublishedDates(): Promise<TithiDateRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tithi_dates')
          .select('*')
          .eq('status', 'published')
          .order('year', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as TithiDateRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetch published dates failed, falling back to local store:', err);
      }
    }

    // Local / Offline fallback
    const local = getLocalRecords();
    return local.filter((item) => item.status === 'published').sort((a, b) => a.year - b.year);
  },

  /**
   * Fetch ALL Tithi dates (drafts, published, unpublished) for the Admin Dashboard
   */
  async getAllDatesForAdmin(): Promise<TithiDateRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('tithi_dates')
          .select('*')
          .order('year', { ascending: true });

        if (!error && data) {
          return data as TithiDateRecord[];
        }
      } catch (err) {
        console.warn('Supabase fetch all dates failed, using local store:', err);
      }
    }

    const local = getLocalRecords();
    return local.sort((a, b) => a.year - b.year);
  },

  /**
   * Save (Create or Update) a Tithi date record
   */
  async saveDate(record: {
    id?: string;
    year: number;
    date: string;
    tithi_name?: string;
    status: 'published' | 'draft' | 'unpublished';
    notes?: string;
  }): Promise<{ success: boolean; data?: TithiDateRecord; error?: string }> {
    const now = new Date().toISOString();
    const payload = {
      year: record.year,
      date: record.date.trim(),
      tithi_name: record.tithi_name?.trim() || 'Ashwayuja Shukla Tritiya',
      status: record.status,
      notes: record.notes?.trim() || null,
      updated_at: now,
      published_at: record.status === 'published' ? now : null,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (record.id) {
          const { data, error } = await supabase
            .from('tithi_dates')
            .update(payload)
            .eq('id', record.id)
            .select()
            .single();

          if (error) throw error;
          return { success: true, data: data as TithiDateRecord };
        } else {
          const { data, error } = await supabase
            .from('tithi_dates')
            .insert([{ ...payload, created_at: now }])
            .select()
            .single();

          if (error) throw error;
          return { success: true, data: data as TithiDateRecord };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Supabase save error, writing locally:', message);
      }
    }

    // Local fallback update
    const records = getLocalRecords();
    const existingIndex = records.findIndex((r) => r.year === record.year || (record.id && r.id === record.id));

    let updatedRecord: TithiDateRecord;
    if (existingIndex >= 0) {
      updatedRecord = {
        ...records[existingIndex],
        ...payload,
        notes: payload.notes || undefined,
        updated_at: now,
      };
      records[existingIndex] = updatedRecord;
    } else {
      updatedRecord = {
        id: `local-${Date.now()}`,
        ...payload,
        notes: payload.notes || undefined,
        created_at: now,
      };
      records.push(updatedRecord);
    }

    saveLocalRecords(records);
    return { success: true, data: updatedRecord };
  },

  /**
   * Quick status change (Publish / Unpublish / Draft)
   */
  async setStatus(id: string, year: number, status: 'published' | 'draft' | 'unpublished'): Promise<boolean> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('tithi_dates')
          .update({
            status,
            updated_at: now,
            published_at: status === 'published' ? now : null,
          })
          .eq('id', id);

        if (!error) return true;
      } catch {
        // Fallback
      }
    }

    const records = getLocalRecords();
    const target = records.find((r) => r.id === id || r.year === year);
    if (target) {
      target.status = status;
      target.updated_at = now;
      target.published_at = status === 'published' ? now : null;
      saveLocalRecords(records);
      return true;
    }
    return false;
  },

  /**
   * Delete a Tithi date record
   */
  async deleteDate(id: string, year: number): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('tithi_dates').delete().eq('id', id);
        if (!error) return true;
      } catch {
        // Fallback
      }
    }

    const records = getLocalRecords();
    const filtered = records.filter((r) => r.id !== id && r.year !== year);
    saveLocalRecords(filtered);
    return true;
  },

  /**
   * Email Logs access
   */
  async getEmailLogs(): Promise<EmailLogRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .order('sent_at', { ascending: false });

        if (!error && data) return data as EmailLogRecord[];
      } catch {
        // Fallback
      }
    }
    return getLocalEmailLogs();
  },

  async logEmail(log: Omit<EmailLogRecord, 'id' | 'sent_at'>): Promise<EmailLogRecord> {
    const now = new Date().toISOString();
    const payload = {
      ...log,
      sent_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('email_logs').insert([payload]).select().single();
        if (!error && data) return data as EmailLogRecord;
      } catch {
        // Fallback
      }
    }

    const localLogs = getLocalEmailLogs();
    const newRecord: EmailLogRecord = {
      id: `log-${Date.now()}`,
      ...payload,
    };
    localLogs.unshift(newRecord);
    saveLocalEmailLogs(localLogs);
    return newRecord;
  },

  /**
   * Reset to initial verified seed (2003 - 2030)
   */
  resetToInitialSeed(): TithiDateRecord[] {
    const now = new Date().toISOString();
    const seeded: TithiDateRecord[] = INITIAL_VERIFIED_DATES.map((item, index) => ({
      id: `seed-${item.year}-${index}`,
      ...item,
      created_at: now,
      updated_at: now,
      published_at: item.status === 'published' ? now : null,
    }));
    saveLocalRecords(seeded);
    return seeded;
  },
};
