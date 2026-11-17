import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  X,
  CreditCard,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { formatINR, formatTransactionDateTime } from '../../lib/format';
import { tableRowVariants } from '../../lib/motion';
import DeleteConfirmModal from '../../components/ui/DeleteConfirmModal';

export default function TransactionsPage() {
  const { 
    transactions, 
    categories, 
    deleteTransaction, 
    setEditingTransaction, 
    setIsAddModalOpen,
    exportTransactionsCSV 
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  // Filter & Search states
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sort states
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination state (SRS FR-TRANS-007: pages of 25)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Deletion modal state
  const [txToDelete, setTxToDelete] = useState(null);

  // 300ms Debounce on Search (SRS FR-TRANS-004)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Synchronize URL query param
  useEffect(() => {
    if (initialQuery && initialQuery !== searchInput) {
      setSearchInput(initialQuery);
      setDebouncedSearch(initialQuery);
    }
  }, [initialQuery]);

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search query (case-insensitive on description & category)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(
        (t) => t.category_id === categoryFilter || t.category === categoryFilter
      );
    }

    // Date range filter (SRS BR-10: inclusive)
    if (startDate) {
      result = result.filter((t) => t.transaction_date >= startDate);
    }
    if (endDate) {
      result = result.filter((t) => t.transaction_date <= endDate);
    }

    // Sorting (SRS FR-TRANS-006)
    result.sort((a, b) => {
      if (sortBy === 'amount') {
        const diff = a.amount - b.amount;
        return sortOrder === 'asc' ? diff : -diff;
      } else {
        // Date sort (combining date & time if available)
        const dateA = a.transaction_date + (a.time || '');
        const dateB = b.transaction_date + (b.time || '');
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
    });

    return result;
  }, [transactions, debouncedSearch, typeFilter, categoryFilter, startDate, endDate, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchInput || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="text-xs sm:text-sm text-pulse-text-secondary mt-0.5">
            Manage, filter, and track all your income and expenses.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTransactionsCSV(startDate, endDate)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pulse-card border border-pulse-border text-pulse-text-secondary hover:text-white transition-colors text-xs font-medium"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pulse-accent text-black font-semibold text-sm hover:bg-pulse-accent-hover active:bg-pulse-accent-dark transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-4 space-y-3.5 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-pulse-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-pulse-text-primary placeholder:text-pulse-text-secondary focus:outline-none focus:border-pulse-accent/80 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pulse-text-secondary hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-pulse-text-primary focus:outline-none focus:border-pulse-accent/80 transition-colors"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-pulse-bg border border-pulse-border rounded-xl text-sm text-pulse-text-primary focus:outline-none focus:border-pulse-accent/80 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-2 flex items-center justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full py-2 px-3 text-xs font-semibold text-pulse-negative bg-pulse-negative/10 hover:bg-pulse-negative/20 border border-pulse-negative/30 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-pulse-border/50 text-xs">
          <span className="text-pulse-text-secondary font-medium">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-pulse-bg border border-pulse-border rounded-lg text-pulse-text-primary text-xs focus:outline-none focus:border-pulse-accent"
            />
            <span className="text-pulse-text-secondary">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-pulse-bg border border-pulse-border rounded-lg text-pulse-text-primary text-xs focus:outline-none focus:border-pulse-accent"
            />
          </div>
          <span className="ml-auto text-pulse-text-secondary">
            Showing <strong className="text-white">{filteredTransactions.length}</strong> of{' '}
            <strong className="text-white">{transactions.length}</strong> transactions
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-pulse-border bg-pulse-bg/60 text-xs text-pulse-text-secondary font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSortToggle('date')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Method</th>
                <th 
                  className="py-3.5 px-5 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSortToggle('amount')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pulse-border/50">
              <AnimatePresence>
                {paginatedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <motion.tr
                      key={tx.id}
                      variants={tableRowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      layout
                      className="hover:bg-pulse-bg/40 transition-colors group"
                    >
                      {/* Description */}
                      <td className="py-3.5 px-5 font-medium text-white max-w-xs truncate">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-pulse-accent/20 text-pulse-accent' : 'bg-pulse-negative/20 text-pulse-negative'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <span className="truncate">{tx.description || tx.category}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1F261F] text-pulse-text-primary border border-pulse-border/70">
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-pulse-text-secondary whitespace-nowrap">
                        {formatTransactionDateTime(tx.transaction_date, tx.time)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-xs text-pulse-text-secondary whitespace-nowrap">
                        {tx.payment_method || 'UPI'}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right font-bold tabular-nums whitespace-nowrap">
                        <span className={isIncome ? 'text-pulse-accent' : 'text-white'}>
                          {isIncome ? `+ ${formatINR(tx.amount)}` : `- ${formatINR(tx.amount)}`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            className="p-1.5 text-pulse-text-secondary hover:text-pulse-accent rounded-lg hover:bg-pulse-bg transition-colors"
                            title="Edit Transaction"
                            aria-label="Edit transaction"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 text-pulse-text-secondary hover:text-pulse-negative rounded-lg hover:bg-pulse-bg transition-colors"
                            title="Delete Transaction"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {/* Empty state */}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-pulse-text-secondary">
                    <p className="text-sm font-medium">No transactions found.</p>
                    <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="mt-3 px-3 py-1.5 text-xs text-pulse-accent font-semibold hover:underline"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (FR-TRANS-007) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-pulse-border bg-pulse-bg/40 text-xs">
            <span className="text-pulse-text-secondary">
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-pulse-border text-pulse-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-pulse-border text-pulse-text-secondary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (FR-TRANS-003) */}
      <DeleteConfirmModal
        isOpen={Boolean(txToDelete)}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${txToDelete?.description || txToDelete?.category}" (${txToDelete ? formatINR(txToDelete.amount) : ''})?`}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
}
