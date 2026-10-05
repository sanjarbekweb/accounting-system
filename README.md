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

### Mode Toggle
Switch between **Guided** mode and **Free** mode at the top of the page.

- **Guided Mode** — The *Details* column (CRJ & PCJ) and both *Sundry Details* columns become dropdown selects with pre-defined options so you can practise choosing the correct account.
- **Free Mode** — Every column uses a plain text or number input; no dropdowns. Useful for timed practice or assessments.

Switching modes preserves all data you have already entered.

### Journals
All three journals are displayed simultaneously on the page (not as tabs). Each has:
- A heading and short description
- A full-width table with the correct column layout
- **Add Row** — appends a blank row to the table
- **x** (remove button) on each row — deletes that row

### Finish Button
Click **Finish** to:
1. Compute column totals for every numeric column in each journal.
2. Validate your entries:
   - **CRJ**: Checks that *Analysis of Receipts* = *Sales* + *Trade Receivables Control* + *Sundry Amount*.
   - **CPJ**: Checks that *Bank* = *Wages* + *Purchases* + *Trade Payables Control* + *Sundry Amount*.
   - **PCJ**: Checks that *Petty Cash / Total* = *Wages* + *Postage* + *Stationery* + *Sundry Amount*.
   - Flags any row where *Sundry Amount* > 0 but *Sundry Details* is blank.
   - Flags any *Day* value outside the range 1–31.
3. Display a **Results** panel below the tables showing:
   - A **Totals** summary table per journal.
   - An **Errors** list, or a green confirmation if no errors were found.

### Download Button
Click **Download (.docx)** to export all three journals (with headers, your data, and a totals row) as a Microsoft Word document (`accounting_journals.docx`).

> Requires an internet connection on first load to fetch the `docx` library from the CDN (`https://unpkg.com/docx@8/build/index.js`).

## Column Layout

### Cash Receipts Journal (CRJ)
Doc No | Day | Details | Analysis of Receipts | Bank | Sales | Trade Receivables Control | Sundry Amount | Fol | Sundry Details

### Cash Payments Journal (CPJ)
Doc No | Day | Payee | Bank | Wages | Purchases | Trade Payables Control | Sundry Amount | Fol | Sundry Details

### Petty Cash Journal (PCJ)
Doc No | Day | Details | Petty Cash / Total | Wages | Postage | Stationery | Sundry Amount | Fol | Sundry Details

## File Structure

```
accounting-system/
  index.html   — Page structure and journal layout
  style.css    — Flat design stylesheet
  app.js       — State management, rendering, validation, export
  README.md    — This file
```

## Browser Compatibility

Works in any modern browser that supports ES6 (Chrome, Firefox, Edge, Safari). Internet access is needed only to load the `docx` CDN library for the download feature.