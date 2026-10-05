/* ============================================================
   Accounting Practice System - app.js
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================

let mode = 'guided'; // 'guided' | 'free'
let currentCurrency = localStorage.getItem('accounting_currency') || 'R';

const journals = {
  crj: [],
  cpj: [],
  pcj: []
};

let activeAiContext = {
  journalKey: 'crj',
  rowIndex: 0,
  solution: null
};

// ============================================================
// SCHEMA DEFINITIONS
// ============================================================

const schemas = {
  crj: [
    { key: 'docNo',                   label: 'Doc no',                   type: 'text'   },
    { key: 'day',                     label: 'Day',                      type: 'number' },
    { key: 'details',                 label: 'Details',                  type: 'text'   }, // User writes details manually
    { key: 'analysisOfReceipts',      label: 'Analysis of receipts',     type: 'number' },
    { key: 'bank',                    label: 'Bank',                     type: 'number' },
    { key: 'sales',                   label: 'Sales',                    type: 'number' },
    { key: 'tradeReceivablesControl', label: 'Trade receivables control', type: 'number' },
    { key: 'sundryAmount',            label: 'Amount',                   type: 'number', isSundry: true },
    { key: 'fol',                     label: 'Fol',                      type: 'text', fol: true, isSundry: true },
    { key: 'sundryDetails',           label: 'Details',                  type: 'text', isSundry: true,
      guidedOptions: ['Capital', 'Rent income', 'Interest income', 'Commission received', 'Drawings'] }
  ],
  cpj: [
    { key: 'docNo',                 label: 'Doc no',                   type: 'text'   },
    { key: 'day',                   label: 'Day',                      type: 'number' },
    { key: 'payee',                 label: 'Payee',                    type: 'text'   }, // User writes payee manually
    { key: 'bank',                  label: 'Bank',                     type: 'number' },
    { key: 'wages',                 label: 'Wages',                    type: 'number' },
    { key: 'purchases',             label: 'Purchases',                type: 'number' },
    { key: 'tradePayablesControl',  label: 'Trade payables control',   type: 'number' },
    { key: 'sundryAmount',          label: 'Amount',                   type: 'number', isSundry: true },
    { key: 'fol',                   label: 'Fol',                      type: 'text', fol: true, isSundry: true },
    { key: 'sundryDetails',         label: 'Details',                  type: 'text', isSundry: true,
      guidedOptions: ['Furniture', 'Equipment', 'Vehicle', 'Drawings', 'Wages', 'Rent expense', 'Interest expense', 'Stationery', 'Repairs', 'Trading stock', 'Trade payables control'] }
  ],
  pcj: [
    { key: 'docNo',         label: 'Doc no',            type: 'text'   },
    { key: 'day',           label: 'Day',               type: 'number' },
    { key: 'details',       label: 'Details',           type: 'text'   }, // User writes details manually
    { key: 'pettyCashTotal', label: 'Petty cash/total', type: 'number' },
    { key: 'wages',         label: 'Wages',             type: 'number' },
    { key: 'postage',       label: 'Postage',           type: 'number' },
    { key: 'stationery',    label: 'Stationery',        type: 'number' },
    { key: 'sundryAmount',  label: 'Amount',            type: 'number', isSundry: true },
    { key: 'fol',           label: 'Fol',               type: 'text', fol: true, isSundry: true },
    { key: 'sundryDetails', label: 'Details',           type: 'text', isSundry: true,
      guidedOptions: ['Refreshments', 'Drawings', 'Cleaning', 'Donations', 'Petrol', 'Sundry expenses', 'Repairs'] }
  ]
};

const numericKeys = {
  crj: ['analysisOfReceipts', 'bank', 'sales', 'tradeReceivablesControl', 'sundryAmount'],
  cpj: ['bank', 'wages', 'purchases', 'tradePayablesControl', 'sundryAmount'],
  pcj: ['pettyCashTotal', 'wages', 'postage', 'stationery', 'sundryAmount']
};

// ============================================================
// BLANK ROW FACTORY
// ============================================================

function blankRow(journalKey) {
  const row = {};
  schemas[journalKey].forEach(col => { row[col.key] = ''; });
  row.aiExplanation = '';
  return row;
}

// ============================================================
// INIT
// ============================================================

function init() {
  const savedCurrency = localStorage.getItem('accounting_currency');
  if (savedCurrency) currentCurrency = savedCurrency;
  const select = document.getElementById('currency-select');
  if (select) select.value = currentCurrency;

  updateApiKeyBadge();

  journals.crj.push(blankRow('crj'));
  journals.cpj.push(blankRow('cpj'));
  journals.pcj.push(blankRow('pcj'));

  renderJournal('crj');
  renderJournal('cpj');
  renderJournal('pcj');
}

// ============================================================
// RENDER JOURNAL
// ============================================================

function renderJournal(journalKey) {
  const tbody = document.getElementById('tbody-' + journalKey);
  tbody.innerHTML = '';

  journals[journalKey].forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    tr.dataset.rowIndex = rowIndex;

    schemas[journalKey].forEach(col => {
      const td = document.createElement('td');
      if (col.fol) td.classList.add('col-fol');

      // Alignment classes for real accounting ledger look
      if (col.type === 'number' && col.key !== 'day') {
        td.classList.add('cell-number');
      } else if (col.key === 'day' || col.fol) {
        td.classList.add('cell-center');
      } else {
        td.classList.add('cell-text');
      }

      const useSelect = mode === 'guided' && col.guidedOptions;

      if (useSelect) {
        const select = document.createElement('select');
        select.dataset.key = col.key;
        select.dataset.rowIndex = rowIndex;

        const blankOpt = document.createElement('option');
        blankOpt.value = '';
        blankOpt.textContent = '-- select account --';
        select.appendChild(blankOpt);

        col.guidedOptions.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          if (row[col.key] === opt) option.selected = true;
          select.appendChild(option);
        });

        td.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = col.type === 'number' ? 'number' : 'text';
        input.dataset.key = col.key;
        input.dataset.rowIndex = rowIndex;
        input.value = row[col.key] !== undefined ? row[col.key] : '';
        if (col.type === 'number') {
          input.min = col.key === 'day' ? '1' : '0';
          if (col.key === 'day') input.max = '31';
          input.step = col.key === 'day' ? '1' : 'any';
        }
        td.appendChild(input);
      }

      tr.appendChild(td);
    });

    const actionTd = document.createElement('td');
    actionTd.classList.add('col-action');

    const aiBtn = document.createElement('button');
    aiBtn.className = 'btn-ai';
    if (row.aiExplanation) aiBtn.classList.add('has-ai-exp');
    aiBtn.textContent = 'AI';
    aiBtn.type = 'button';
    aiBtn.title = row.aiExplanation ? 'AI Solved (Click to view explanation or re-solve)' : 'Solve with AI';
    aiBtn.addEventListener('click', () => openAiModal(journalKey, rowIndex));
    actionTd.appendChild(aiBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'x';
    removeBtn.type = 'button';
    removeBtn.title = 'Remove row';
    removeBtn.addEventListener('click', () => removeRow(journalKey, rowIndex));
    actionTd.appendChild(removeBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  tbody.addEventListener('input', (e) => handleCellInput(e, journalKey));
  tbody.addEventListener('change', (e) => handleCellInput(e, journalKey));

  // Practical keyboard navigation (Enter moves down / adds row, Tab moves across)
  tbody.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      const rowIndex = parseInt(target.dataset.rowIndex, 10);
      const key = target.dataset.key;
      const allInputs = Array.from(tbody.querySelectorAll(`input[data-key="${key}"], select[data-key="${key}"]`));
      if (allInputs[rowIndex + 1]) {
        allInputs[rowIndex + 1].focus();
        if (allInputs[rowIndex + 1].select) allInputs[rowIndex + 1].select();
      } else {
        // At the bottom row: append row and move down to new row
        addRow(journalKey);
        setTimeout(() => {
          const updated = Array.from(tbody.querySelectorAll(`input[data-key="${key}"], select[data-key="${key}"]`));
          if (updated[rowIndex + 1]) {
            updated[rowIndex + 1].focus();
            if (updated[rowIndex + 1].select) updated[rowIndex + 1].select();
          }
        }, 10);
      }
      e.preventDefault();
    }
  });
}

// ============================================================
// CELL INPUT HANDLER
// ============================================================

function handleCellInput(e, journalKey) {
  const target = e.target;
  if (!target.dataset.key) return;
  const rowIndex = parseInt(target.dataset.rowIndex, 10);
  const key = target.dataset.key;
  journals[journalKey][rowIndex][key] = target.value;
}

// ============================================================
// SYNC STATE FROM DOM
// ============================================================

function syncStateFromDOM() {
  ['crj', 'cpj', 'pcj'].forEach(journalKey => {
    const tbody = document.getElementById('tbody-' + journalKey);
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(tr => {
      const rowIndex = parseInt(tr.dataset.rowIndex, 10);
      if (isNaN(rowIndex)) return;
      tr.querySelectorAll('input, select').forEach(el => {
        if (el.dataset.key && journals[journalKey][rowIndex] !== undefined) {
          journals[journalKey][rowIndex][el.dataset.key] = el.value;
        }
      });
    });
  });
}

// ============================================================
// SWITCH MODE
// ============================================================

function switchMode(newMode) {
  if (newMode === mode) return;
  syncStateFromDOM();
  mode = newMode;

  document.getElementById('btn-guided').classList.toggle('active', mode === 'guided');
  document.getElementById('btn-free').classList.toggle('active', mode === 'free');

  renderJournal('crj');
  renderJournal('cpj');
  renderJournal('pcj');
}

// ============================================================
// UTILITY
// ============================================================

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ============================================================
// ADD ROW
// ============================================================

function addRow(journalKey) {
  journals[journalKey].push(blankRow(journalKey));
  renderJournal(journalKey);
}

// ============================================================
// REMOVE ROW
// ============================================================

function removeRow(journalKey, index) {
  journals[journalKey].splice(index, 1);
  if (journals[journalKey].length === 0) {
    journals[journalKey].push(blankRow(journalKey));
  }
  renderJournal(journalKey);
}

// ============================================================
// COMPUTE TOTALS
// ============================================================

function computeTotals(journalKey) {
  const totals = {};
  numericKeys[journalKey].forEach(k => { totals[k] = 0; });

  journals[journalKey].forEach(row => {
    numericKeys[journalKey].forEach(k => {
      const v = parseFloat(row[k]);
      if (!isNaN(v)) totals[k] += v;
    });
  });

  return totals;
}

// ============================================================
// VALIDATE JOURNAL
// ============================================================

function isRowEmpty(row, journalKey) {
  return schemas[journalKey].every(col => !row[col.key] || String(row[col.key]).trim() === '');
}

function validateJournal(journalKey) {
  const errors = [];
  const rowErrors = new Set();
  const rowBalanced = new Set();
  const journalLabel = { crj: 'CRJ', cpj: 'CPJ', pcj: 'PCJ' }[journalKey];

  journals[journalKey].forEach((row, i) => {
    const rowNum = i + 1;
    if (isRowEmpty(row, journalKey)) return;

    let hasError = false;

    // Day check
    if (row.day !== '' && row.day !== undefined) {
      const day = parseInt(row.day, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        errors.push(`${journalLabel} Row ${rowNum}: Day must be between 1 and 31.`);
        hasError = true;
      }
    }

    // Sundry consistency
    const sundryAmt = parseFloat(row.sundryAmount) || 0;
    const hasSundryDetails = row.sundryDetails && row.sundryDetails.trim() !== '';

    if (sundryAmt > 0 && !hasSundryDetails) {
      errors.push(`${journalLabel} Row ${rowNum}: Sundry Amount (${sundryAmt.toFixed(2)}) entered, but Sundry Details account name is missing.`);
      hasError = true;
    } else if (sundryAmt === 0 && hasSundryDetails) {
      errors.push(`${journalLabel} Row ${rowNum}: Sundry account name "${row.sundryDetails}" specified, but Sundry Amount is missing or zero.`);
      hasError = true;
    }

    // Details / Payee presence check
    if (journalKey === 'cpj') {
      const hasAnyAmt = numericKeys.cpj.some(k => (parseFloat(row[k]) || 0) > 0);
      if (hasAnyAmt && (!row.payee || row.payee.trim() === '')) {
        errors.push(`CPJ Row ${rowNum}: Payment amounts entered, but Payee name is blank.`);
        hasError = true;
      }
    } else {
      const hasAnyAmt = numericKeys[journalKey].some(k => (parseFloat(row[k]) || 0) > 0);
      if (hasAnyAmt && (!row.details || row.details.trim() === '')) {
        errors.push(`${journalLabel} Row ${rowNum}: Transaction amounts entered, but Details description is blank.`);
        hasError = true;
      }
    }

    // CRJ balance validation
    if (journalKey === 'crj') {
      const aor = parseFloat(row.analysisOfReceipts) || 0;
      const bank = parseFloat(row.bank) || 0;
      const s   = parseFloat(row.sales) || 0;
      const trc = parseFloat(row.tradeReceivablesControl) || 0;
      const sa  = parseFloat(row.sundryAmount) || 0;
      const receiptTotal = aor > 0 ? aor : bank;
      const breakdown = round2(s + trc + sa);

      if (receiptTotal > 0 && breakdown === 0) {
        errors.push(`CRJ Row ${rowNum}: Money received (${receiptTotal.toFixed(2)}) entered in Analysis/Bank, but no breakdown provided in Sales, Trade Receivables Control, or Sundry.`);
        hasError = true;
      } else if (breakdown > 0 && receiptTotal === 0) {
        errors.push(`CRJ Row ${rowNum}: Breakdown entered (${breakdown.toFixed(2)}), but Analysis of Receipts (or Bank) is empty.`);
        hasError = true;
      } else if (receiptTotal > 0 && breakdown > 0 && Math.abs(receiptTotal - breakdown) > 0.001) {
        errors.push(`CRJ Row ${rowNum}: Analysis of Receipts (${receiptTotal.toFixed(2)}) does not balance with breakdown (Sales: ${s.toFixed(2)} + Trade Receivables: ${trc.toFixed(2)} + Sundry: ${sa.toFixed(2)} = ${breakdown.toFixed(2)}). Difference: ${round2(Math.abs(receiptTotal - breakdown)).toFixed(2)}.`);
        hasError = true;
      }
    }

    // CPJ balance validation
    if (journalKey === 'cpj') {
      const bank = parseFloat(row.bank) || 0;
      const w    = parseFloat(row.wages) || 0;
      const p    = parseFloat(row.purchases) || 0;
      const tpc  = parseFloat(row.tradePayablesControl) || 0;
      const sa   = parseFloat(row.sundryAmount) || 0;
      const breakdown = round2(w + p + tpc + sa);

      if (bank > 0 && breakdown === 0) {
        errors.push(`CPJ Row ${rowNum}: Bank payment (${bank.toFixed(2)}) entered, but no payment breakdown provided in Wages, Purchases, Trade Payables Control, or Sundry.`);
        hasError = true;
      } else if (breakdown > 0 && bank === 0) {
        errors.push(`CPJ Row ${rowNum}: Payment breakdown entered (${breakdown.toFixed(2)}), but Bank payment column is empty.`);
        hasError = true;
      } else if (bank > 0 && breakdown > 0 && Math.abs(bank - breakdown) > 0.001) {
        errors.push(`CPJ Row ${rowNum}: Bank payment (${bank.toFixed(2)}) does not match payment columns (Wages: ${w.toFixed(2)} + Purchases: ${p.toFixed(2)} + Trade Payables: ${tpc.toFixed(2)} + Sundry: ${sa.toFixed(2)} = ${breakdown.toFixed(2)}). Difference: ${round2(Math.abs(bank - breakdown)).toFixed(2)}.`);
        hasError = true;
      }
    }

    // PCJ balance validation
    if (journalKey === 'pcj') {
      const pct = parseFloat(row.pettyCashTotal) || 0;
      const w   = parseFloat(row.wages) || 0;
      const po  = parseFloat(row.postage) || 0;
      const st  = parseFloat(row.stationery) || 0;
      const sa  = parseFloat(row.sundryAmount) || 0;
      const breakdown = round2(w + po + st + sa);

      if (pct > 0 && breakdown === 0) {
        errors.push(`PCJ Row ${rowNum}: Petty Cash / Total (${pct.toFixed(2)}) entered, but no expense breakdown provided in Wages, Postage, Stationery, or Sundry.`);
        hasError = true;
      } else if (breakdown > 0 && pct === 0) {
        errors.push(`PCJ Row ${rowNum}: Expense breakdown entered (${breakdown.toFixed(2)}), but Petty Cash / Total is empty.`);
        hasError = true;
      } else if (pct > 0 && breakdown > 0 && Math.abs(pct - breakdown) > 0.001) {
        errors.push(`PCJ Row ${rowNum}: Petty Cash / Total (${pct.toFixed(2)}) does not match expense columns (Wages: ${w.toFixed(2)} + Postage: ${po.toFixed(2)} + Stationery: ${st.toFixed(2)} + Sundry: ${sa.toFixed(2)} = ${breakdown.toFixed(2)}). Difference: ${round2(Math.abs(pct - breakdown)).toFixed(2)}.`);
        hasError = true;
      }
    }

    if (hasError) {
      rowErrors.add(i);
    } else {
      rowBalanced.add(i);
    }
  });

  return { errors, rowErrors, rowBalanced };
}

// ============================================================
// RENDER TABLE FOOT TOTALS
// ============================================================

function renderTotalsFoot(journalKey, totals) {
  const tfoot = document.getElementById('tfoot-' + journalKey);
  if (!tfoot) return;
  tfoot.innerHTML = '';
  tfoot.style.display = 'table-footer-group';

  const tr = document.createElement('tr');
  schemas[journalKey].forEach((col, idx) => {
    const td = document.createElement('td');
    if (idx === 0) {
      td.textContent = 'Totals';
      td.classList.add('totals-label');
    } else if (numericKeys[journalKey].includes(col.key)) {
      td.textContent = `${currentCurrency} ${round2(totals[col.key]).toFixed(2)}`;
      td.classList.add('totals-number');
    } else {
      td.textContent = '';
    }
    tr.appendChild(td);
  });

  // Action column blank cell
  const actionTd = document.createElement('td');
  actionTd.textContent = '';
  tr.appendChild(actionTd);

  tfoot.appendChild(tr);
}

// ============================================================
// ON FINISH
// ============================================================

function onFinish() {
  syncStateFromDOM();

  const crjVal = validateJournal('crj');
  const cpjVal = validateJournal('cpj');
  const pcjVal = validateJournal('pcj');

  const allErrors = [
    ...crjVal.errors,
    ...cpjVal.errors,
    ...pcjVal.errors
  ];

  const results = { crj: crjVal, cpj: cpjVal, pcj: pcjVal };

  // Update row visual feedback in each table
  ['crj', 'cpj', 'pcj'].forEach(jk => {
    const tbody = document.getElementById('tbody-' + jk);
    if (!tbody) return;
    const trs = tbody.querySelectorAll('tr');
    trs.forEach((tr, idx) => {
      tr.classList.remove('row-error', 'row-balanced');
      if (results[jk].rowErrors.has(idx)) {
        tr.classList.add('row-error');
      } else if (results[jk].rowBalanced.has(idx)) {
        tr.classList.add('row-balanced');
      }
    });
  });

  // Compute column totals and display inside each table's tfoot
  const crjTotals = computeTotals('crj');
  const cpjTotals = computeTotals('cpj');
  const pcjTotals = computeTotals('pcj');

  renderTotalsFoot('crj', crjTotals);
  renderTotalsFoot('cpj', cpjTotals);
  renderTotalsFoot('pcj', pcjTotals);

  const panel = document.getElementById('results-panel');
  panel.style.display = 'block';

  let html = '<h3>Results & Feedback</h3>';

  html += '<div class="totals-panel">';
  html += '<h4>Column Totals (Posted to General Ledger)</h4>';

  const journalMeta = [
    { key: 'crj', label: 'Cash Receipts Journal (CRJ)', totals: crjTotals },
    { key: 'cpj', label: 'Cash Payments Journal (CPJ)', totals: cpjTotals },
    { key: 'pcj', label: 'Petty Cash Journal (PCJ)',    totals: pcjTotals }
  ];

  journalMeta.forEach(({ key, label, totals }) => {
    html += `<p style="font-weight:600;margin:0.5rem 0 0.25rem;">${label}</p>`;
    html += '<table class="totals-table"><thead><tr><th>Column</th><th>Total</th></tr></thead><tbody>';
    numericKeys[key].forEach(colKey => {
      const colLabel = schemas[key].find(c => c.key === colKey).label;
      html += `<tr><td>${colLabel}</td><td>${currentCurrency} ${round2(totals[colKey]).toFixed(2)}</td></tr>`;
    });
    html += '</tbody></table>';
  });

  html += '</div>';

  if (allErrors.length > 0) {
    html += '<div class="errors-panel">';
    html += `<h4>Mistakes Detected (${allErrors.length})</h4>`;
    html += '<ul>';
    allErrors.forEach(err => {
      html += `<li>${escapeHtml(err)}</li>`;
    });
    html += '</ul>';
    html += '<p style="margin-top:0.75rem;font-size:0.85rem;color:#7b241c;">Rows highlighted in red have discrepancies. Review the accounting rules: receipts/payments must balance with their breakdown columns.</p>';
    html += '</div>';
  } else {
    html += '<div class="no-errors-panel"><p>No errors found — all rows balance and your entries are correct!</p></div>';
  }

  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// ON DOWNLOAD (docx)
// ============================================================

function onDownload() {
  syncStateFromDOM();

  if (typeof docx === 'undefined') {
    alert('The docx library has not loaded yet. Please check your internet connection and try again.');
    return;
  }

  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, HeadingLevel, WidthType, AlignmentType, ShadingType
  } = docx;

  const journalDefs = [
    {
      key: 'crj',
      defaultTitle: 'Cash Receipts journal of blue skies for January 2025',
      col1Headers: ['Doc no', 'Day', 'Details', 'Analysis of receipts', 'Bank', 'Sales', 'Trade receivables control']
    },
    {
      key: 'cpj',
      defaultTitle: 'Cash Payments journal of blue skies for January 2025',
      col1Headers: ['Doc no', 'Day', 'Payee', 'Bank', 'Wages', 'Purchases', 'Trade payables control']
    },
    {
      key: 'pcj',
      defaultTitle: 'Petty Cash journal of blue skies for January 2025',
      col1Headers: ['Doc no', 'Day', 'Details', 'Petty cash/total', 'Wages', 'Postage', 'Stationery']
    }
  ];

  function makeWordHeaderCell(text, rowSpan, colSpan) {
    const opts = {
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: String(text || ''), bold: true, size: 18 })]
        })
      ],
      shading: { type: ShadingType.CLEAR, fill: '969BA1' },
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
    };
    if (rowSpan && rowSpan > 1) opts.rowSpan = rowSpan;
    if (colSpan && colSpan > 1) opts.columnSpan = colSpan;
    return new TableCell(opts);
  }

  function makeWordDataCell(text, align, bold) {
    let pAlign = AlignmentType.LEFT;
    if (align === 'right') pAlign = AlignmentType.RIGHT;
    if (align === 'center') pAlign = AlignmentType.CENTER;

    return new TableCell({
      children: [
        new Paragraph({
          alignment: pAlign,
          children: [new TextRun({ text: String(text || ''), bold: !!bold, size: 18 })]
        })
      ],
      margins: { top: 40, bottom: 40, left: 60, right: 60 }
    });
  }

  const docSections = [];

  journalDefs.forEach(({ key, defaultTitle, col1Headers }) => {
    const schema = schemas[key];
    const rows   = journals[key];
    const totals = computeTotals(key);

    // Retrieve live title from DOM if edited by user
    const titleEl = document.querySelector(`#table-${key} .journal-title-header`);
    const liveTitle = titleEl ? titleEl.textContent.trim() : defaultTitle;

    // Row 1: Title row spanning 10 columns
    const titleRow = new TableRow({
      children: [
        new TableCell({
          columnSpan: 10,
          shading: { type: ShadingType.CLEAR, fill: '969BA1' },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: liveTitle, bold: true, size: 20 })] })],
          margins: { top: 80, bottom: 80, left: 60, right: 60 }
        })
      ]
    });

    // Row 2: Top header row (7 main columns spanning 2 rows + Sundry account spanning 3 cols)
    const headerRow1Cells = col1Headers.map(h => makeWordHeaderCell(h, 2, 1));
    headerRow1Cells.push(makeWordHeaderCell('Sundry account', 1, 3));
    const headerRow1 = new TableRow({ children: headerRow1Cells, tableHeader: true });

    // Row 3: Sub header row under Sundry account (Amount, Fol, Details)
    const headerRow2Cells = [
      makeWordHeaderCell('Amount', 1, 1),
      makeWordHeaderCell('Fol', 1, 1),
      makeWordHeaderCell('Details', 1, 1)
    ];
    const headerRow2 = new TableRow({ children: headerRow2Cells, tableHeader: true });

    // Data rows
    const dataRows = rows.map(rowData => {
      const cells = schema.map(col => {
        let align = 'left';
        let val = rowData[col.key] || '';
        if (numericKeys[key].includes(col.key)) {
          align = 'right';
          if (val !== '' && !isNaN(parseFloat(val))) {
            val = `${currentCurrency} ${round2(parseFloat(val)).toFixed(2)}`;
          }
        }
        if (col.key === 'day' || col.fol) align = 'center';
        return makeWordDataCell(val, align, false);
      });
      return new TableRow({ children: cells });
    });

    // Totals row
    const totalsCells = schema.map((col, idx) => {
      if (idx === 0) return makeWordDataCell('Totals', 'center', true);
      if (numericKeys[key].includes(col.key)) {
        return makeWordDataCell(`${currentCurrency} ${round2(totals[col.key]).toFixed(2)}`, 'right', true);
      }
      return makeWordDataCell('', 'left', false);
    });
    const totalsRow = new TableRow({ children: totalsCells });

    const docTable = new Table({
      rows: [titleRow, headerRow1, headerRow2, ...dataRows, totalsRow],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });

    docSections.push(
      new Paragraph({ text: '', spacing: { before: 200 } }),
      docTable,
      new Paragraph({ text: '', spacing: { after: 300 } })
    );
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: 'Accounting Practice System — Completed Journals',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 }
        }),
        ...docSections
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'accounting_journals.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch(err => {
    console.error('Error generating .docx:', err);
    alert('Failed to generate the Word document. See the browser console for details.');
  });
}

// ============================================================
// CURRENCY MANAGEMENT
// ============================================================

function setCurrency(newCurrency) {
  currentCurrency = newCurrency;
  localStorage.setItem('accounting_currency', newCurrency);

  // Update in-table totals footers if currently visible
  ['crj', 'cpj', 'pcj'].forEach(jk => {
    const tfoot = document.getElementById('tfoot-' + jk);
    if (tfoot && tfoot.style.display !== 'none') {
      renderTotalsFoot(jk, computeTotals(jk));
    }
  });

  // Refresh results panel if active
  const resultsPanel = document.getElementById('results-panel');
  if (resultsPanel && resultsPanel.style.display !== 'none') {
    onFinish();
  }
}

// ============================================================
// GEMINI API KEY MANAGEMENT
// ============================================================

function getApiKey() {
  return (localStorage.getItem('gemini_api_key') || '').trim();
}

function updateApiKeyBadge() {
  const badge = document.getElementById('api-key-badge');
  const btn = document.getElementById('btn-api-key');
  if (!badge) return;
  const key = getApiKey();
  if (key) {
    badge.textContent = 'Gemini API: Ready';
    if (btn) btn.classList.add('has-key');
  } else {
    badge.textContent = 'Gemini API Key';
    if (btn) btn.classList.remove('has-key');
  }
}

function openApiKeyModal() {
  const input = document.getElementById('input-api-key');
  if (input) input.value = getApiKey();
  const modal = document.getElementById('api-key-modal');
  if (modal) modal.style.display = 'flex';
}

function closeApiKeyModal() {
  const modal = document.getElementById('api-key-modal');
  if (modal) modal.style.display = 'none';
}

function saveApiKey() {
  const input = document.getElementById('input-api-key');
  const val = (input ? input.value : '').trim();
  if (!val) {
    alert('Please enter a valid Gemini API key or click Cancel.');
    return;
  }
  localStorage.setItem('gemini_api_key', val);
  updateApiKeyBadge();
  closeApiKeyModal();
}

function clearApiKey() {
  localStorage.removeItem('gemini_api_key');
  const input = document.getElementById('input-api-key');
  if (input) input.value = '';
  updateApiKeyBadge();
  closeApiKeyModal();
}

// ============================================================
// AI SOLVER MODAL & CONTROLS
// ============================================================

function openAiModal(journalKey, rowIndex) {
  activeAiContext = { journalKey, rowIndex, solution: null };

  const journalNames = {
    crj: 'Cash Receipts Journal (CRJ)',
    cpj: 'Cash Payments Journal (CPJ)',
    pcj: 'Petty Cash Journal (PCJ)'
  };

  const titleEl = document.getElementById('ai-modal-title');
  if (titleEl) {
    titleEl.textContent = `AI Transaction Solver — ${journalNames[journalKey]} (Row ${rowIndex + 1})`;
  }

  const row = journals[journalKey][rowIndex];
  const txPrompt = document.getElementById('ai-tx-prompt');
  const loadingEl = document.getElementById('ai-loading');
  const errorEl = document.getElementById('ai-error');
  const resultEl = document.getElementById('ai-result');
  const applyBtn = document.getElementById('btn-apply-solution');

  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  if (row && row.aiExplanation) {
    if (resultEl) resultEl.style.display = 'block';
    renderSolutionPreview(journalKey, row);
    const expBox = document.getElementById('ai-explanation-content');
    if (expBox) expBox.textContent = row.aiExplanation;
    if (applyBtn) applyBtn.style.display = 'none';
  } else {
    if (resultEl) resultEl.style.display = 'none';
    if (applyBtn) applyBtn.style.display = 'none';
  }

  // Pre-load a default sample prompt if prompt is empty
  if (txPrompt && !txPrompt.value.trim()) {
    loadSamplePrompt(1);
  }

  const modal = document.getElementById('ai-solver-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAiModal() {
  const modal = document.getElementById('ai-solver-modal');
  if (modal) modal.style.display = 'none';
}

function loadSamplePrompt(id) {
  const jk = activeAiContext.journalKey || 'crj';
  const c = currentCurrency;
  const samples = {
    crj: {
      1: `Owner deposited ${c} 50,000 cash directly into the business bank account as initial capital contribution on day 1 (Receipt 001).`,
      2: `Cash sales of merchandise according to the cash register roll on day 8 amounted to ${c} 3,450.`,
      3: `Received ${c} 1,200 cheque from debtor C Hopkins on day 14 in part settlement of his account (Receipt 002).`,
      4: `Received ${c} 800 cash from tenant for monthly store rent on day 20 (Receipt 003).`,
      5: `Cash sales of merchandise per cash register tape on day 28 totaled ${c} 4,600.`
    },
    cpj: {
      1: `Paid weekly wages in cash, ${c} 1,500 on day 5 (Cheque 101).`,
      2: `Purchased trading inventory from Waltons Wholesalers, paying ${c} 4,200 by cheque 102 on day 9.`,
      3: `Bought new office computer and desk for ${c} 2,800 from Office Mart, paid by cheque 103 on day 15.`,
      4: `Paid creditor AA Suppliers ${c} 1,650 by cheque 104 in settlement of account on day 22.`,
      5: `Owner withdrew ${c} 750 cash for personal living expenses on day 27 (Cheque 105).`
    },
    pcj: {
      1: `Paid ${c} 45 cash from petty cash for postage stamps on day 3 (Petty Cash Voucher 201).`,
      2: `Bought office stationery including pens and printing paper for ${c} 68 cash on day 7 (Voucher 202).`,
      3: `Paid ${c} 35 cash for tea, milk, and sugar for office staff refreshments on day 12 (Voucher 203).`,
      4: `Paid ${c} 50 cash to casual cleaner for office deep cleaning on day 18 (Voucher 204).`,
      5: `Paid ${c} 25 cash for urgent delivery courier service on day 24 (Voucher 205).`
    }
  };

  const txPrompt = document.getElementById('ai-tx-prompt');
  if (txPrompt && samples[jk] && samples[jk][id]) {
    txPrompt.value = samples[jk][id];
  }
}

function renderSolutionPreview(journalKey, fields) {
  const table = document.getElementById('solution-preview-table');
  if (!table) return;
  table.innerHTML = '';

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  const tbody = document.createElement('tbody');
  const trData = document.createElement('tr');

  schemas[journalKey].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    trHead.appendChild(th);

    const td = document.createElement('td');
    let val = fields[col.key] !== undefined ? fields[col.key] : '';
    if (numericKeys[journalKey].includes(col.key)) {
      td.classList.add('num-cell');
      if (val !== '' && !isNaN(parseFloat(val))) {
        val = `${currentCurrency} ${round2(parseFloat(val)).toFixed(2)}`;
      }
    }
    td.textContent = val !== '' ? val : '—';
    trData.appendChild(td);
  });

  thead.appendChild(trHead);
  tbody.appendChild(trData);
  table.appendChild(thead);
  table.appendChild(tbody);
}

function applyCurrentAiSolution() {
  const { journalKey, rowIndex, solution } = activeAiContext;
  if (!solution || !solution.fields) return;

  const row = journals[journalKey][rowIndex];
  if (!row) return;

  schemas[journalKey].forEach(col => {
    if (solution.fields[col.key] !== undefined && solution.fields[col.key] !== null) {
      row[col.key] = String(solution.fields[col.key]);
    }
  });

  row.aiExplanation = solution.explanation || '';

  renderJournal(journalKey);
  closeAiModal();
}

// ============================================================
// GEMINI PROMPT GENERATOR & API CLIENT
// ============================================================

function buildGeminiAccountingPrompt(txText, journalKey, currency) {
  const journalNames = {
    crj: 'Cash Receipts Journal (CRJ)',
    cpj: 'Cash Payments Journal (CPJ)',
    pcj: 'Petty Cash Journal (PCJ)'
  };

  const schemaInfo = schemas[journalKey].map(col => {
    let extra = '';
    if (col.guidedOptions) extra = ` (Permitted account names: ${col.guidedOptions.join(', ')})`;
    return `- "${col.key}": ${col.label} (${col.type})${extra}`;
  }).join('\n');

  let specificRules = '';
  if (journalKey === 'crj') {
    specificRules = `CRJ RULES:
- "docNo": Document number (e.g. "001", "CRT 1", "Rec 1").
- "day": Integer 1-31.
- "details": Name of account or payer. Write "Sales" for cash merchandise sales. Write debtor's name for debtor payment. Write "Capital" or owner name for capital contribution. Write income name (e.g. "Rent income") for other receipts.
- "analysisOfReceipts": Cash received into the cash till before banking.
- "bank": Total amount banked. Usually equals analysisOfReceipts.
- "sales": Selling price if merchandise was sold.
- "tradeReceivablesControl": Money received from a trade debtor on account.
- "sundryAmount": Any receipt that is NEITHER Sales NOR Trade Receivables (e.g. Capital, Rent income, Interest income). If none, set to 0.
- "fol": Folio reference (e.g. "B1", "N1", "GL").
- "sundryDetails": The exact General Ledger account name credited for the sundry amount (e.g. "Capital", "Rent income"). Leave empty if sundryAmount is 0.
- BALANCING FORMULA: analysisOfReceipts MUST EQUAL (sales + tradeReceivablesControl + sundryAmount).`;
  } else if (journalKey === 'cpj') {
    specificRules = `CPJ RULES:
- "docNo": Cheque number or payment voucher (e.g. "101", "Chq 101").
- "day": Integer 1-31.
- "payee": Name of person or vendor paid (e.g. "Waltons", "Cash", "Office Mart", "AA Suppliers").
- "bank": Total amount paid out of business bank account.
- "wages": Amount paid for staff salaries or wages.
- "purchases": Amount paid for trading stock / inventory bought for resale.
- "tradePayablesControl": Amount paid to a trade creditor / supplier on account.
- "sundryAmount": Any payment not belonging to Wages, Purchases, or Trade Payables (e.g. Equipment, Vehicle, Furniture, Drawings, Rent expense, Stationery, Repairs). If none, set to 0.
- "fol": Folio reference (e.g. "B2", "N2").
- "sundryDetails": The exact General Ledger account name debited for sundry amount (e.g. "Equipment", "Drawings", "Rent expense"). Leave empty if sundryAmount is 0.
- BALANCING FORMULA: bank MUST EQUAL (wages + purchases + tradePayablesControl + sundryAmount).`;
  } else if (journalKey === 'pcj') {
    specificRules = `PCJ RULES:
- "docNo": Petty cash voucher number (e.g. "201", "PCV 1").
- "day": Integer 1-31.
- "details": Specific description of expense item (e.g. "Postage stamps", "Stationery", "Refreshments", "Cleaning").
- "pettyCashTotal": Total cash paid out from petty cash box.
- "wages": Casual wages paid from petty cash.
- "postage": Stamps, postage, envelopes.
- "stationery": Small stationery supplies.
- "sundryAmount": Any expense not covered by Wages, Postage, or Stationery. If none, set to 0.
- "fol": Folio reference.
- "sundryDetails": The account debited for sundry amount (e.g. "Refreshments", "Cleaning", "Donations", "Petrol"). Leave empty if sundryAmount is 0.
- BALANCING FORMULA: pettyCashTotal MUST EQUAL (wages + postage + stationery + sundryAmount).`;
  }

  return `You are a certified professional accountant and accounting educator.
Solve the following transaction problem strictly for the ${journalNames[journalKey]}.
Currency symbol: ${currency}

TRANSACTION STATEMENT:
"${txText}"

COLUMN KEYS TO POPULATE:
${schemaInfo}

${specificRules}

CRITICAL INSTRUCTIONS:
1. All monetary numbers must be formatted as numeric values or numeric strings (e.g. 5000 or 5000.00). Unused columns must be 0 or empty string "".
2. Day must be an integer (1-31).
3. The balancing formula MUST balance exactly.
4. "explanation" must be a thorough, step-by-step accounting explanation explaining:
   - Why this belongs in ${journalNames[journalKey]}.
   - Source document identified.
   - General Ledger double entry (Debit and Credit accounts).
   - How the column breakdown balances: Total = ...
   - Why specific accounts were chosen.

Return ONLY a valid JSON object matching this schema with NO markdown wrapping:
{
  "fields": {
    ${schemas[journalKey].map(c => `"${c.key}": ...`).join(',\n    ')}
  },
  "explanation": "Step-by-step accounting explanation..."
}`;
}

async function callGeminiApi(prompt, apiKey) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error && errorData.error.message ? errorData.error.message : `HTTP ${response.status} ${response.statusText}`;
        if (response.status === 400 && errMsg.includes('API key')) {
          throw new Error('Invalid Gemini API Key. Please verify your key in the settings.');
        }
        if (response.status === 404) {
          lastError = new Error(errMsg);
          continue;
        }
        throw new Error(`Gemini API error: ${errMsg}`);
      }

      const data = await response.json();
      const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : null;
      if (!text) {
        throw new Error('Gemini API returned an empty response.');
      }

      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.fields) {
        throw new Error('Response did not contain valid journal fields.');
      }
      return parsed;
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes('Invalid Gemini API Key')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to reach Gemini API. Please check your internet connection.');
}

async function executeAiSolve() {
  const txPrompt = document.getElementById('ai-tx-prompt');
  const txText = txPrompt ? txPrompt.value.trim() : '';
  if (!txText) {
    alert('Please enter a transaction statement or click one of the quick samples.');
    if (txPrompt) txPrompt.focus();
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    alert('A Gemini API key is required to solve transactions with AI. Please configure your API key.');
    openApiKeyModal();
    return;
  }

  const loadingEl = document.getElementById('ai-loading');
  const errorEl = document.getElementById('ai-error');
  const resultEl = document.getElementById('ai-result');
  const applyBtn = document.getElementById('btn-apply-solution');
  const runBtn = document.getElementById('btn-run-ai');

  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  if (resultEl) resultEl.style.display = 'none';
  if (applyBtn) applyBtn.style.display = 'none';
  if (runBtn) runBtn.disabled = true;

  try {
    const prompt = buildGeminiAccountingPrompt(txText, activeAiContext.journalKey, currentCurrency);
    const solution = await callGeminiApi(prompt, apiKey);

    activeAiContext.solution = solution;

    renderSolutionPreview(activeAiContext.journalKey, solution.fields);

    const expContent = document.getElementById('ai-explanation-content');
    if (expContent) {
      expContent.textContent = solution.explanation || 'No detailed explanation provided.';
    }

    if (resultEl) resultEl.style.display = 'block';
    if (applyBtn) applyBtn.style.display = 'inline-block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message || 'An error occurred while solving with Gemini.';
      errorEl.style.display = 'block';
    }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
    if (runBtn) runBtn.disabled = false;
  }
}

// ============================================================
// START
// ============================================================

init();
