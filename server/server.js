require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { appendEntry, fetchRecentEntries, writeEntryAtRow } = require('./sheets');
const { cleanWorkDescription } = require('./textCleanup');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Get recent entries (reads back from the sheet)
app.get('/api/entries', async (req, res) => {
  try {
    const entries = await fetchRecentEntries(20);
    res.json({ entries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read from Google Sheet', details: err.message });
  }
});

// Preview-only: clean up description text without saving anything
app.post('/api/clean-description', async (req, res) => {
  try {
    const { text } = req.body;
    const cleaned = await cleanWorkDescription(text);
    res.json({ cleaned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clean description', details: err.message });
  }
});

// Add a new entry — appends a row to the Google Sheet
app.post('/api/entries', async (req, res) => {
  try {
    const {
      date,
      employeeName,
      projectName,
      planStatus,
      workType,
      workDescription,
      pageUrl,
      status,
      effortMins,
      assignedBy,
      targetRow, // optional — write to this exact row instead of appending
    } = req.body;

    if (!date || !employeeName || !projectName) {
      return res.status(400).json({ error: 'date, employeeName and projectName are required' });
    }

    const entryData = {
      date,
      employeeName,
      projectName,
      planStatus,
      workType,
      workDescription,
      pageUrl,
      status,
      effortMins,
      assignedBy,
    };

    if (targetRow) {
      const result = await writeEntryAtRow(Number(targetRow), entryData);
      return res.status(201).json({ ok: true, row: result });
    }

    const row = await appendEntry(entryData);
    res.status(201).json({ ok: true, row: row.toObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to write to Google Sheet', details: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Work log server running on http://localhost:${PORT}`);
});
