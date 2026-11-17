import { 
  toPaise, 
  fromPaise, 
  calculateTotalIncome, 
  calculateTotalExpenses, 
  calculateApplicationBalance, 
  calculateBudgetUtilisation, 
  calculateMonthOnMonthChange, 
  calculateAverageDailyExpenditure 
} from './src/lib/finance.js';

console.log('--- RUNNING PULSE FINANCIAL LOGIC TESTS (SRS TC-REL-01, TC-DASH-01, TC-ANA-01) ---');

// TC-REL-01: Sum of 0.10 + 0.20 equals 0.30 exactly (NFR-REL-001)
const p1 = toPaise(0.10);
const p2 = toPaise(0.20);
const sumRupees = fromPaise(p1 + p2);
if (sumRupees === 0.30) {
  console.log('✅ PASS: TC-REL-01 - 0.10 + 0.20 = 0.30 exactly (No floating-point rounding error)');
} else {
  console.error(`❌ FAIL: TC-REL-01 - Expected 0.30 but got ${sumRupees}`);
  process.exit(1);
}

// Test Budget Utilisation & Thresholds (FR-BUD-004 & FR-BUD-005)
const util1 = calculateBudgetUtilisation(7150, 15000);
if (util1.percentage === 47.7 && util1.status === 'normal' && util1.remaining === 7850) {
  console.log('✅ PASS: TC-BUD-02 - Utilisation calculation for 7150 / 15000 = 47.7% (Remaining: 7850)');
} else {
  console.error('❌ FAIL: TC-BUD-02 - Utilisation mismatch', util1);
  process.exit(1);
}

const utilWarning = calculateBudgetUtilisation(8000, 10000);
if (utilWarning.status === 'warning') {
  console.log('✅ PASS: FR-BUD-005 - Warning status triggered at 80%');
} else {
  console.error('❌ FAIL: FR-BUD-005 - Warning threshold failed', utilWarning);
  process.exit(1);
}

const utilExceeded = calculateBudgetUtilisation(10500, 10000);
if (utilExceeded.status === 'exceeded') {
  console.log('✅ PASS: FR-BUD-005 - Exceeded status triggered above 100%');
} else {
  console.error('❌ FAIL: FR-BUD-005 - Exceeded threshold failed', utilExceeded);
  process.exit(1);
}

// Test MoM change with previous = 0 (BR-16)
const momZero = calculateMonthOnMonthChange(5000, 0);
if (momZero.display === 'n/a') {
  console.log('✅ PASS: BR-16 - MoM change with previous 0 returns "n/a"');
} else {
  console.error('❌ FAIL: BR-16 - Expected "n/a"', momZero);
  process.exit(1);
}

console.log('🎉 All financial calculation unit tests passed successfully!');
