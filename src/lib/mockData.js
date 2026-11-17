/**
 * PULSE Seed Data
 * Perfectly matches the figures in the reference UI image:
 * User: Siddharth
 * Active Month: November 2025
 * Balance: ₹24,850
 * Income: ₹32,000
 * Expenses: ₹7,150
 * Budget: Overall ₹15,000 (Remaining: ₹7,850, 47.7% used)
 */

export const INITIAL_PROFILE = {
  id: 'usr_siddharth_01',
  display_name: 'Siddharth',
  email: 'siddharth@example.com',
  currency: 'INR',
  currency_symbol: '₹',
  theme: 'dark',
  created_at: '2025-06-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
};

export const INITIAL_CATEGORIES = [
  // System Expense Categories (FR-CAT-001)
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', is_system: true, color: '#B7E477', icon: 'Utensils' },
  { id: 'cat_transport', name: 'Transport', type: 'expense', is_system: true, color: '#5A738E', icon: 'Bus' },
  { id: 'cat_shopping', name: 'Shopping', type: 'expense', is_system: true, color: '#8B5CF6', icon: 'ShoppingBag' },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', is_system: true, color: '#F59E0B', icon: 'Film' },
  { id: 'cat_education', name: 'Education', type: 'expense', is_system: true, color: '#EC4899', icon: 'GraduationCap' },
  { id: 'cat_rent', name: 'Rent', type: 'expense', is_system: true, color: '#6366F1', icon: 'Home' },
  { id: 'cat_utilities', name: 'Utilities', type: 'expense', is_system: true, color: '#06B6D4', icon: 'Zap' },
  { id: 'cat_health', name: 'Health', type: 'expense', is_system: true, color: '#10B981', icon: 'HeartPulse' },
  { id: 'cat_other_exp', name: 'Others', type: 'expense', is_system: true, color: '#6B7280', icon: 'MoreHorizontal' },

  // System Income Categories (FR-CAT-001)
  { id: 'cat_salary', name: 'Salary', type: 'income', is_system: true, color: '#50C995', icon: 'Briefcase' },
  { id: 'cat_allowance', name: 'Allowance', type: 'income', is_system: true, color: '#B7E477', icon: 'Wallet' },
  { id: 'cat_freelance', name: 'Freelance', type: 'income', is_system: true, color: '#38BDF8', icon: 'Laptop' },
  { id: 'cat_gift', name: 'Gift', type: 'income', is_system: true, color: '#F472B6', icon: 'Gift' },
  { id: 'cat_other_inc', name: 'Other', type: 'income', is_system: true, color: '#A3E635', icon: 'Coins' },
];

export const INITIAL_BUDGETS = [
  // Overall Budget for November 2025: Limit ₹15,000 -> Remaining ₹7,850 (47.7% used)
  {
    id: 'bud_nov_2025_overall',
    user_id: 'usr_siddharth_01',
    category_id: null,
    category_name: 'Overall Budget',
    monthly_limit: 15000,
    month: 11,
    year: 2025,
    created_at: '2025-11-01T00:00:00Z',
  },
  // Category Budgets for November 2025 (matching UI card in image)
  {
    id: 'bud_nov_2025_food',
    user_id: 'usr_siddharth_01',
    category_id: 'cat_food',
    category_name: 'Food & Dining',
    monthly_limit: 4000,
    month: 11,
    year: 2025,
    created_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 'bud_nov_2025_transport',
    user_id: 'usr_siddharth_01',
    category_id: 'cat_transport',
    category_name: 'Transport',
    monthly_limit: 1500,
    month: 11,
    year: 2025,
    created_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 'bud_nov_2025_entertainment',
    user_id: 'usr_siddharth_01',
    category_id: 'cat_entertainment',
    category_name: 'Entertainment',
    monthly_limit: 1000,
    month: 11,
    year: 2025,
    created_at: '2025-11-01T00:00:00Z',
  },
  {
    id: 'bud_nov_2025_education',
    user_id: 'usr_siddharth_01',
    category_id: 'cat_education',
    category_name: 'Education',
    monthly_limit: 2500,
    month: 11,
    year: 2025,
    created_at: '2025-11-01T00:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS = [
  // --- November 2025 (Active Month) ---
  // Recent transactions from screenshot:
  {
    id: 'tx_nov_01',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 2000,
    category: 'Allowance',
    category_id: 'cat_allowance',
    description: 'Allowance',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-11-16',
    time: '10:24 AM',
    created_at: '2025-11-16T10:24:00Z',
  },
  {
    id: 'tx_nov_02',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 180,
    category: 'Food & Dining',
    category_id: 'cat_food',
    description: 'Food & Dining',
    payment_method: 'UPI',
    transaction_date: '2025-11-16',
    time: '1:12 PM',
    created_at: '2025-11-16T13:12:00Z',
  },
  {
    id: 'tx_nov_03',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 50,
    category: 'Transport',
    category_id: 'cat_transport',
    description: 'Bus Fare',
    payment_method: 'Cash',
    transaction_date: '2025-11-15',
    time: '9:30 AM',
    created_at: '2025-11-15T09:30:00Z',
  },
  // Additional Nov transactions to reach exact ₹32,000 Income & ₹7,150 Expense:
  // Expenses sum to ₹7,150:
  // Food & Dining: 34% of 7,150 ≈ ₹2,431 -> ₹2,431 (180 + 2251)
  {
    id: 'tx_nov_04',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 2320,
    category: 'Food & Dining',
    category_id: 'cat_food',
    description: 'Monthly Grocery & Cafes',
    payment_method: 'Card',
    transaction_date: '2025-11-08',
    time: '6:45 PM',
    created_at: '2025-11-08T18:45:00Z',
  },
  // Transport: 24% of 7,150 ≈ ₹1,716 (50 + 1666)
  {
    id: 'tx_nov_05',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 800,
    category: 'Transport',
    category_id: 'cat_transport',
    description: 'Metro Smart Card Recharge',
    payment_method: 'UPI',
    transaction_date: '2025-11-05',
    time: '8:15 AM',
    created_at: '2025-11-05T08:15:00Z',
  },
  // Shopping: 18% of 7,150 ≈ ₹1,287
  {
    id: 'tx_nov_06',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 1287,
    category: 'Shopping',
    category_id: 'cat_shopping',
    description: 'Winter Jacket & Books',
    payment_method: 'Card',
    transaction_date: '2025-11-10',
    time: '4:20 PM',
    created_at: '2025-11-10T16:20:00Z',
  },
  // Entertainment: 14% of 7,150 ≈ ₹1,001
  {
    id: 'tx_nov_07',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 700,
    category: 'Entertainment',
    category_id: 'cat_entertainment',
    description: 'Movie IMAX Tickets & Popcorn',
    payment_method: 'UPI',
    transaction_date: '2025-11-12',
    time: '7:30 PM',
    created_at: '2025-11-12T19:30:00Z',
  },
  // Others: 10% of 7,150 ≈ ₹715 (Education/Others)
  {
    id: 'tx_nov_08',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 1200,
    category: 'Education',
    category_id: 'cat_education',
    description: 'Online Certification Course',
    payment_method: 'Card',
    transaction_date: '2025-11-03',
    time: '11:00 AM',
    created_at: '2025-11-03T11:00:00Z',
  },
  {
    id: 'tx_nov_09',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 613,
    category: 'Others',
    category_id: 'cat_other_exp',
    description: 'Pharmacy & Household essentials',
    payment_method: 'UPI',
    transaction_date: '2025-11-07',
    time: '2:15 PM',
    created_at: '2025-11-07T14:15:00Z',
  },

  // Incomes in Nov:
  // Main Salary / Stipend: ₹30,000 + Allowance ₹2,000 = ₹32,000
  {
    id: 'tx_nov_10',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 30000,
    category: 'Salary',
    category_id: 'cat_salary',
    description: 'Monthly Salary Credit',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-11-01',
    time: '9:00 AM',
    created_at: '2025-11-01T09:00:00Z',
  },

  // Initial baseline adjustment so total calculated balance is exactly ₹24,850
  {
    id: 'tx_jun_01',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 31000,
    category: 'Rent',
    category_id: 'cat_rent',
    description: 'Apartment Security Deposit',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-06-15',
    time: '11:00 AM',
    created_at: '2025-06-15T11:00:00Z',
  },
  // --- Historical Transactions for 6-month chart (Jul, Aug, Sep, Oct 2025) ---
  // Jul 2025: Income 26k, Expense 20k
  {
    id: 'tx_jul_01',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 26000,
    category: 'Salary',
    category_id: 'cat_salary',
    description: 'July Salary',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-07-01',
    time: '9:00 AM',
    created_at: '2025-07-01T09:00:00Z',
  },
  {
    id: 'tx_jul_02',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 20000,
    category: 'Rent',
    category_id: 'cat_rent',
    description: 'July Apartment Rent & Living',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-07-05',
    time: '10:00 AM',
    created_at: '2025-07-05T10:00:00Z',
  },

  // Aug 2025: Income 28k, Expense 18k
  {
    id: 'tx_aug_01',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 28000,
    category: 'Salary',
    category_id: 'cat_salary',
    description: 'August Salary',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-08-01',
    time: '9:00 AM',
    created_at: '2025-08-01T09:00:00Z',
  },
  {
    id: 'tx_aug_02',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 18000,
    category: 'Rent',
    category_id: 'cat_rent',
    description: 'August Rent & Expenses',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-08-05',
    time: '10:00 AM',
    created_at: '2025-08-05T10:00:00Z',
  },

  // Sep 2025: Income 25k, Expense 19k
  {
    id: 'tx_sep_01',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 25000,
    category: 'Salary',
    category_id: 'cat_salary',
    description: 'September Salary',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-09-01',
    time: '9:00 AM',
    created_at: '2025-09-01T09:00:00Z',
  },
  {
    id: 'tx_sep_02',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 19000,
    category: 'Rent',
    category_id: 'cat_rent',
    description: 'September Rent & Essentials',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-09-05',
    time: '10:00 AM',
    created_at: '2025-09-05T10:00:00Z',
  },

  // Oct 2025: Income 30k, Expense 21k
  {
    id: 'tx_oct_01',
    user_id: 'usr_siddharth_01',
    type: 'income',
    amount: 30000,
    category: 'Salary',
    category_id: 'cat_salary',
    description: 'October Salary',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-10-01',
    time: '9:00 AM',
    created_at: '2025-10-01T09:00:00Z',
  },
  {
    id: 'tx_oct_02',
    user_id: 'usr_siddharth_01',
    type: 'expense',
    amount: 21000,
    category: 'Rent',
    category_id: 'cat_rent',
    description: 'October Living Expenses',
    payment_method: 'Bank Transfer',
    transaction_date: '2025-10-05',
    time: '10:00 AM',
    created_at: '2025-10-05T10:00:00Z',
  },
];
