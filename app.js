/* ============================================================
   Accounting Practice System - app.js
   ============================================================ */

'use strict';

// ============================================================
// STATE
// ============================================================

let mode = 'guided'; // 'guided' | 'free'

const journals = {
  crj: [],
  cpj: [],
  pcj: []
};

// ============================================================
// SCHEMA DEFINITIONS
// ============================================================

const schemas = {
  crj: [
    { key: 'docNo',                   label: 'Doc No',                   type: 'text'   },
    { key: 'day',                     label: 'Day',                      type: 'number' },
    { key: 'details',                 label: 'Details',                  type: 'text',
      guidedOptions: ['Sales', 'Capital', 'Rent income', 'Trade receivables', 'Interest income', 'Commission received'] },
    { key: 'analysisOfReceipts',      label: 'Analysis of Receipts',     type: 'number' },
    { key: 'bank',                    label: 'Bank',                     type: 'number' },
    { key: 'sales',                   label: 'Sales',                    type: 'number' },
    { key: 'tradeReceivablesControl', label: 'Trade Receivables Control', type: 'number' },
    { key: 'sundryAmount',            label: 'Sundry Amount',            type: 'number' },
    { key: 'fol',                     label: 'Fol',                      type: 'text', fol: true },
    { key: 'sundryDetails',           label: 'Sundry Details',           type: 'text',
      guidedOptions: ['Capital', 'Rent income', 'Interest income', 'Commission received', 'Drawings'] }
  ],
  cpj: [
    { key: 'docNo',                 label: 'Doc No',                   type: 'text'   },
    { key: 'day',                   label: 'Day',                      type: 'number' },
    { key: 'payee',                 label: 'Payee',                    type: 'text',
      guidedOptions: ['Cash', 'Waltons', 'P Pink', 'AA Traders', 'Uzbek printers', 'Fieri Design', 'CNA', 'Markell Ltd', 'Mr Krisel', 'Dulux', 'Dassin Motors', 'PostNet', 'Bela Belay Ltd', 'Holman Traders', 'Coca Cola', 'Standard Bank', 'Engen'] },
    { key: 'bank',                  label: 'Bank',                     type: 'number' },
    { key: 'wages',                 label: 'Wages',                    type: 'number' },
    { key: 'purchases',             label: 'Purchases',                type: 'number' },
    { key: 'tradePayablesControl',  label: 'Trade Payables Control',   type: 'number' },
    { key: 'sundryAmount',          label: 'Sundry Amount',            type: 'number' },
    { key: 'fol',                   label: 'Fol',                      type: 'text', fol: true },
    { key: 'sundryDetails',         label: 'Sundry Details',           type: 'text',
      guidedOptions: ['Furniture', 'Equipment', 'Vehicle', 'Drawings', 'Wages', 'Rent expense', 'Interest expense', 'Stationery', 'Repairs', 'Trading stock', 'Trade payables control'] }
  ],
  pcj: [
    { key: 'docNo',         label: 'Doc No',            type: 'text'   },
    { key: 'day',           label: 'Day',               type: 'number' },
    { key: 'details',       label: 'Details',           type: 'text',
      guidedOptions: ['Stamps', 'Cleaning', 'Envelopes', 'Milk and coffee', 'Wages', 'Postage', 'Stationery', 'Refreshments', 'Drawings', 'Donations', 'Petrol', 'Sundry expenses'] },
    { key: 'pettyCashTotal', label: 'Petty Cash / Total', type: 'number' },
    { key: 'wages',         label: 'Wages',             type: 'number' },
    { key: 'postage',       label: 'Postage',           type: 'number' },
    { key: 'stationery',    label: 'Stationery',        type: 'number' },
    { key: 'sundryAmount',  label: 'Sundry Amount',     type: 'number' },
    { key: 'fol',           label: 'Fol',               type: 'text', fol: true },
    { key: 'sundryDetails', label: 'Sundry Details',    type: 'text',
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
  return row;
}

// ============================================================
// INIT
// ============================================================

function init() {
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

      const useSelect = mode === 'guided' && col.guidedOptions;

      if (useSelect) {
        const select = document.createElement('select');
        select.dataset.key = col.key;
        select.dataset.rowIndex = rowIndex;

        const blankOpt = document.createElement('option');
        blankOpt.value = '';
        blankOpt.textContent = '-- select --';
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
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'x';
    removeBtn.title = 'Remove row';
    removeBtn.addEventListener('click', () => removeRow(journalKey, rowIndex));
    actionTd.appendChild(removeBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });

  tbody.addEventListener('input', (e) => handleCellInput(e, journalKey));
  tbody.addEventListener('change', (e) => handleCellInput(e, journalKey));
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
      td.textContent = round2(totals[col.key]).toFixed(2);
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
      html += `<tr><td>${colLabel}</td><td>${round2(totals[colKey]).toFixed(2)}</td></tr>`;
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
    TextRun, HeadingLevel, WidthType
  } = docx;

  const journalDefs = [
    { key: 'crj', label: 'Cash Receipts Journal (CRJ)' },
    { key: 'cpj', label: 'Cash Payments Journal (CPJ)' },
    { key: 'pcj', label: 'Petty Cash Journal (PCJ)'    }
  ];

  function makeCell(text, bold) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text: String(text || ''), bold: !!bold, size: 18 })]
        })
      ],
      margins: { top: 60, bottom: 60, left: 80, right: 80 }
    });
  }

  const docSections = [];

  journalDefs.forEach(({ key, label }) => {
    const schema = schemas[key];
    const rows   = journals[key];
    const totals = computeTotals(key);

    const headerCells = schema.map(col => makeCell(col.label, true));
    const headerRow = new TableRow({ children: headerCells, tableHeader: true });

    const dataRows = rows.map(rowData => {
      const cells = schema.map(col => makeCell(rowData[col.key] || ''));
      return new TableRow({ children: cells });
    });

    const totalsCells = schema.map((col, idx) => {
      if (idx === 0) return makeCell('Totals', true);
      if (numericKeys[key].includes(col.key)) {
        return makeCell(round2(totals[col.key]).toFixed(2), true);
      }
      return makeCell('');
    });
    const totalsRow = new TableRow({ children: totalsCells });

    const docTable = new Table({
      rows: [headerRow, ...dataRows, totalsRow],
      width: { size: 100, type: WidthType.PERCENTAGE }
    });

    docSections.push(
      new Paragraph({
        text: label,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      }),
      docTable,
      new Paragraph({ text: '', spacing: { after: 200 } })
    );
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: 'Accounting Journals',
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
// START
// ============================================================

init();
