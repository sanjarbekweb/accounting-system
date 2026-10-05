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
    { key: 'payee',                 label: 'Payee',                    type: 'text'   },
    { key: 'bank',                  label: 'Bank',                     type: 'number' },
    { key: 'wages',                 label: 'Wages',                    type: 'number' },
    { key: 'purchases',             label: 'Purchases',                type: 'number' },
    { key: 'tradePayablesControl',  label: 'Trade Payables Control',   type: 'number' },
    { key: 'sundryAmount',          label: 'Sundry Amount',            type: 'number' },
    { key: 'fol',                   label: 'Fol',                      type: 'text', fol: true },
    { key: 'sundryDetails',         label: 'Sundry Details',           type: 'text',
      guidedOptions: ['Furniture', 'Equipment', 'Vehicle', 'Drawings', 'Wages', 'Rent expense', 'Interest expense', 'Stationery', 'Trade payables control'] }
  ],
  pcj: [
    { key: 'docNo',         label: 'Doc No',            type: 'text'   },
    { key: 'day',           label: 'Day',               type: 'number' },
    { key: 'details',       label: 'Details',           type: 'text',
      guidedOptions: ['Refreshments', 'Drawings', 'Cleaning', 'Donations', 'Petrol', 'Sundry expenses'] },
    { key: 'pettyCashTotal', label: 'Petty Cash / Total', type: 'number' },
    { key: 'wages',         label: 'Wages',             type: 'number' },
    { key: 'postage',       label: 'Postage',           type: 'number' },
    { key: 'stationery',    label: 'Stationery',        type: 'number' },
    { key: 'sundryAmount',  label: 'Sundry Amount',     type: 'number' },
    { key: 'fol',           label: 'Fol',               type: 'text', fol: true },
    { key: 'sundryDetails', label: 'Sundry Details',    type: 'text',
      guidedOptions: ['Refreshments', 'Drawings', 'Cleaning', 'Donations', 'Petrol', 'Sundry expenses'] }
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

function validateJournal(journalKey) {
  const errors = [];
  const journalLabel = { crj: 'CRJ', cpj: 'CPJ', pcj: 'PCJ' }[journalKey];

  journals[journalKey].forEach((row, i) => {
    const rowNum = i + 1;

    if (row.day !== '' && row.day !== undefined) {
      const day = parseInt(row.day, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        errors.push(`${journalLabel} Row ${rowNum}: Day must be between 1 and 31.`);
      }
    }

    const sundryAmt = parseFloat(row.sundryAmount);
    if (!isNaN(sundryAmt) && sundryAmt > 0 && (!row.sundryDetails || row.sundryDetails.trim() === '')) {
      errors.push(`${journalLabel} Row ${rowNum}: Sundry Amount entered but Sundry Details is missing.`);
    }

    if (journalKey === 'crj') {
      const aor = parseFloat(row.analysisOfReceipts);
      const s   = parseFloat(row.sales);
      const trc = parseFloat(row.tradeReceivablesControl);
      const sa  = parseFloat(row.sundryAmount);
      if (!isNaN(aor) && !isNaN(s) && !isNaN(trc) && !isNaN(sa)) {
        const expected = round2(s + trc + sa);
        if (Math.abs(round2(aor) - expected) > 0.001) {
          errors.push(`CRJ Row ${rowNum}: Analysis of Receipts (${aor}) does not match column breakdown (Sales + Trade Receivables Control + Sundry Amount = ${expected}).`);
        }
      }
    }

    if (journalKey === 'cpj') {
      const bank = parseFloat(row.bank);
      const w    = parseFloat(row.wages);
      const p    = parseFloat(row.purchases);
      const tpc  = parseFloat(row.tradePayablesControl);
      const sa   = parseFloat(row.sundryAmount);
      if (!isNaN(bank) && !isNaN(w) && !isNaN(p) && !isNaN(tpc) && !isNaN(sa)) {
        const expected = round2(w + p + tpc + sa);
        if (Math.abs(round2(bank) - expected) > 0.001) {
          errors.push(`CPJ Row ${rowNum}: Bank (${bank}) does not match column breakdown (Wages + Purchases + Trade Payables Control + Sundry Amount = ${expected}).`);
        }
      }
    }

    if (journalKey === 'pcj') {
      const pct = parseFloat(row.pettyCashTotal);
      const w   = parseFloat(row.wages);
      const po  = parseFloat(row.postage);
      const st  = parseFloat(row.stationery);
      const sa  = parseFloat(row.sundryAmount);
      if (!isNaN(pct) && !isNaN(w) && !isNaN(po) && !isNaN(st) && !isNaN(sa)) {
        const expected = round2(w + po + st + sa);
        if (Math.abs(round2(pct) - expected) > 0.001) {
          errors.push(`PCJ Row ${rowNum}: Petty Cash / Total (${pct}) does not match column breakdown (Wages + Postage + Stationery + Sundry Amount = ${expected}).`);
        }
      }
    }
  });

  return errors;
}

// ============================================================
// ON FINISH
// ============================================================

function onFinish() {
  syncStateFromDOM();

  const allErrors = [
    ...validateJournal('crj'),
    ...validateJournal('cpj'),
    ...validateJournal('pcj')
  ];

  const crjTotals = computeTotals('crj');
  const cpjTotals = computeTotals('cpj');
  const pcjTotals = computeTotals('pcj');

  const panel = document.getElementById('results-panel');
  panel.style.display = 'block';

  let html = '<h3>Results</h3>';

  html += '<div class="totals-panel">';
  html += '<h4>Totals</h4>';

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
    html += '<h4>Errors</h4>';
    html += '<ul>';
    allErrors.forEach(err => {
      html += `<li>${escapeHtml(err)}</li>`;
    });
    html += '</ul></div>';
  } else {
    html += '<div class="no-errors-panel"><p>No errors found — your entries look correct.</p></div>';
  }

  panel.innerHTML = html;
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onDownload() {}

// ============================================================
// START
// ============================================================

init();
