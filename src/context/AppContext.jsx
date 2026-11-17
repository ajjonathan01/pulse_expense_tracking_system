import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { dataStore } from '../lib/supabase';
import { 
  calculateApplicationBalance, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateMonthlyExpenditure, 
  calculateBudgetUtilisation,
  getMonthDateRange,
  parseMonthKey 
} from '../lib/finance';
import { getISODateString } from '../lib/format';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Session & Profile
  const [session, setSession] = useState(() => dataStore.getAuthSession());
  const [profile, setProfile] = useState(() => dataStore.getProfile());

  // Active Month filter (Defaults to '2025-11' matching the UI screenshot)
  const [selectedMonth, setSelectedMonth] = useState('2025-11');

  // Core Data
  const [transactions, setTransactions] = useState(() => dataStore.getTransactions());
  const [budgets, setBudgets] = useState(() => dataStore.getBudgets());
  const [categories, setCategories] = useState(() => dataStore.getCategories());

  // Global UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [theme, setTheme] = useState(profile.theme || 'dark');

  // Network offline detection (SRS ERR-13)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are currently offline. Local changes will be saved.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // system
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [theme]);

  // Toast dispatch (SRS MOT-11)
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4s (errors persist until dismissed if specified, or 6s)
    const timeout = type === 'error' ? 6000 : 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Profile update (FR-SET-001)
  const updateProfile = useCallback((updates) => {
    const updated = dataStore.setProfile({ ...profile, ...updates });
    setProfile(updated);
    if (updates.theme) setTheme(updates.theme);
    showToast('Profile updated successfully', 'success');
    return updated;
  }, [profile, showToast]);

  // Transaction CRUD (FR-TRANS-001, 002, 003)
  const addTransaction = useCallback((newTxData) => {
    const newTx = {
      id: 'tx_' + Date.now(),
      user_id: profile.id,
      created_at: new Date().toISOString(),
      ...newTxData,
    };
    const updated = [newTx, ...transactions];
    dataStore.setTransactions(updated);
    setTransactions(updated);
    showToast(`${newTx.type === 'income' ? 'Income' : 'Expense'} added successfully`, 'success');
    return newTx;
  }, [profile.id, transactions, showToast]);

  const updateTransaction = useCallback((id, updates) => {
    const updated = transactions.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });
    dataStore.setTransactions(updated);
    setTransactions(updated);
    showToast('Transaction updated successfully', 'success');
  }, [transactions, showToast]);

  const deleteTransaction = useCallback((id) => {
    const updated = transactions.filter((t) => t.id !== id);
    dataStore.setTransactions(updated);
    setTransactions(updated);
    showToast('Transaction deleted', 'info');
  }, [transactions, showToast]);

  // Budget CRUD (FR-BUD-001, 002, 003)
  const addBudget = useCallback((budgetData) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    // Duplicate check per FR-BUD-001
    const exists = budgets.some(
      (b) => b.year === year && b.month === month && (b.category_id || null) === (budgetData.category_id || null)
    );
    if (exists) {
      showToast('A budget for this category and month already exists', 'error');
      return false;
    }

    const newBudget = {
      id: 'bud_' + Date.now(),
      user_id: profile.id,
      year: budgetData.year || year,
      month: budgetData.month || month,
      monthly_limit: Number(budgetData.monthly_limit),
      category_id: budgetData.category_id || null,
      category_name: budgetData.category_name || (budgetData.category_id ? 'Category' : 'Overall Budget'),
      created_at: new Date().toISOString(),
    };
    const updated = [...budgets, newBudget];
    dataStore.setBudgets(updated);
    setBudgets(updated);
    showToast('Budget created successfully', 'success');
    return true;
  }, [selectedMonth, budgets, profile.id, showToast]);

  const updateBudget = useCallback((id, newLimit) => {
    const updated = budgets.map((b) => (b.id === id ? { ...b, monthly_limit: Number(newLimit) } : b));
    dataStore.setBudgets(updated);
    setBudgets(updated);
    showToast('Budget limit updated', 'success');
  }, [budgets, showToast]);

  const deleteBudget = useCallback((id) => {
    const updated = budgets.filter((b) => b.id !== id);
    dataStore.setBudgets(updated);
    setBudgets(updated);
    showToast('Budget deleted', 'info');
  }, [budgets, showToast]);

  // Copy previous month budgets (FR-BUD-006)
  const copyPreviousMonthBudgets = useCallback((targetMonthKey) => {
    const { year, month } = parseMonthKey(targetMonthKey);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevBudgets = budgets.filter((b) => b.year === prevYear && b.month === prevMonth);
    if (prevBudgets.length === 0) {
      showToast('No budgets found in previous month to copy', 'error');
      return false;
    }

    const newBudgets = [...budgets];
    let copiedCount = 0;

    for (const pb of prevBudgets) {
      const alreadyExists = newBudgets.some(
        (b) => b.year === year && b.month === month && (b.category_id || null) === (pb.category_id || null)
      );
      if (!alreadyExists) {
        newBudgets.push({
          ...pb,
          id: 'bud_' + Date.now() + Math.random().toString().slice(2, 6),
          year,
          month,
          created_at: new Date().toISOString(),
        });
        copiedCount++;
      }
    }

    if (copiedCount === 0) {
      showToast('All previous budgets already exist in this month', 'info');
      return false;
    }

    dataStore.setBudgets(newBudgets);
    setBudgets(newBudgets);
    showToast(`Successfully copied ${copiedCount} budget(s) from previous month`, 'success');
    return true;
  }, [budgets, showToast]);

  // Categories CRUD (FR-CAT-001, 002, 003)
  const addCategory = useCallback((catData) => {
    const trimmed = (catData.name || '').trim();
    if (!trimmed || trimmed.length > 30) {
      showToast('Category name must be between 1 and 30 characters', 'error');
      return false;
    }

    const exists = categories.some(
      (c) => c.type === catData.type && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showToast('A category with this name already exists', 'error');
      return false;
    }

    const newCat = {
      id: 'cat_' + Date.now(),
      name: trimmed,
      type: catData.type || 'expense',
      is_system: false,
      color: catData.color || '#B7E477',
      icon: catData.icon || 'Tag',
      created_at: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    dataStore.setCategories(updated);
    setCategories(updated);
    showToast('Category created', 'success');
    return true;
  }, [categories, showToast]);

  const deleteCategory = useCallback((catId) => {
    // Check if category in use (FR-CAT-003)
    const category = categories.find((c) => c.id === catId);
    if (!category) return;

    const inUseInTx = transactions.some((t) => t.category_id === catId || t.category === category.name);
    const inUseInBud = budgets.some((b) => b.category_id === catId);

    if (inUseInTx || inUseInBud) {
      showToast('Cannot delete category: it is currently used by existing transactions or budgets. Reassign them first.', 'error');
      return false;
    }

    const updated = categories.filter((c) => c.id !== catId);
    dataStore.setCategories(updated);
    setCategories(updated);
    showToast('Category deleted', 'info');
    return true;
  }, [categories, transactions, budgets, showToast]);

  // CSV Export (FR-SET-004)
  const exportTransactionsCSV = useCallback((startDate = null, endDate = null) => {
    let rows = transactions;
    if (startDate) rows = rows.filter((t) => t.transaction_date >= startDate);
    if (endDate) rows = rows.filter((t) => t.transaction_date <= endDate);

    if (rows.length === 0) {
      showToast('No transactions found in selected date range to export', 'warning');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Description'];
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => [
        `"${r.id}"`,
        `"${r.transaction_date}"`,
        `"${r.type}"`,
        `"${(r.category || '').replace(/"/g, '""')}"`,
        r.amount,
        `"${r.payment_method}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
      ].join(',')),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pulse_transactions_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} transactions as CSV`, 'success');
  }, [transactions, showToast]);

  // Calculated In-App Budget Warnings (Assumption A-06)
  const budgetWarnings = useMemo(() => {
    const { year, month } = parseMonthKey(selectedMonth);
    const currentMonthBudgets = budgets.filter((b) => b.year === year && b.month === month);
    const { startDate, endDate } = getMonthDateRange(year, month);

    const warnings = [];

    // Overall budget check
    const overall = currentMonthBudgets.find((b) => !b.category_id);
    if (overall) {
      const monthSpent = calculateMonthlyExpenditure(transactions, selectedMonth);
      const { percentage, status } = calculateBudgetUtilisation(monthSpent, overall.monthly_limit);
      if (status === 'exceeded') {
        warnings.push({
          id: 'warn_overall',
          title: 'Overall Budget Exceeded!',
          message: `You have spent ${percentage}% of your monthly budget (₹${monthSpent.toLocaleString('en-IN')} of ₹${overall.monthly_limit.toLocaleString('en-IN')}).`,
          level: 'exceeded',
        });
      } else if (status === 'warning') {
        warnings.push({
          id: 'warn_overall',
          title: 'Overall Budget Warning',
          message: `You have reached ${percentage}% of your monthly budget.`,
          level: 'warning',
        });
      }
    }

    // Category budget checks
    const categoryBudgets = currentMonthBudgets.filter((b) => Boolean(b.category_id));
    for (const cb of categoryBudgets) {
      const catSpent = transactions
        .filter((t) => t.type === 'expense' && t.transaction_date >= startDate && t.transaction_date <= endDate && (t.category_id === cb.category_id || t.category === cb.category_name))
        .reduce((sum, t) => sum + t.amount, 0);

      const { percentage, status } = calculateBudgetUtilisation(catSpent, cb.monthly_limit);
      if (status === 'exceeded') {
        warnings.push({
          id: `warn_cat_${cb.id}`,
          title: `${cb.category_name} Limit Exceeded!`,
          message: `Spent ₹${catSpent.toLocaleString('en-IN')} of ₹${cb.monthly_limit.toLocaleString('en-IN')} (${percentage}%).`,
          level: 'exceeded',
        });
      } else if (status === 'warning') {
        warnings.push({
          id: `warn_cat_${cb.id}`,
          title: `${cb.category_name} Near Limit`,
          message: `Utilisation is at ${percentage}%.`,
          level: 'warning',
        });
      }
    }

    return warnings;
  }, [selectedMonth, budgets, transactions]);

  // Auth logout / login
  const logout = useCallback(() => {
    dataStore.setAuthSession(null);
    setSession(null);
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  const login = useCallback((email, displayName = 'Siddharth') => {
    const newSession = {
      user: {
        id: profile.id,
        email,
        user_metadata: { display_name: displayName },
      },
    };
    dataStore.setAuthSession(newSession);
    setSession(newSession);
    showToast(`Welcome back, ${displayName}!`, 'success');
  }, [profile.id, showToast]);

  const value = {
    session,
    profile,
    updateProfile,
    login,
    logout,
    selectedMonth,
    setSelectedMonth,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    copyPreviousMonthBudgets,
    categories,
    addCategory,
    deleteCategory,
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    toasts,
    showToast,
    dismissToast,
    isOnline,
    theme,
    setTheme,
    budgetWarnings,
    exportTransactionsCSV,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
