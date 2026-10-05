# Accounting Practice System

A single-page, static web application for practising subsidiary journal entries used in accounting — no server or build step required.

## Journals Covered

| Journal | Abbreviation | Purpose |
|---|---|---|
| Cash Receipts Journal | CRJ | Records all money received |
| Cash Payments Journal | CPJ | Records all money paid out |
| Petty Cash Journal | PCJ | Records small cash payments |

## Getting Started

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser — no server required.
3. Start entering journal data in the tables.

## Features

### Currency Selection
Select your desired working currency from the header dropdown at the start:
- **R (Rand)** — South African Rand (default for CAPS curriculum)
- **$ (Dollar)** — US / International Dollar
- **€ (Euro)** — European Euro
- **Fr (Franc)** — Swiss / CFA Franc
- **¥ (Yen)** — Japanese Yen
- **£ (Pound)** — British Pound

Your selected currency updates all in-table footers, results calculations, and Word `.docx` exports immediately, and is remembered across sessions in `localStorage`.

### AI Transaction Solver (Google Gemini API)
Each row in every journal features an **AI** button:
- Click the **AI** button on any row to open the AI solver modal.
- Enter a transaction problem statement or select one of the built-in quick practice samples (capital deposit, supplier payments, petty cash vouchers, cash register rolls, etc.).
- Gemini analyzes the transaction against subsidiary journal balancing rules and generates:
  1. Complete row field values (Doc no, Day, Details/Payee, Bank, breakdown columns, Fol, and Sundry account).
  2. A step-by-step educational accounting explanation detailing **why** the transaction was recorded that way (double entry debits/credits, source documents, and formula balance).
- Click **Apply to Table Row** to transfer the solution directly into your ledger row.
- Rows solved by AI are badged with a green AI button; clicking it again lets you review the accounting explanation at any time.

#### Configuring Your Gemini API Key
1. Click the **Gemini API Key** button in the header.
2. Paste your Google Gemini API key (obtainable free from [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Click **Save Key**. The key is stored locally in your browser's `localStorage` and never leaves your device except to query Google's API endpoint.

### Mode Toggle
Switch between **Guided** mode and **Free** mode at the top of the page.

- **Guided Mode** — The *Sundry Details* columns provide dropdown selects with standard General Ledger accounts (e.g., Capital, Rent income, Furniture, Equipment, Refreshments) so you can practise account classification.
- **Free Mode** — Plain text entry throughout the tables for realistic assessments.

Switching modes preserves all data you have already entered.

### Journals
All three journals are displayed simultaneously on the page:
- Cash Receipts Journal (CRJ)
- Cash Payments Journal (CPJ)
- Petty Cash Journal (PCJ)

Each has:
- Authentic textbook two-tier table layout with Sundry account sub-columns (Amount, Fol, Details).
- Editable journal title header (e.g. business name and period).
- **AI** button per row to solve that specific transaction.
- **Add Row** button to append rows.
- **x** button to remove rows.
- Real-time keyboard navigation (Enter key navigates down or automatically adds rows).

### Finish Button
Click **Finish** to:
1. Compute column totals for every numeric column in each journal and display in-table totals rows.
2. Validate your entries against accounting balancing equations:
   - **CRJ**: Checks that *Analysis of Receipts* = *Sales* + *Trade Receivables Control* + *Sundry Amount*.
   - **CPJ**: Checks that *Bank* = *Wages* + *Purchases* + *Trade Payables Control* + *Sundry Amount*.
   - **PCJ**: Checks that *Petty Cash / Total* = *Wages* + *Postage* + *Stationery* + *Sundry Amount*.
   - Flags any row where *Sundry Amount* > 0 but *Sundry Details* is blank.
   - Flags any *Day* value outside the range 1–31.
3. Display a **Results & Feedback** panel with column totals and mistake diagnostics.

### Download Button
Click **Download (.docx)** to export all three journals (with editable business titles, multi-tier headers, formatted data cells, and totals) as a clean Microsoft Word document (`accounting_journals.docx`).

Works offline using the bundled `docx.umd.js` with CDN fallback.

## File Structure

```
accounting-system/
  index.html     — Page structure, journal tables, and modals
  style.css      — Clean accounting textbook stylesheet (no emojis, no gradients)
  app.js         — State management, Gemini AI solver, validation, and Word export
  docx.umd.js    — Bundled offline docx generation library
  README.md      — Documentation
```

## Browser Compatibility

Works in any modern browser that supports ES6 (Chrome, Firefox, Edge, Safari). Internet access is required only when calling the Gemini API to solve transactions.