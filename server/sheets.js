const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Column headers — these must match row 1 of your Google Sheet exactly.
const HEADERS = [
  'Date',
  'Employee Name',
  'Project Name',
  'Plan / Unplan Project',
  'Type of Work',
  'Work Description',
  'Page URL',
  'Status',
  'Effort Time in Mins',
  'Assigned by',
];

let cachedDoc = null;

async function getDoc() {
  if (cachedDoc) return cachedDoc;

  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt);
  await doc.loadInfo();
  cachedDoc = doc;
  return doc;
}

async function getSheet() {
  const doc = await getDoc();
  const tabName = process.env.GOOGLE_SHEET_TAB || 'Sheet1';
  let sheet = doc.sheetsByTitle[tabName];

  if (!sheet) {
    // Create the tab with headers if it doesn't exist yet
    sheet = await doc.addSheet({ title: tabName, headerValues: HEADERS });
  } else {
    // Make sure headers exist / match
    await sheet.loadHeaderRow().catch(async () => {
      await sheet.setHeaderRow(HEADERS);
    });
  }

  return sheet;
}

async function appendEntry(entry) {
  const sheet = await getSheet();
  const row = await sheet.addRow({
    'Date': entry.date,
    'Employee Name': entry.employeeName,
    'Project Name': entry.projectName,
    'Plan / Unplan Project': entry.planStatus,
    'Type of Work': entry.workType,
    'Work Description': entry.workDescription,
    'Page URL': entry.pageUrl,
    'Status': entry.status,
    'Effort Time in Mins': entry.effortMins,
    'Assigned by': entry.assignedBy,
  });
  return row;
}

async function fetchRecentEntries(limit = 20) {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  return rows
    .slice(-limit)
    .reverse()
    .map((r) => ({
      date: r.get('Date'),
      employeeName: r.get('Employee Name'),
      projectName: r.get('Project Name'),
      planStatus: r.get('Plan / Unplan Project'),
      workType: r.get('Type of Work'),
      workDescription: r.get('Work Description'),
      pageUrl: r.get('Page URL'),
      status: r.get('Status'),
      effortMins: r.get('Effort Time in Mins'),
      assignedBy: r.get('Assigned by'),
    }));
}

async function findNextEntryRow(sheet) {
  await sheet.loadCells(`A2:A${sheet.rowCount}`);

  for (let rowNumber = sheet.rowCount; rowNumber >= 2; rowNumber -= 1) {
    const value = sheet.getCell(rowNumber - 1, 0).value;
    if (value != null && !(typeof value === 'string' && value.trim() === '')) {
      return rowNumber + 1;
    }
  }

  return 2;
}

async function getNextEntryRow() {
  const sheet = await getSheet();
  return findNextEntryRow(sheet);
}

async function addEntryBelowLastFilledRow(entry) {
  const sheet = await getSheet();
  const rowNumber = await findNextEntryRow(sheet);
  if (rowNumber > sheet.rowCount) {
    const row = await appendEntry(entry);
    return { row: row.rowNumber };
  }
  return writeEntryAtRow(rowNumber, entry);
}

/**
 * Writes an entry into a specific row number (1-indexed, matching the
 * row numbers you see in Google Sheets). Overwrites whatever is there.
 */
async function writeEntryAtRow(rowNumber, entry) {
  const sheet = await getSheet();
  if (rowNumber > sheet.rowCount) {
    await sheet.addRows(rowNumber - sheet.rowCount);
  }
  const range = `A${rowNumber}:J${rowNumber}`;
  await sheet.loadCells(range);

  const values = [
    entry.date,
    entry.employeeName,
    entry.projectName,
    entry.planStatus,
    entry.workType,
    entry.workDescription,
    entry.pageUrl,
    entry.status,
    entry.effortMins,
    entry.assignedBy,
  ];

  values.forEach((val, i) => {
    const cell = sheet.getCell(rowNumber - 1, i); // 0-indexed internally
    cell.value = val ?? '';
  });

  await sheet.saveUpdatedCells();
  return { row: rowNumber };
}

module.exports = {
  addEntryBelowLastFilledRow,
  appendEntry,
  fetchRecentEntries,
  getNextEntryRow,
  HEADERS,
  writeEntryAtRow,
};
