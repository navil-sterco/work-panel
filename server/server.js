require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  addEntryBelowLastFilledRow,
  fetchRecentEntries,
  getNextEntryRow,
} = require("./sheets");
const { cleanWorkDescription } = require("./textCleanup");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Get recent entries (reads back from the sheet)
app.get("/api/entries", async (req, res) => {
  try {
    const entries = await fetchRecentEntries(20);
    res.json({ entries });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        error: "Failed to read from Google Sheet",
        details: err.message,
      });
  }
});

app.get("/api/entries/next-row", async (req, res) => {
  try {
    const row = await getNextEntryRow();
    res.json({ row });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to determine the next row", details: err.message });
  }
});

// Preview-only: clean up description text without saving anything
app.post("/api/clean-description", async (req, res) => {
  try {
    const { text } = req.body;
    const cleaned = await cleanWorkDescription(text);
    res.json({ cleaned });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to clean description", details: err.message });
  }
});

// Add a new entry — appends a row to the Google Sheet
app.post("/api/entries", async (req, res) => {
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
    } = req.body;

    if (!date || !employeeName || !projectName) {
      return res
        .status(400)
        .json({ error: "date, employeeName and projectName are required" });
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

    const result = await addEntryBelowLastFilledRow(entryData);
    res.status(201).json({ ok: true, row: result.row });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to write to Google Sheet", details: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Work log server running on http://localhost:${PORT}`);
  });
}
module.exports = app;
