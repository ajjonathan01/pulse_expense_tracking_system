import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../lib/motion';

export default function DeleteConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDeleting = false }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onCancel}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          variants={modalDialogVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-pulse-card border border-pulse-border rounded-2xl shadow-2xl p-6 z-10"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pulse-negative/20 border border-pulse-negative/30 flex items-center justify-center text-pulse-negative shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-pulse-text-primary">
                {title || 'Confirm Deletion'}
              </h3>
              <p className="text-xs text-pulse-text-secondary mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-sm text-pulse-text-secondary mb-6 leading-relaxed">
            {message || 'Are you sure you want to delete this record?'}
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-pulse-text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pulse-negative text-white font-semibold text-sm hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
