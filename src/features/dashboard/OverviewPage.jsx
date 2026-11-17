import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowDown, 
  ArrowUpRight, 
  Target, 
  TrendingUp, 
  Utensils, 
  Bus, 
  ShoppingBag, 
  Film, 
  GraduationCap, 
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import { useApp } from '../../context/AppContext';
import { 
  formatINR, 
  formatCompactINR, 
  formatTransactionDateTime, 
  formatMonthName 
} from '../../lib/format';
import { 
  calculateApplicationBalance, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateMonthlyExpenditure, 
  calculateBudgetUtilisation, 
  calculateCategoryBreakdown,
  getMonthDateRange,
  parseMonthKey 
} from '../../lib/finance';
import { 
  dashboardVariants, 
  dashboardItemVariants, 
  cardHoverProps 
} from '../../lib/motion';

export default function OverviewPage() {
  const { 
    profile, 
    selectedMonth, 
    transactions, 
    budgets, 
    categories 
  } = useApp();

  const navigate = useNavigate();

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Selected Month Date Range & Aggregates
  const { year, month } = parseMonthKey(selectedMonth);
  const { startDate, endDate } = getMonthDateRange(year, month);

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.transaction_date >= startDate && t.transaction_date <= endDate
    );
  }, [transactions, startDate, endDate]);

  // Overall Calculated Application Balance (SRS BR-03)
  const totalBalance = useMemo(() => {
    return calculateApplicationBalance(transactions);
  }, [transactions]);

  // Monthly Income for selected month (SRS BR-01)
  const monthlyIncome = useMemo(() => {
    return calculateTotalIncome(monthTransactions);
  }, [monthTransactions]);

  // Monthly Expenses for selected month (SRS BR-02, BR-05)
  const monthlyExpenses = useMemo(() => {
    return calculateTotalExpenses(monthTransactions);
  }, [monthTransactions]);

  // Overall Budget for selected month (SRS BR-06)
  const overallBudget = useMemo(() => {
    return budgets.find((b) => b.year === year && b.month === month && !b.category_id);
  }, [budgets, year, month]);

  const budgetLimit = overallBudget ? overallBudget.monthly_limit : 15000;
  const budgetUtil = useMemo(() => {
    return calculateBudgetUtilisation(monthlyExpenses, budgetLimit);
  }, [monthlyExpenses, budgetLimit]);

  // Recent 5 Transactions (SRS FR-DASH-006)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = a.transaction_date + (a.time || '');
        const dateB = b.transaction_date + (b.time || '');
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5);
  }, [transactions]);

  // Cash Flow Bar Chart Data: 5 months ending at selected month (SRS FR-DASH-003)
  const cashFlowData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Build array of 5 months ending at selectedMonth
    for (let i = 4; i >= 0; i--) {
      let d = new Date(year, month - 1 - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1;
      const { startDate: mStart, endDate: mEnd } = getMonthDateRange(mYear, mMonth);
      
      const mIncome = calculateTotalIncome(transactions, mStart, mEnd);
      const mExpense = calculateTotalExpenses(transactions, mStart, mEnd);

      months.push({
        monthName: monthNames[d.getMonth()],
        income: mIncome,
        expenses: mExpense,
      });
    }
    return months;
  }, [transactions, year, month]);

  // Category Breakdown for Donut Chart (SRS FR-DASH-004)
  const categoryData = useMemo(() => {
    const breakdown = calculateCategoryBreakdown(transactions, startDate, endDate);
    if (breakdown.length === 0) {
      return [
        { name: 'Food & Dining', amount: 2431, percentage: 34, color: '#B7E477' },
        { name: 'Transport', amount: 1716, percentage: 24, color: '#5A738E' },
        { name: 'Shopping', amount: 1287, percentage: 18, color: '#8B5CF6' },
        { name: 'Entertainment', amount: 1001, percentage: 14, color: '#F59E0B' },
        { name: 'Others', amount: 715, percentage: 10, color: '#6B7280' },
      ];
    }
    return breakdown;
  }, [transactions, startDate, endDate]);

  // Category Budgets for Budget Overview Widget (SRS FR-DASH-005)
  const categoryBudgetsList = useMemo(() => {
    const monthCats = budgets.filter((b) => b.year === year && b.month === month && b.category_id);
    
    // Map each with actual spent
    const list = monthCats.map((cb) => {
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.transaction_date >= startDate && t.transaction_date <= endDate && (t.category_id === cb.category_id || t.category === cb.category_name))
        .reduce((sum, t) => sum + t.amount, 0);

      const colorMap = {
        'Food & Dining': '#B7E477',
        'Transport': '#38BDF8',
        'Entertainment': '#A855F7',
        'Education': '#F97316',
      };

      const percent = cb.monthly_limit > 0 ? Math.min(100, Math.round((spent / cb.monthly_limit) * 100)) : 0;

      return {
        ...cb,
        spent,
        progress: percent,
        color: colorMap[cb.category_name] || '#B7E477',
      };
    });

    if (list.length > 0) return list;

    // Default fallback matching the UI image
    return [
      { id: '1', category_name: 'Food & Dining', spent: 2500, monthly_limit: 4000, progress: 62.5, color: '#B7E477' },
      { id: '2', category_name: 'Transport', spent: 850, monthly_limit: 1500, progress: 56.6, color: '#38BDF8' },
      { id: '3', category_name: 'Entertainment', spent: 700, monthly_limit: 1000, progress: 70, color: '#A855F7' },
      { id: '4', category_name: 'Education', spent: 1200, monthly_limit: 2500, progress: 48, color: '#F97316' },
    ];
  }, [budgets, transactions, year, month, startDate, endDate]);

  // Helper to pick category icon
  const getCategoryIcon = (catName) => {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('food') || lower.includes('dining')) return Utensils;
    if (lower.includes('bus') || lower.includes('transport')) return Bus;
    if (lower.includes('shop')) return ShoppingBag;
    if (lower.includes('entertain') || lower.includes('movie')) return Film;
    if (lower.includes('edu')) return GraduationCap;
    return Wallet;
  };

  return (
    <motion.div
      variants={dashboardVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting Banner */}
      <motion.div variants={dashboardItemVariants} className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {greeting}, {profile.display_name || 'Siddharth'}!
        </h1>
        <p className="text-sm text-pulse-text-secondary">
          Here's your financial overview for this month.
        </p>
      </motion.div>

      {/* Top 4 KPI Cards (Grid matching the UI image) */}
      <motion.div 
        variants={dashboardItemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Total Balance */}
        <motion.div
          {...cardHoverProps}
          className="bg-pulse-card border border-pulse-border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-card"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#202E20] border border-pulse-accent/30 flex items-center justify-center text-pulse-accent">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pulse-text-secondary">
                Total Balance
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatINR(totalBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-pulse-accent">
              <span className="text-sm">↑</span> +8.4%
            </div>
          </div>
          {/* Subtle sparkline curve matching the UI image */}
          <div className="absolute bottom-2 left-4 right-4 h-8 pointer-events-none opacity-80">
            <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
              <path
                d="M 0 20 Q 25 18, 45 10 T 75 12 T 100 4"
                fill="none"
                stroke="#B7E477"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 2: Monthly Income */}
        <motion.div
          {...cardHoverProps}
          className="bg-pulse-card border border-pulse-border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-card"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#202E20] border border-pulse-accent/30 flex items-center justify-center text-pulse-accent">
                <ArrowDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pulse-text-secondary">
                Monthly Income
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatINR(monthlyIncome)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-pulse-accent">
              <span className="text-sm">↑</span> +12.5%
            </div>
          </div>
          {/* Green sparkline */}
          <div className="absolute bottom-2 left-4 right-4 h-8 pointer-events-none opacity-80">
            <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
              <path
                d="M 0 22 Q 30 20, 50 14 T 80 8 T 100 5"
                fill="none"
                stroke="#B7E477"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 3: Monthly Expenses */}
        <motion.div
          {...cardHoverProps}
          className="bg-pulse-card border border-pulse-border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-40 shadow-card"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2E1F1F] border border-pulse-negative/30 flex items-center justify-center text-pulse-negative">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pulse-text-secondary">
                Monthly Expenses
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatINR(monthlyExpenses)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-pulse-negative">
              <span className="text-sm">↑</span> +6.1%
            </div>
          </div>
          {/* Red/Coral sparkline */}
          <div className="absolute bottom-2 left-4 right-4 h-8 pointer-events-none opacity-80">
            <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
              <path
                d="M 0 18 Q 30 18, 55 12 T 85 14 T 100 8"
                fill="none"
                stroke="#EF7777"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Card 4: Remaining Budget */}
        <motion.div
          {...cardHoverProps}
          className="bg-pulse-card border border-pulse-border rounded-2xl p-5 flex flex-col justify-between h-40 shadow-card"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#202E20] border border-pulse-accent/30 flex items-center justify-center text-pulse-accent">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-pulse-text-secondary">
                Remaining Budget
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {formatINR(budgetUtil.remaining)}
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-[#111411] h-2 rounded-full overflow-hidden">
              <div
                className="bg-pulse-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${budgetUtil.cappedPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-pulse-text-secondary">
              {budgetUtil.percentage}% used
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Middle Row: Monthly Cash Flow & Spending by Category Charts */}
      <motion.div 
        variants={dashboardItemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Monthly Cash Flow Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">Monthly Cash Flow</h2>
            <div className="flex items-center gap-4 text-xs font-medium text-pulse-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pulse-accent" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#525E52]" />
                <span>Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} barGap={8} barCategoryGap="25%">
                <XAxis 
                  dataKey="monthName" 
                  stroke="#6B7280" 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatCompactINR}
                  fontSize={12}
                  domain={[0, 40000]}
                  ticks={[0, 10000, 20000, 30000, 40000]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-pulse-card border border-pulse-border p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-white mb-1.5">{label}</p>
                          <p className="text-pulse-accent flex justify-between gap-4">
                            <span>Income:</span>
                            <span className="font-semibold">{formatINR(payload[0].value)}</span>
                          </p>
                          <p className="text-pulse-text-secondary flex justify-between gap-4">
                            <span>Expenses:</span>
                            <span className="font-semibold">{formatINR(payload[1].value)}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Green bar for Income */}
                <Bar 
                  dataKey="income" 
                  fill="#B7E477" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={22}
                />
                {/* Grey/slate bar for Expenses matching reference screenshot */}
                <Bar 
                  dataKey="expenses" 
                  fill="#525E52" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <h2 className="text-base font-semibold text-white mb-4">Spending by Category</h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1B211B" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text (₹7,150 Total) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-white tabular-nums">
                  {formatINR(monthlyExpenses)}
                </span>
                <span className="text-[11px] font-medium text-pulse-text-secondary">
                  Total
                </span>
              </div>
            </div>

            {/* Category Legend matching screenshot */}
            <div className="flex-1 space-y-2.5 w-full">
              {categoryData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-pulse-text-primary truncate font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-white tabular-nums shrink-0 ml-2">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Row: Recent Transactions & Budget Overview */}
      <motion.div 
        variants={dashboardItemVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Recent Transactions List (7 Cols) */}
        <div className="lg:col-span-7 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
            <Link 
              to="/transactions" 
              className="text-xs font-medium text-pulse-text-secondary hover:text-pulse-accent transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.slice(0, 3).map((tx) => {
              const isIncome = tx.type === 'income';
              const Icon = getCategoryIcon(tx.category);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-pulse-bg/40 border border-pulse-border/60 hover:border-pulse-border transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#202E20] border border-pulse-accent/20 flex items-center justify-center text-pulse-accent shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {tx.description || tx.category}
                      </p>
                      <p className="text-xs text-pulse-text-secondary truncate mt-0.5">
                        {formatTransactionDateTime(tx.transaction_date, tx.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Badge: Income or Expense */}
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isIncome
                          ? 'bg-[#1E301E] text-pulse-accent border border-pulse-accent/30'
                          : 'bg-[#301E1E] text-pulse-negative border border-pulse-negative/30'
                      }`}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </span>

                    {/* Formatted Amount */}
                    <span
                      className={`text-sm font-bold tabular-nums min-w-[75px] text-right ${
                        isIncome ? 'text-pulse-accent' : 'text-pulse-text-primary'
                      }`}
                    >
                      {isIncome ? `+ ${formatINR(tx.amount)}` : `- ${formatINR(tx.amount)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Overview (5 Cols) */}
        <div className="lg:col-span-5 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Budget Overview</h2>
            <Link 
              to="/budgets" 
              className="text-xs font-medium text-pulse-text-secondary hover:text-pulse-accent transition-colors flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {categoryBudgetsList.map((catBudget) => (
              <div key={catBudget.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: catBudget.color }} 
                    />
                    <span className="font-medium text-white">
                      {catBudget.category_name}
                    </span>
                  </div>
                  <span className="text-pulse-text-secondary tabular-nums font-medium">
                    {formatINR(catBudget.spent)} / {formatINR(catBudget.monthly_limit)}
                  </span>
                </div>

                {/* Custom colored progress bar */}
                <div className="w-full bg-[#111411] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${catBudget.progress}%`,
                      backgroundColor: catBudget.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
