# PULSE — Personal Expense Tracking Web Application (MVP)

A modern, high-performance, dark-first personal expense tracker developed strictly according to the **PULSE Software Requirements Specification (SRS)** and designed to pixel-perfect fidelity matching the reference UI mockup.

---

## 🌟 Visual & UI Highlights

The application replicates the reference dashboard with precision:
- **Colour Tokens (SRS Table 4.1)**:
  - Background Primary: `#111411`
  - Sidebar Background: `#171B17`
  - Card Background: `#1B211B` (Hover: `#222922`)
  - Accent (Electric Lime): `#B7E477`
  - Text Primary: `#F1F3ED`
  - Text Secondary: `#929A90`
  - Border: `#303830`
  - Positive: `#50C995` | Negative: `#EF7777`
- **Typography & Formatting**:
  - Inter typeface with tabular numerals (`font-variant-numeric: tabular-nums`)
  - INR currency formatting with Indian lakh/crore groupings (`₹1,25,000.50`)
- **Key Dashboard Components (Overview)**:
  - **4 Top KPI Cards**:
    - **Total Balance**: ₹24,850 (`↑ +8.4%`), wallet icon badge, animated glowing green sparkline.
    - **Monthly Income**: ₹32,000 (`↑ +12.5%`), downward arrow icon badge, glowing green sparkline.
    - **Monthly Expenses**: ₹7,150 (`↑ +6.1%`), upward arrow icon badge, red/coral sparkline.
    - **Remaining Budget**: ₹7,850, bullseye icon badge, electric-lime progress bar (`47.7% used`).
  - **Monthly Cash Flow Chart**:
    - Multi-month historical comparison (Jul, Aug, Sep, Oct, Nov)
    - Paired rounded bars: Electric Lime for Income, Dark Slate for Expenses.
  - **Spending by Category Donut Chart**:
    - Thick donut ring with centered `₹7,150 Total`
    - Legend: Food & Dining (34%), Transport (24%), Shopping (18%), Entertainment (14%), Others (10%).
  - **Recent Transactions Widget**:
    - Shows latest activity (Allowance, Food & Dining, Bus Fare) with color-coded type pills, formatted dates, and quick link to full history.
  - **Budget Overview Widget**:
    - Visual progress tracking for Food & Dining (`₹2,500 / ₹4,000`), Transport (`₹850 / ₹1,500`), Entertainment (`₹700 / ₹1,000`), and Education (`₹1,200 / ₹2,500`).
  - **Persistent Left Sidebar & Header**:
    - `-/\- PULSE.` signature logo
    - Active navigation tab highlighted in vivid electric lime with black text
    - "Keep going! You're on track this month" progress card
    - User account menu ("Siddharth")
    - Header search bar with 300ms debounce
    - Notification bell with in-app budget warning alerts
    - Dark / Light / System theme toggle
    - Month selector dropdown (November 2025 default)
    - `+ Add Transaction` modal trigger

---

## 🚀 Key Modules & SRS Traceability

| Module | SRS Reference | Features Implemented |
|---|---|---|
| **M1: Authentication** | FR-AUTH-001 to 003 | Sign in, Sign up, Session state, Protected routes, Instant demo login |
| **M2: Dashboard** | FR-DASH-001 to 007 | 4 KPI cards, Cash flow chart, Category donut, Recent transactions, Budget overview, Quick add |
| **M3: Transactions** | FR-TRANS-001 to 007 | Full CRUD, VR-01 to VR-07 validation, search (300ms debounce), category/type/date filters, sorting, 25-item pagination |
| **M4: Budgets** | FR-BUD-001 to 006 | Overall & category budgets, utilisation %, threshold alerts (Normal, Warning ≥80%, Exceeded >100%), copy previous month |
| **M5: Analytics** | FR-ANALYTICS-001 to 008 | 3/6/12-month Income vs Expense, Category donut, Daily zero-filled spending line chart, Average daily spending, MoM change |
| **M6: Settings** | FR-SET-001 to 007 | Profile update, Currency format, Theme toggle, UTF-8 ISO CSV export, Security/Password, Account deletion ("DELETE" confirmation) |
| **Categories** | FR-CAT-001 to 003 | System defaults + User-defined custom categories with validation & deletion lock |
| **Finance Engine** | Section 10 (BR-01 to 17) | Pure functions, integer-paise arithmetic (`NFR-REL-001`) preventing float rounding errors |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visualisations**: Recharts
- **Motion Design**: Framer Motion (MOT-01 through MOT-16)
- **Database & Auth**: Supabase PostgreSQL + LocalStorage fallback sync engine

---

## 💻 Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run Production Build**:
   ```bash
   npm run build
   ```
   *Verified: bundle size gzip is under 300KB complying with NFR-PERF-001!*

4. **Run Financial Logic Unit Tests**:
   ```bash
   node test_finance.js
   ```

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

The application works 100% locally with zero setup required. To connect your remote Supabase instance:
1. Run the SQL script in `supabase_schema.sql` in your Supabase project's SQL Editor.
2. Create a `.env` file in the root folder:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
