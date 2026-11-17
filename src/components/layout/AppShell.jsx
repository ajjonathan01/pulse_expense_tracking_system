import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ArrowLeftRight, 
  Target, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Calendar, 
  Plus, 
  ChevronDown, 
  Activity, 
  TrendingUp, 
  LogOut,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMonthName } from '../../lib/format';

export default function AppShell({ children }) {
  const { 
    profile, 
    selectedMonth, 
    setSelectedMonth, 
    setIsAddModalOpen, 
    theme, 
    setTheme, 
    logout, 
    budgetWarnings,
    isOnline 
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const monthRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setIsMonthPickerOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header search navigates to /transactions with query applied (SRS Section 4.4)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/transactions');
    }
  };

  const navItems = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Available months for selector
  const availableMonths = [
    '2025-11',
    '2025-10',
    '2025-09',
    '2025-08',
    '2025-07',
    '2025-06',
  ];

  return (
    <div className="min-h-screen bg-pulse-bg text-pulse-text-primary flex flex-col md:flex-row antialiased">
      {/* Offline Banner (SRS ERR-13) */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-pulse-warning text-black text-xs font-semibold py-1.5 px-4 text-center">
          You are offline. Transactions will be saved locally and synced once reconnected.
        </div>
      )}

      {/* Desktop Left Sidebar (≈240px, SRS 4.2) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-pulse-sidebar border-r border-pulse-border p-5 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Logo & Nav */}
        <div className="space-y-7">
          {/* Brand Logo matching the UI image */}
          <div className="flex items-center gap-2.5 px-2 pt-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-pulse-accent">
              {/* Custom pulse wave icon matching "-/ \-" */}
              <svg 
                className="w-7 h-7 text-pulse-accent stroke-current" 
                viewBox="0 0 24 24" 
                fill="none" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M2 12h4l3-7 4 14 3-7h6" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              PULSE<span className="text-pulse-accent">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all relative ${
                    isActive
                      ? 'bg-pulse-accent text-black font-semibold shadow-accent-glow'
                      : 'text-pulse-text-secondary hover:text-white hover:bg-pulse-card/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black stroke-[2.5]' : 'text-pulse-text-secondary'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Encouragement Widget & User Account */}
        <div className="space-y-4 pt-4 border-t border-pulse-border/70">
          {/* Mini progress card matching the UI image */}
          <div className="p-3.5 rounded-xl bg-pulse-card/80 border border-pulse-border/60">
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart3 className="w-4 h-4 text-pulse-accent" />
              <span className="text-xs font-semibold text-white">Keep going!</span>
            </div>
            <p className="text-[11px] text-pulse-text-secondary mb-2.5">
              You're on track this month.
            </p>
            <div className="w-full bg-[#111411] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-pulse-accent h-full rounded-full transition-all duration-500"
                style={{ width: '47.7%' }}
              />
            </div>
          </div>

          {/* User profile dropdown trigger */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-pulse-card/60 transition-colors text-left"
              aria-label="User account menu"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#273027] border border-pulse-border flex items-center justify-center font-semibold text-xs text-pulse-text-primary shrink-0">
                  {profile.display_name ? profile.display_name[0].toUpperCase() : 'S'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">
                    {profile.display_name || 'Siddharth'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-pulse-text-secondary shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-pulse-card border border-pulse-border rounded-xl shadow-xl py-1.5 z-40 text-sm">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-pulse-text-secondary hover:text-white hover:bg-pulse-bg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings & Profile
                </button>
                <button
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-pulse-text-secondary hover:text-white hover:bg-pulse-bg transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
                <div className="h-px bg-pulse-border my-1" />
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-pulse-negative hover:bg-pulse-bg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Header Bar (≈64px, SRS 4.2) */}
        <header className="h-16 border-b border-pulse-border bg-pulse-bg/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Mobile Brand / Logo & Desktop Search */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2">
              <svg 
                className="w-6 h-6 text-pulse-accent stroke-current" 
                viewBox="0 0 24 24" 
                fill="none" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M2 12h4l3-7 4 14 3-7h6" />
              </svg>
              <span className="text-base font-bold text-white">PULSE.</span>
            </div>

            {/* Search Input Bar (matching reference image) */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-pulse-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-pulse-card border border-pulse-border rounded-full text-xs sm:text-sm text-pulse-text-primary placeholder:text-pulse-text-secondary focus:outline-none focus:border-pulse-accent/80 transition-colors"
              />
            </form>
          </div>

          {/* Right Controls: Notifications, Theme, Month Selector, + Add Transaction */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Notification Bell (SRS Assumption A-06: budget warnings) */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full hover:bg-pulse-card text-pulse-text-secondary hover:text-white transition-colors"
                aria-label="Budget Notifications"
              >
                <Bell className="w-5 h-5" />
                {budgetWarnings.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-pulse-negative border-2 border-pulse-bg" />
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-pulse-card border border-pulse-border rounded-2xl shadow-2xl p-4 z-50 text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-pulse-border mb-3">
                    <span className="font-semibold text-white">Budget Alerts</span>
                    <span className="text-xs text-pulse-text-secondary">{budgetWarnings.length} active</span>
                  </div>
                  {budgetWarnings.length === 0 ? (
                    <p className="text-xs text-pulse-text-secondary py-3 text-center">
                      No active budget warnings. All spending is within limits!
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {budgetWarnings.map((w) => (
                        <div
                          key={w.id}
                          className={`p-2.5 rounded-xl text-xs border ${
                            w.level === 'exceeded'
                              ? 'bg-pulse-negative/10 border-pulse-negative/30 text-pulse-negative'
                              : 'bg-pulse-warning/10 border-pulse-warning/30 text-pulse-warning'
                          }`}
                        >
                          <div className="font-semibold mb-0.5">{w.title}</div>
                          <div className="text-pulse-text-primary/90">{w.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle (Moon / Sun) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-pulse-card text-pulse-text-secondary hover:text-white transition-colors"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Month Selector Dropdown Button (matching UI screenshot) */}
            <div className="relative" ref={monthRef}>
              <button
                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-pulse-card border border-pulse-border rounded-xl text-xs sm:text-sm font-medium text-pulse-text-primary hover:border-pulse-text-secondary/50 transition-colors"
                aria-label="Select month"
              >
                <Calendar className="w-4 h-4 text-pulse-text-secondary" />
                <span>{formatMonthName(selectedMonth)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-pulse-text-secondary" />
              </button>

              {/* Month Dropdown List */}
              {isMonthPickerOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-pulse-card border border-pulse-border rounded-xl shadow-xl py-1.5 z-50 text-sm">
                  {availableMonths.map((mKey) => (
                    <button
                      key={mKey}
                      onClick={() => {
                        setSelectedMonth(mKey);
                        setIsMonthPickerOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                        selectedMonth === mKey
                          ? 'bg-pulse-accent/20 text-pulse-accent font-semibold'
                          : 'text-pulse-text-secondary hover:text-white hover:bg-pulse-bg'
                      }`}
                    >
                      {formatMonthName(mKey)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* + Add Transaction Button (Electric Lime, matching UI image) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-pulse-accent text-black font-semibold text-xs sm:text-sm hover:bg-pulse-accent-hover active:bg-pulse-accent-dark transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add Transaction</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (SRS 4.2: 5 items, touch targets >= 44x44px) */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-pulse-sidebar border-t border-pulse-border z-40 flex items-center justify-around px-2"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[10px] font-medium transition-all ${
                isActive ? 'text-pulse-accent' : 'text-pulse-text-secondary hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
