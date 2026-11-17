/**
 * PULSE Format Library
 * Handles currency formatting with Indian lakh/crore grouping and date formatting.
 * Per SRS BR-13: Two decimal places, round-half-up on display; INR formatted in lakh/crore grouping (e.g. ₹1,25,000.50).
 */

/**
 * Format a numeric amount as Indian Rupees (INR)
 * @param {number} amount - Amount in Rupees
 * @param {boolean} showDecimals - Whether to enforce 2 decimal places (default: false for whole numbers like in the UI)
 * @returns {string} Formatted string, e.g. "₹24,850" or "₹1,25,000.50"
 */
export function formatINR(amount, showDecimals = false) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Check if amount has decimals or forced
  const hasDecimals = showDecimals || (absAmount % 1 !== 0);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });

  const formatted = formatter.format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format compact INR for charts (e.g. 10k, 20k, 30k)
 * @param {number} value
 * @returns {string}
 */
export function formatCompactINR(value) {
  if (value === 0) return '0';
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${value}`;
}

/**
 * Format a date string into readable format (e.g. "Nov 16, 2025 • 10:24 AM")
 * @param {string|Date} dateInput
 * @param {string} [timeInput]
 * @returns {string}
 */
export function formatTransactionDateTime(dateInput, timeInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return dateInput;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let timeStr = timeInput;
  if (!timeStr) {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    timeStr = `${hours}:${minutes} ${ampm}`;
  }

  return `${month} ${day}, ${year} • ${timeStr}`;
}

/**
 * Format month key YYYY-MM into label (e.g. "2025-11" -> "November 2025")
 * @param {string} monthKey - "YYYY-MM"
 * @returns {string}
 */
export function formatMonthName(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get current month key in "YYYY-MM" format
 * @returns {string}
 */
export function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Get date string in YYYY-MM-DD
 * @param {Date} [d]
 * @returns {string}
 */
export function getISODateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
