import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import AppShell from './components/layout/AppShell';
import OverviewPage from './features/dashboard/OverviewPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import BudgetsPage from './features/budgets/BudgetsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import SettingsPage from './features/settings/SettingsPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

import TransactionModal from './components/ui/TransactionModal';
import ToastContainer from './components/ui/ToastContainer';

// Protected Route Guard (SRS 8.9 & FR-AUTH-003)
function ProtectedRoute({ children }) {
  const { session } = useApp();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global Modals & Notifications */}
      <TransactionModal />
      <ToastContainer />
    </>
  );
}
