/**
 * PULSE Finance Engine
 * Enforces business rules and calculations from SRS Section 10.
 * Operates in integer-paise (1 Rupee = 100 Paise) to avoid floating-point errors (NFR-REL-001).
 */

/**
 * Convert rupee amount to paise (integer)
 * @param {number|string} rupees
 * @returns {number} Integer paise
 */
export function toPaise(rupees) {
  if (rupees === null || rupees === undefined || isNaN(Number(rupees))) return 0;
  return Math.round(Number(rupees) * 100);
}

/**
 * Convert paise (integer) back to rupees (float)
 * @param {number} paise
 * @returns {number} Rupees
 */
export function fromPaise(paise) {
  return Number((paise / 100).toFixed(2));
}

/**
 * Get [firstDay, lastDay] string dates (YYYY-MM-DD) for a given year and month (1-12)
 * @param {number} year
 * @param {number} month - 1 to 12
 * @returns {{ startDate: string, endDate: string, daysInMonth: number }}
 */
export function getMonthDateRange(year, month) {
  const pad = (n) => String(n).padStart(2, '0');
  const daysInMonth = new Date(year, month, 0).getDate(); // last day of month
  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(daysInMonth)}`,
    daysInMonth,
  };
}

/**
 * Parses YYYY-MM into { year: number, month: number }
 * @param {string} monthKey - "YYYY-MM"
 */
export function parseMonthKey(monthKey) {
  if (!monthKey) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [y, m] = monthKey.split('-').map(Number);
  return { year: y, month: m };
}

/**
 * BR-01: Total income over stated period (inclusive)
 * @param {Array} transactions
 * @param {string} [startDate] - YYYY-MM-DD
 * @param {string} [endDate] - YYYY-MM-DD
 * @returns {number} Total income in Rupees
 */
export function calculateTotalIncome(transactions = [], startDate = null, endDate = null) {
  let paiseSum = 0;
  for (const t of transactions) {
    if (t.type === 'income') {
      if (startDate && t.transaction_date < startDate) continue;
      if (endDate && t.transaction_date > endDate) continue;
      paiseSum += toPaise(t.amount);
    }
  }
  return fromPaise(paiseSum);
}

/**
 * BR-02: Total expenses over stated period (inclusive)
 * @param {Array} transactions
 * @param {string} [startDate] - YYYY-MM-DD
 * @param {string} [endDate] - YYYY-MM-DD
 * @returns {number} Total expenses in Rupees
 */
export function calculateTotalExpenses(transactions = [], startDate = null, endDate = null) {
  let paiseSum = 0;
  for (const t of transactions) {
    if (t.type === 'expense') {
      if (startDate && t.transaction_date < startDate) continue;
      if (endDate && t.transaction_date > endDate) continue;
      paiseSum += toPaise(t.amount);
    }
  }
  return fromPaise(paiseSum);
}

/**
 * BR-03: Calculated application balance
 * Σ income − Σ expense over all recorded transactions with date ≤ today.
 * Future-dated entries excluded until their date (A-07).
 * @param {Array} transactions
 * @param {string} [todayStr] - YYYY-MM-DD (defaults to today)
 * @returns {number} Balance in Rupees
 */
export function calculateApplicationBalance(transactions = [], todayStr = null) {
  const cutoff = todayStr || new Date().toISOString().slice(0, 10);
  let incomePaise = 0;
  let expensePaise = 0;

  for (const t of transactions) {
    if (t.transaction_date > cutoff) {
      // Future-dated transaction excluded from current running balance per BR-03 and A-07
      continue;
    }
    const amtPaise = toPaise(t.amount);
    if (t.type === 'income') {
      incomePaise += amtPaise;
    } else if (t.type === 'expense') {
      expensePaise += amtPaise;
    }
  }

  return fromPaise(incomePaise - expensePaise);
}

/**
 * BR-04: Monthly net cash flow
 * Monthly income − monthly expenses for selected month.
 * @param {Array} transactions
 * @param {string} monthKey - "YYYY-MM"
 * @returns {number} Net cash flow in Rupees
 */
export function calculateMonthlyNetCashFlow(transactions = [], monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const { startDate, endDate } = getMonthDateRange(year, month);
  const income = calculateTotalIncome(transactions, startDate, endDate);
  const expenses = calculateTotalExpenses(transactions, startDate, endDate);
  return fromPaise(toPaise(income) - toPaise(expenses));
}

/**
 * BR-05: Monthly expenditure for selected month
 * @param {Array} transactions
 * @param {string} monthKey - "YYYY-MM"
 * @returns {number}
 */
export function calculateMonthlyExpenditure(transactions = [], monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const { startDate, endDate } = getMonthDateRange(year, month);
  return calculateTotalExpenses(transactions, startDate, endDate);
}

/**
 * Category expenses for selected month
 * @param {Array} transactions
 * @param {string} categoryIdOrName
 * @param {string} monthKey - "YYYY-MM"
 * @returns {number}
 */
export function calculateCategoryExpenses(transactions = [], categoryIdOrName, monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const { startDate, endDate } = getMonthDateRange(year, month);
  let paiseSum = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      if (t.transaction_date >= startDate && t.transaction_date <= endDate) {
        if (t.category_id === categoryIdOrName || t.category === categoryIdOrName) {
          paiseSum += toPaise(t.amount);
        }
      }
    }
  }
  return fromPaise(paiseSum);
}

/**
 * BR-08: Utilisation %
 * spent ÷ limit × 100, rounded to 1 decimal; bar visually capped at 100%, text shows true value
 * Also returns threshold status: 'normal', 'warning' (>=80%), 'exceeded' (>100%) (FR-BUD-005)
 * @param {number} spent
 * @param {number} limit
 * @returns {{ percentage: number, cappedPercentage: number, status: 'normal'|'warning'|'exceeded', remaining: number }}
 */
export function calculateBudgetUtilisation(spent, limit) {
  if (!limit || limit <= 0) {
    return {
      percentage: 0,
      cappedPercentage: 0,
      status: 'normal',
      remaining: 0,
    };
  }

  const spentPaise = toPaise(spent);
  const limitPaise = toPaise(limit);
  const percentage = Number(((spentPaise / limitPaise) * 100).toFixed(1));
  const cappedPercentage = Math.min(100, Math.max(0, percentage));
  const remaining = fromPaise(limitPaise - spentPaise);

  let status = 'normal';
  if (percentage > 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  return {
    percentage,
    cappedPercentage,
    status,
    remaining,
  };
}

/**
 * BR-09: Average daily expenditure
 * Month expenditure ÷ days elapsed:
 * - Current month: days from 1st to today inclusive
 * - Past months: total calendar days in month
 * - Future months: 0
 * @param {Array} transactions
 * @param {string} monthKey - "YYYY-MM"
 * @param {Date} [referenceDate]
 * @returns {number}
 */
export function calculateAverageDailyExpenditure(transactions = [], monthKey, referenceDate = new Date()) {
  const { year, month } = parseMonthKey(monthKey);
  const { startDate, endDate, daysInMonth } = getMonthDateRange(year, month);
  const monthExpenses = calculateTotalExpenses(transactions, startDate, endDate);

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  let daysElapsed = 0;
  if (year > refYear || (year === refYear && month > refMonth)) {
    // Future month
    daysElapsed = 0;
  } else if (year < refYear || (year === refYear && month < refMonth)) {
    // Past month: full calendar days
    daysElapsed = daysInMonth;
  } else {
    // Current month: 1st to today inclusive
    daysElapsed = Math.min(refDay, daysInMonth);
  }

  if (daysElapsed <= 0) return 0;
  const spentPaise = toPaise(monthExpenses);
  const avgPaise = Math.round(spentPaise / daysElapsed);
  return fromPaise(avgPaise);
}

/**
 * BR-16: Month-on-month change
 * (current − previous) ÷ previous × 100; undefined (n/a) when previous is 0
 * @param {number} current
 * @param {number} previous
 * @returns {{ percentChange: number|null, display: string, isPositive: boolean, absoluteChange: number }}
 */
export function calculateMonthOnMonthChange(current, previous) {
  const currentPaise = toPaise(current);
  const previousPaise = toPaise(previous);
  const absoluteChange = fromPaise(currentPaise - previousPaise);

  if (previousPaise === 0) {
    return {
      percentChange: null,
      display: 'n/a',
      isPositive: currentPaise >= 0,
      absoluteChange,
    };
  }

  const percentChange = Number((((currentPaise - previousPaise) / previousPaise) * 100).toFixed(1));
  const sign = percentChange > 0 ? '+' : '';
  return {
    percentChange,
    display: `${sign}${percentChange}%`,
    isPositive: percentChange >= 0,
    absoluteChange,
  };
}

/**
 * Category-wise spending breakdown for donut chart
 * Returns sorted categories with percentages
 * @param {Array} transactions
 * @param {string} [startDate]
 * @param {string} [endDate]
 * @returns {Array<{ name: string, amount: number, percentage: number, color: string }>}
 */
export function calculateCategoryBreakdown(transactions = [], startDate = null, endDate = null) {
  const categoryTotals = {};
  let totalExpensePaise = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      if (startDate && t.transaction_date < startDate) continue;
      if (endDate && t.transaction_date > endDate) continue;
      const cat = t.category || 'Other';
      const amtPaise = toPaise(t.amount);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amtPaise;
      totalExpensePaise += amtPaise;
    }
  }

  const categoryColors = {
    'Food & Dining': '#B7E477', // Pulse electric lime
    'Food': '#B7E477',
    'Transport': '#5A738E',     // slate blue
    'Shopping': '#8B5CF6',      // purple
    'Entertainment': '#F59E0B', // amber
    'Education': '#EC4899',     // pink
    'Health': '#10B981',        // emerald
    'Utilities': '#06B6D4',     // cyan
    'Rent': '#6366F1',          // indigo
    'Others': '#6B7280',        // gray
    'Other': '#6B7280',
  };

  const results = Object.entries(categoryTotals).map(([name, paise]) => {
    const amount = fromPaise(paise);
    const percentage = totalExpensePaise > 0 
      ? Math.round((paise / totalExpensePaise) * 100) 
      : 0;
    return {
      name,
      amount,
      percentage,
      color: categoryColors[name] || '#64748B',
    };
  });

  // Sort descending by amount
  results.sort((a, b) => b.amount - a.amount);
  return results;
}

/**
 * Daily expenditure points for line chart in selected month (zero-filled)
 * @param {Array} transactions
 * @param {string} monthKey - "YYYY-MM"
 * @returns {Array<{ day: number, date: string, amount: number }>}
 */
export function calculateDailyExpenditurePoints(transactions = [], monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const { daysInMonth } = getMonthDateRange(year, month);
  const pad = (n) => String(n).padStart(2, '0');

  const dailyMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    dailyMap[dateStr] = 0;
  }

  for (const t of transactions) {
    if (t.type === 'expense' && dailyMap[t.transaction_date] !== undefined) {
      dailyMap[t.transaction_date] += toPaise(t.amount);
    }
  }

  return Object.entries(dailyMap).map(([dateStr, paise]) => ({
    day: Number(dateStr.slice(8, 10)),
    date: dateStr,
    amount: fromPaise(paise),
  }));
}
