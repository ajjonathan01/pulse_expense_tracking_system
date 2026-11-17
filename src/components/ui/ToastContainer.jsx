import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toastVariants } from '../../lib/motion';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';

          return (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-card border backdrop-blur-md text-sm ${
                isError
                  ? 'bg-[#2A1818] border-pulse-negative/50 text-[#FCE8E8]'
                  : isWarning
                  ? 'bg-[#2A2315] border-pulse-warning/50 text-[#FEF3C7]'
                  : isInfo
                  ? 'bg-[#18232F] border-pulse-info/50 text-[#E0F2FE]'
                  : 'bg-[#172217] border-pulse-positive/50 text-[#E8F8F0]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isError && <AlertCircle className="w-5 h-5 text-pulse-negative" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-pulse-warning" />}
                {isInfo && <Info className="w-5 h-5 text-pulse-info" />}
                {!isError && !isWarning && !isInfo && (
                  <CheckCircle2 className="w-5 h-5 text-pulse-positive" />
                )}
              </div>

              <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-white/50 hover:text-white transition-colors p-0.5 rounded"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
