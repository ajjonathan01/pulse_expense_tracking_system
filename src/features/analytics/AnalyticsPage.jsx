import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { 
  formatINR, 
  formatCompactINR, 
  formatMonthName 
} from '../../lib/format';
import { 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateAverageDailyExpenditure, 
  calculateMonthOnMonthChange, 
  calculateCategoryBreakdown,
  calculateDailyExpenditurePoints,
  getMonthDateRange,
  parseMonthKey 
} from '../../lib/finance';

export default function AnalyticsPage() {
  const { selectedMonth, transactions } = useApp();
  const [rangeMonths, setRangeMonths] = useState(6); // 3, 6, or 12 months

  const { year, month } = parseMonthKey(selectedMonth);
  const { startDate: currentMonthStart, endDate: currentMonthEnd } = getMonthDateRange(year, month);

  // 1. Current Month & Previous Month Stats (for MoM Change, FR-ANALYTICS-007)
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  const { startDate: prevMonthStart, endDate: prevMonthEnd } = getMonthDateRange(prevYear, prevMonth);

  const currIncome = useMemo(
    () => calculateTotalIncome(transactions, currentMonthStart, currentMonthEnd),
    [transactions, currentMonthStart, currentMonthEnd]
  );
  const prevIncome = useMemo(
    () => calculateTotalIncome(transactions, prevMonthStart, prevMonthEnd),
    [transactions, prevMonthStart, prevMonthEnd]
  );
  const incomeMoM = useMemo(
    () => calculateMonthOnMonthChange(currIncome, prevIncome),
    [currIncome, prevIncome]
  );

  const currExpenses = useMemo(
    () => calculateTotalExpenses(transactions, currentMonthStart, currentMonthEnd),
    [transactions, currentMonthStart, currentMonthEnd]
  );
  const prevExpenses = useMemo(
    () => calculateTotalExpenses(transactions, prevMonthStart, prevMonthEnd),
    [transactions, prevMonthStart, prevMonthEnd]
  );
  const expenseMoM = useMemo(
    () => calculateMonthOnMonthChange(currExpenses, prevExpenses),
    [currExpenses, prevExpenses]
  );

  // 2. Average Daily Expenditure (BR-09, FR-ANALYTICS-006)
  const avgDaily = useMemo(() => {
    return calculateAverageDailyExpenditure(transactions, selectedMonth, new Date());
  }, [transactions, selectedMonth]);

  // 3. Multi-month Range Data (default 6 months, FR-ANALYTICS-001 & 004)
  const rangeData = useMemo(() => {
    const list = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = rangeMonths - 1; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1;
      const { startDate, endDate } = getMonthDateRange(mYear, mMonth);

      const income = calculateTotalIncome(transactions, startDate, endDate);
      const expenses = calculateTotalExpenses(transactions, startDate, endDate);

      list.push({
        label: `${monthNames[d.getMonth()]} ${String(mYear).slice(2)}`,
        monthName: monthNames[d.getMonth()],
        income,
        expenses,
        net: income - expenses,
      });
    }
    return list;
  }, [transactions, year, month, rangeMonths]);

  // 4. Category Spending Distribution for Selected Range (FR-ANALYTICS-002)
  const rangeDateStart = useMemo(() => {
    const d = new Date(year, month - rangeMonths, 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}-01`;
  }, [year, month, rangeMonths]);

  const categoryDistribution = useMemo(() => {
    return calculateCategoryBreakdown(transactions, rangeDateStart, currentMonthEnd);
  }, [transactions, rangeDateStart, currentMonthEnd]);

  // 5. Highest Spending Category (FR-ANALYTICS-005)
  const highestCategory = useMemo(() => {
    if (categoryDistribution.length === 0) return null;
    const topAmount = categoryDistribution[0].amount;
    const tied = categoryDistribution.filter((c) => c.amount === topAmount && c.amount > 0);
    return tied.length > 0 ? tied : null;
  }, [categoryDistribution]);

  // 6. Daily Expenditure Points for Current Month (zero-filled, FR-ANALYTICS-003)
  const dailyPoints = useMemo(() => {
    return calculateDailyExpenditurePoints(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Financial Analytics</h1>
          <p className="text-xs sm:text-sm text-pulse-text-secondary mt-0.5">
            Deep dive into spending velocity, trends, and monthly comparisons.
          </p>
        </div>

        {/* Range Selector (3, 6, 12 months) */}
        <div className="flex items-center gap-1.5 p-1 bg-pulse-card border border-pulse-border rounded-xl">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setRangeMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                rangeMonths === m
                  ? 'bg-pulse-accent text-black shadow-sm'
                  : 'text-pulse-text-secondary hover:text-white'
              }`}
            >
              {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Average Daily Spending */}
        <div className="bg-pulse-card border border-pulse-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 text-xs text-pulse-text-secondary mb-2">
            <Coins className="w-4 h-4 text-pulse-accent" />
            <span>Avg. Daily Spending</span>
          </div>
          <div className="text-2xl font-bold text-white tabular-nums">
            {formatINR(avgDaily)}
          </div>
          <p className="text-[11px] text-pulse-text-secondary mt-1">
            Based on {formatMonthName(selectedMonth)}
          </p>
        </div>

        {/* Metric 2: Income MoM Change */}
        <div className="bg-pulse-card border border-pulse-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 text-xs text-pulse-text-secondary mb-2">
            <ArrowDownRight className="w-4 h-4 text-pulse-accent" />
            <span>Income vs Last Month</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatINR(currIncome)}
            </div>
            <span
              className={`text-xs font-bold ${
                incomeMoM.isPositive ? 'text-pulse-accent' : 'text-pulse-negative'
              }`}
            >
              {incomeMoM.display}
            </span>
          </div>
          <p className="text-[11px] text-pulse-text-secondary mt-1">
            vs {formatINR(prevIncome)} in prev month
          </p>
        </div>

        {/* Metric 3: Expense MoM Change */}
        <div className="bg-pulse-card border border-pulse-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 text-xs text-pulse-text-secondary mb-2">
            <ArrowUpRight className="w-4 h-4 text-pulse-negative" />
            <span>Expenses vs Last Month</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatINR(currExpenses)}
            </div>
            <span
              className={`text-xs font-bold ${
                expenseMoM.percentChange > 0 ? 'text-pulse-negative' : 'text-pulse-accent'
              }`}
            >
              {expenseMoM.display}
            </span>
          </div>
          <p className="text-[11px] text-pulse-text-secondary mt-1">
            vs {formatINR(prevExpenses)} in prev month
          </p>
        </div>

        {/* Metric 4: Top Spending Category */}
        <div className="bg-pulse-card border border-pulse-border rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2.5 text-xs text-pulse-text-secondary mb-2">
            <Award className="w-4 h-4 text-pulse-warning" />
            <span>Top Category ({rangeMonths}m)</span>
          </div>
          {highestCategory ? (
            <div>
              <div className="text-lg font-bold text-white truncate">
                {highestCategory.map((c) => c.name).join(', ')}
              </div>
              <p className="text-xs text-pulse-accent font-semibold tabular-nums mt-0.5">
                {formatINR(highestCategory[0].amount)} ({highestCategory[0].percentage}%)
              </p>
            </div>
          ) : (
            <p className="text-xs text-pulse-text-secondary">No recorded expenses</p>
          )}
        </div>
      </div>

      {/* Main Income vs Expense Chart across selected range */}
      <div className="bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Income vs Expenses ({rangeMonths}-Month Overview)
            </h2>
            <p className="text-xs text-pulse-text-secondary mt-0.5">
              Historical cash flow tracking over the last {rangeMonths} months
            </p>
          </div>
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

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rangeData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252F25" vertical={false} />
              <XAxis dataKey="label" stroke="#6B7280" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={formatCompactINR} fontSize={12} />
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
              <Bar dataKey="income" fill="#B7E477" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" fill="#525E52" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column Charts: Daily Expenditure Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Expenditure Line Chart (7 Cols, FR-ANALYTICS-003) */}
        <div className="lg:col-span-7 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Daily Spending Trend</h2>
              <p className="text-xs text-pulse-text-secondary mt-0.5">
                Every calendar day of {formatMonthName(selectedMonth)} (zero-filled)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252F25" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} tickFormatter={formatCompactINR} fontSize={12} />
                <Tooltip
                  cursor={{ stroke: '#B7E477', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-pulse-card border border-pulse-border p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-white">{item.date}</p>
                          <p className="text-pulse-accent">
                            Spent: <span className="font-bold">{formatINR(item.amount)}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#B7E477"
                  strokeWidth={2.5}
                  dot={{ fill: '#B7E477', r: 3 }}
                  activeDot={{ r: 6, fill: '#B7E477', stroke: '#111411', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut Breakdown (5 Cols, FR-ANALYTICS-002) */}
        <div className="lg:col-span-5 bg-pulse-card border border-pulse-border rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Category Distribution</h2>
            <p className="text-xs text-pulse-text-secondary mt-0.5 mb-4">
              Breakdown across the selected {rangeMonths}-month period
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#1B211B" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 w-full max-h-48 overflow-y-auto">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-pulse-text-primary truncate font-medium">{cat.name}</span>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <span className="font-semibold text-white">{formatINR(cat.amount)}</span>
                    <span className="text-pulse-text-secondary ml-1">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
