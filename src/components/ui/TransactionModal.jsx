import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Tag, CreditCard, AlignLeft, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { modalBackdropVariants, modalDialogVariants } from '../../lib/motion';
import { getISODateString } from '../../lib/format';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

export default function TransactionModal() {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    editingTransaction, 
    setEditingTransaction,
    categories,
    addTransaction,
    updateTransaction,
  } = useApp();

  const isOpen = isAddModalOpen || Boolean(editingTransaction);

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getISODateString());
  const [time, setTime] = useState('12:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opening or editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
      setCategoryId(editingTransaction.category_id || '');
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.transaction_date || getISODateString());
      setTime(editingTransaction.time || '12:00 PM');
      setPaymentMethod(editingTransaction.payment_method || 'UPI');
      setErrors({});
    } else if (isOpen) {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setDescription('');
      setDate(getISODateString());
      
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);

      setPaymentMethod('UPI');
      setErrors({});
    }
  }, [editingTransaction, isOpen]);

  // Set default category for chosen type if none selected
  useEffect(() => {
    const available = categories.filter((c) => c.type === type);
    if (available.length > 0 && !available.some((c) => c.id === categoryId)) {
      setCategoryId(available[0].id);
    }
  }, [type, categories, categoryId]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    // VR-01: Type required
    if (!type || (type !== 'income' && type !== 'expense')) {
      newErrors.type = 'Type must be income or expense';
    }

    // VR-02: Amount required, numeric, > 0 and <= 99,999,999.99, max 2 decimals
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Amount is required';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Enter an amount greater than 0';
    } else if (numAmount > 99999999.99) {
      newErrors.amount = 'Amount exceeds maximum allowed limit';
    } else {
      const decimals = amount.toString().split('.')[1];
      if (decimals && decimals.length > 2) {
        newErrors.amount = 'Enter a valid amount, up to 2 decimals';
      }
    }

    // VR-03: Category required
    if (!categoryId) {
      newErrors.category = 'Category is required';
    }

    // VR-04: Description optional, max 140 chars
    if (description && description.length > 140) {
      newErrors.description = 'Description cannot exceed 140 characters';
    }

    // VR-05: Date required, not earlier than 2000-01-01, max 1 year ahead
    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const d = new Date(date);
      const minDate = new Date('2000-01-01');
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);

      if (d < minDate) {
        newErrors.date = 'Date cannot be earlier than Jan 1, 2000';
      } else if (d > maxDate) {
        newErrors.date = 'Date cannot be more than 1 year in the future';
      }
    }

    // VR-06: Payment method required
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const catName = selectedCat ? selectedCat.name : (type === 'income' ? 'Allowance' : 'Food & Dining');

      const payload = {
        type,
        amount: Number(Number(amount).toFixed(2)),
        category: catName,
        category_id: categoryId,
        description: description.trim() || catName,
        transaction_date: date,
        time,
        payment_method: paymentMethod,
      };

      if (editingTransaction) {
        updateTransaction(editingTransaction.id, payload);
      } else {
        addTransaction(payload);
      }

      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            variants={modalDialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-pulse-card border border-pulse-border rounded-2xl shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pulse-border">
              <h2 id="modal-title" className="text-lg font-semibold text-pulse-text-primary">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={closeModal}
                className="text-pulse-text-secondary hover:text-white transition-colors p-1 rounded-lg"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Switcher (Income / Expense) */}
              <div>
                <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-pulse-bg rounded-xl border border-pulse-border">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === 'expense'
                        ? 'bg-pulse-negative text-black shadow-md'
                        : 'text-pulse-text-secondary hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                      type === 'income'
                        ? 'bg-pulse-accent text-black shadow-md'
                        : 'text-pulse-text-secondary hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="tx-amount" className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                  Amount (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pulse-text-secondary text-base font-medium">
                    ₹
                  </span>
                  <input
                    id="tx-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-pulse-text-primary text-base tabular-nums focus:outline-none focus:ring-1 focus:ring-pulse-accent transition-all"
                    required
                  />
                </div>
                {/* Reserved space error (MOT-15) */}
                <div className="min-h-[20px] mt-1 text-xs text-pulse-negative">
                  {errors.amount}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-pulse-bg/50 rounded-xl border border-pulse-border">
                  {filteredCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-left truncate transition-all ${
                          isSelected
                            ? 'bg-pulse-accent/20 border border-pulse-accent text-pulse-accent'
                            : 'bg-pulse-card border border-transparent text-pulse-text-secondary hover:text-white hover:border-pulse-border'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#B7E477' }} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="min-h-[20px] mt-1 text-xs text-pulse-negative">
                  {errors.category}
                </div>
              </div>

              {/* Date & Payment Method Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tx-date" className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      id="tx-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-pulse-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-pulse-accent transition-all"
                      required
                    />
                  </div>
                  <div className="min-h-[20px] mt-1 text-xs text-pulse-negative">
                    {errors.date}
                  </div>
                </div>

                <div>
                  <label htmlFor="tx-payment" className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    id="tx-payment"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-pulse-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-pulse-accent transition-all"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <div className="min-h-[20px] mt-1 text-xs text-pulse-negative">
                    {errors.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="tx-desc" className="block text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-1.5">
                  Description / Note (Optional, max 140 chars)
                </label>
                <input
                  id="tx-desc"
                  type="text"
                  maxLength={140}
                  placeholder="e.g. Grocery shopping, Metro recharge"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-pulse-bg border border-pulse-border focus:border-pulse-accent rounded-xl text-pulse-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-pulse-accent transition-all"
                />
                <div className="flex justify-between items-center min-h-[20px] mt-1 text-xs">
                  <span className="text-pulse-negative">{errors.description}</span>
                  <span className="text-pulse-text-secondary">{description.length}/140</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pulse-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-pulse-text-secondary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pulse-accent text-black font-semibold text-sm hover:bg-pulse-accent-hover active:bg-pulse-accent-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingTransaction ? 'Save Changes' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
