import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  PieChart,
  ArrowRight
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { formatINR, formatMonthName } from '../../lib/format';
import { 
  calculateMonthlyExpenditure, 
  calculateBudgetUtilisation, 
  getMonthDateRange, 
  parseMonthKey 
} from '../../lib/finance';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';

export default function BudgetsPage() {
  const { 
    selectedMonth, 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    copyPreviousMonthBudgets, 
    transactions, 
    categories 
  } = useApp();

  const { year, month } = parseMonthKey(selectedMonth);
  const { startDate, endDate } = getMonthDateRange(year, month);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Form states
  const [categoryId, setCategoryId] = useState(''); // empty = overall budget
  const [limit, setLimit] = useState('');
  const [formError, setFormError] = useState('');

  // Current month's budgets
  const monthBudgets = useMemo(() => {
    return budgets.filter((b) => b.year === year && b.month === month);
  }, [budgets, year, month]);

  // Overall budget for the month
  const overallBudget = useMemo(() => {
    return monthBudgets.find((b) => !b.category_id);
  }, [monthBudgets]);

  const totalMonthSpent = useMemo(() => {
    return calculateMonthlyExpenditure(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const overallUtil = useMemo(() => {
    if (!overallBudget) return null;
    return calculateBudgetUtilisation(totalMonthSpent, overallBudget.monthly_limit);
  }, [totalMonthSpent, overallBudget]);

  // Category budgets enriched with real spending
  const categoryBudgets = useMemo(() => {
    return monthBudgets
      .filter((b) => Boolean(b.category_id))
      .map((b) => {
        const spent = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.transaction_date >= startDate &&
              t.transaction_date <= endDate &&
              (t.category_id === b.category_id || t.category === b.category_name)
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const util = calculateBudgetUtilisation(spent, b.monthly_limit);
        return {
          ...b,
          spent,
          util,
        };
      });
  }, [monthBudgets, transactions, startDate, endDate]);

  // Check Assumption A-11: Category budgets sum above overall budget warning
  const sumCategoryLimits = useMemo(() => {
    return categoryBudgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  }, [categoryBudgets]);

  const hasExceededOverallLimitAllocation = 
    overallBudget && sumCategoryLimits > overallBudget.monthly_limit;

  const openCreateModal = () => {
    setEditingBudget(null);
    setCategoryId('');
    setLimit('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setCategoryId(budget.category_id || '');
    setLimit(String(budget.monthly_limit));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const numLimit = Number(limit);
    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      setFormError('Please enter a valid budget limit greater than ₹0');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, numLimit);
      setIsModalOpen(false);
    } else {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const catName = selectedCat ? selectedCat.name : 'Overall Budget';

      const success = addBudget({
        category_id: categoryId || null,
        category_name: catName,
        monthly_limit: numLimit,
        year,
        month,
      });
      if (success) setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Budgets for {formatMonthName(selectedMonth)}
          </h1>
          <p className="text-xs sm:text-sm text-pulse-text-secondary mt-0.5">
            Set and track monthly spending targets across categories.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => copyPreviousMonthBudgets(selectedMonth)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pulse-card border border-pulse-border text-pulse-text-secondary hover:text-white transition-colors text-xs font-medium"
            title="Copy from previous month"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Previous Month</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pulse-accent text-black font-semibold text-sm hover:bg-pulse-accent-hover active:bg-pulse-accent-dark transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Allocation Warning Banner (SRS Assumption A-11) */}
      {hasExceededOverallLimitAllocation && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-pulse-warning/15 border border-pulse-warning/30 text-pulse-warning text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong>Budget Allocation Warning:</strong> Total allocated to categories (
            {formatINR(sumCategoryLimits)}) exceeds your overall monthly budget (
            {formatINR(overallBudget.monthly_limit)}).
          </div>
        </div>
      )}

      {/* Overall Month Budget Card */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center text-pulse-accent">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Overall Monthly Budget</h2>
              <p className="text-xs text-pulse-text-secondary">Total spending limit across all categories</p>
            </div>
          </div>

          {overallBudget && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(overallBudget)}
                className="p-1.5 text-pulse-text-secondary hover:text-white rounded-lg hover:bg-pulse-bg transition-colors"
                title="Edit Limit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBudgetToDelete(overallBudget)}
                className="p-1.5 text-pulse-text-secondary hover:text-pulse-negative rounded-lg hover:bg-pulse-bg transition-colors"
                title="Delete Budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {overallBudget ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-pulse-bg/50 border border-pulse-border">
              <div>
                <span className="text-xs text-pulse-text-secondary">Monthly Limit</span>
                <p className="text-lg font-bold text-white tabular-nums">
                  {formatINR(overallBudget.monthly_limit)}
                </p>
              </div>
              <div>
                <span className="text-xs text-pulse-text-secondary">Total Spent</span>
                <p className="text-lg font-bold text-white tabular-nums">
                  {formatINR(totalMonthSpent)}
                </p>
              </div>
              <div>
                <span className="text-xs text-pulse-text-secondary">Remaining</span>
                <p
                  className={`text-lg font-bold tabular-nums ${
                    overallUtil?.remaining < 0 ? 'text-pulse-negative' : 'text-pulse-accent'
                  }`}
                >
                  {formatINR(overallUtil?.remaining)}
                </p>
              </div>
            </div>

            {/* Progress bar with threshold indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-pulse-text-secondary">
                  Utilisation: <strong className="text-white">{overallUtil?.percentage}%</strong>
                </span>
                {/* Threshold badge (FR-BUD-005: never color alone) */}
                {overallUtil?.status === 'exceeded' && (
                  <span className="flex items-center gap-1 text-pulse-negative font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeded Limit
                  </span>
                )}
                {overallUtil?.status === 'warning' && (
                  <span className="flex items-center gap-1 text-pulse-warning font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warning (≥80%)
                  </span>
                )}
                {overallUtil?.status === 'normal' && (
                  <span className="flex items-center gap-1 text-pulse-positive font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                  </span>
                )}
              </div>
              <div className="w-full bg-[#111411] h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallUtil?.status === 'exceeded'
                      ? 'bg-pulse-negative'
                      : overallUtil?.status === 'warning'
                      ? 'bg-pulse-warning'
                      : 'bg-pulse-accent'
                  }`}
                  style={{ width: `${overallUtil?.cappedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-pulse-text-secondary">
            <p className="text-sm">No overall monthly budget set for this month.</p>
            <button
              onClick={openCreateModal}
              className="mt-2 text-xs font-semibold text-pulse-accent hover:underline"
            >
              Set Overall Budget Now
            </button>
          </div>
        )}
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Category Budgets</h2>

        {categoryBudgets.length === 0 ? (
          <div className="p-8 text-center bg-pulse-card border border-pulse-border rounded-2xl text-pulse-text-secondary">
            <PieChart className="w-10 h-10 mx-auto text-pulse-text-secondary/60 mb-2" />
            <p className="text-sm font-medium">No category budgets created for this month.</p>
            <p className="text-xs mt-1">Break down your budget into Food, Transport, Entertainment, etc.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-pulse-accent text-black font-semibold rounded-xl text-xs"
            >
              + Add Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgets.map((cb) => (
              <div
                key={cb.id}
                className="bg-pulse-card border border-pulse-border rounded-2xl p-5 shadow-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-pulse-accent" />
                    <h3 className="font-semibold text-white text-sm">{cb.category_name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(cb)}
                      className="p-1 text-pulse-text-secondary hover:text-white rounded hover:bg-pulse-bg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBudgetToDelete(cb)}
                      className="p-1 text-pulse-text-secondary hover:text-pulse-negative rounded hover:bg-pulse-bg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-pulse-text-secondary">
                    Spent: <strong className="text-white tabular-nums">{formatINR(cb.spent)}</strong>
                  </span>
                  <span className="text-pulse-text-secondary">
                    Limit: <strong className="text-white tabular-nums">{formatINR(cb.monthly_limit)}</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-[#111411] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cb.util.status === 'exceeded'
                          ? 'bg-pulse-negative'
                          : cb.util.status === 'warning'
                          ? 'bg-pulse-warning'
                          : 'bg-pulse-accent'
                      }`}
                      style={{ width: `${cb.util.cappedPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-pulse-text-secondary font-medium">
                      {cb.util.percentage}% used
                    </span>
                    {/* Status badge */}
                    {cb.util.status === 'exceeded' && (
                      <span className="flex items-center gap-1 text-pulse-negative font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Exceeded (+{formatINR(cb.spent - cb.monthly_limit)})
                      </span>
                    )}
                    {cb.util.status === 'warning' && (
                      <span className="flex items-center gap-1 text-pulse-warning font-semibold">
                        <AlertTriangle className="w-3 h-3" /> Warning (≥80%)
                      </span>
                    )}
                    {cb.util.status === 'normal' && (
                      <span className="text-pulse-text-secondary">
                        Remaining: {formatINR(cb.util.remaining)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-md bg-pulse-card border border-pulse-border rounded-2xl shadow-2xl p-6 z-10">
              <div className="flex items-center justify-between pb-4 border-b border-pulse-border mb-4">
                <h3 className="text-base font-semibold text-white">
                  {editingBudget ? 'Edit Budget' : 'Create Budget'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-pulse-text-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {!editingBudget && (
                  <div>
                    <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                      Scope / Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-pulse-text-primary focus:outline-none"
                    >
                      <option value="">Overall Monthly Budget (No Category)</option>
                      {categories
                        .filter((c) => c.type === 'expense')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                    Monthly Limit (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pulse-text-secondary">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 5000"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-sm text-pulse-text-primary focus:outline-none"
                      required
                    />
                  </div>
                  {formError && (
                    <p className="mt-1.5 text-xs text-pulse-negative">{formError}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-pulse-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-pulse-text-secondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-pulse-accent text-black font-semibold text-sm rounded-xl hover:bg-pulse-accent-hover transition-colors"
                  >
                    {editingBudget ? 'Save Changes' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(budgetToDelete)}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for "${budgetToDelete?.category_name}"? Existing transactions will remain untouched.`}
        onConfirm={() => {
          if (budgetToDelete) {
            deleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }
        }}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
}
