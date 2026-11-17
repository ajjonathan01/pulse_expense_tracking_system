import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_PROFILE, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS 
} from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-url.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage key constants
const STORAGE_KEYS = {
  PROFILE: 'pulse_profile_v1',
  CATEGORIES: 'pulse_categories_v1',
  TRANSACTIONS: 'pulse_transactions_v1',
  BUDGETS: 'pulse_budgets_v1',
  AUTH_SESSION: 'pulse_auth_session_v1',
};

/**
 * Local-First / Supabase-ready Repository
 * Provides reactive local persistence and synchronous/asynchronous data operations.
 */
export const dataStore = {
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  },

  setProfile(profile) {
    const updated = { ...profile, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  setCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories;
  },

  getTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  setTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions;
  },

  getBudgets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
        return INITIAL_BUDGETS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  setBudgets(budgets) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budgets;
  },

  getAuthSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (data) return JSON.parse(data);
      // Default to logged-in user Siddharth
      const defaultSession = {
        user: {
          id: INITIAL_PROFILE.id,
          email: INITIAL_PROFILE.email,
          user_metadata: { display_name: INITIAL_PROFILE.display_name },
        },
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(defaultSession));
      return defaultSession;
    } catch {
      return null;
    }
  },

  setAuthSession(session) {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    }
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },
};
