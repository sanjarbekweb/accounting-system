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

// Placeholders — filled in subsequent commits
function onFinish() {}
function onDownload() {}

// ============================================================
// START
// ============================================================

init();
