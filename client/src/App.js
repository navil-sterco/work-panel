import React, { useState } from 'react';
import './App.css';

// These match the dropdown options already set up in the Google Sheet.
// If your sheet has more "Type of Work" options below "API Integration",
// or more "Status" options beyond Planned/Done, send them and I'll add them.
const WORK_TYPES = [
  'AMC Work',
  'CMS Integration',
  'Module Integration',
  'Banner Integration',
  'Live',
  'Live Testing',
  'Functionality Testing',
  'SEO Migration',
  'R&D',
  'Ongoing New Development',
  'API Integration',
];
const STATUSES = ['Planned', 'Done'];
const PLAN_OPTIONS = ['Planned', 'Unplanned'];

// Read from client/.env (REACT_APP_API_BASE). Falls back to localhost:8000
// if the env var isn't set, so the app still works out of the box.
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  employeeName: 'Navil Faisal',
  projectName: '',
  planStatus: 'Planned',
  workType: WORK_TYPES[0],
  workDescription: '',
  pageUrl: '',
  status: STATUSES[0],
  effortMins: '',
  assignedBy: '',
  targetRow: '',
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleCleanDescription = async () => {
    if (!form.workDescription.trim()) return;
    setError('');
    setCleaning(true);
    try {
      const res = await fetch(`${API_BASE}/api/clean-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: form.workDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not clean up the text.');
        return;
      }
      // Puts the rewritten text back into the box — you can still edit it
      // by hand before submitting.
      setForm((f) => ({ ...f, workDescription: data.cleaned }));
    } catch (err) {
      setError('Failed to reach the server.');
    } finally {
      setCleaning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToast('');

    if (!form.employeeName.trim() || !form.projectName.trim()) {
      setError('Employee name and project name are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save entry.');
        return;
      }
      setToast('Row added to the sheet.');
      setForm((f) => ({
        ...emptyForm,
        date: f.date,
        employeeName: f.employeeName,
        assignedBy: f.assignedBy,
      }));
    } catch (err) {
      setError('Failed to reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="masthead">
        <h1>Work Log</h1>
        <p className="sub">Fill this in — it writes straight into the Google Sheet.</p>
      </header>

      <main className="layout-single">
        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="grid-2">
            <label>
              Date
              <input type="date" value={form.date} onChange={handleChange('date')} required />
            </label>
            <label>
              Employee name
              <input
                type="text"
                value={form.employeeName}
                onChange={handleChange('employeeName')}
                placeholder="e.g. Navil Faisal"
                required
              />
            </label>
          </div>

          <div className="grid-2">
            <label>
              Project name
              <input
                type="text"
                value={form.projectName}
                onChange={handleChange('projectName')}
                placeholder="e.g. Jnu Jaipur"
                required
              />
            </label>
            <label>
              Plan / Unplanned
              <select value={form.planStatus} onChange={handleChange('planStatus')}>
                {PLAN_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid-2">
            <label>
              Type of work
              <select value={form.workType} onChange={handleChange('workType')}>
                {WORK_TYPES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={handleChange('status')}>
                {STATUSES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="full">
            <span className="label-row">
              Work description
              <button
                type="button"
                className="clean-btn"
                onClick={handleCleanDescription}
                disabled={cleaning || !form.workDescription.trim()}
              >
                {cleaning ? 'Cleaning…' : 'Clean up wording'}
              </button>
            </span>
            <textarea
              rows={5}
              value={form.workDescription}
              onChange={handleChange('workDescription')}
              placeholder="What did you work on? Write it roughly — you can clean it up before saving."
            />
          </label>

          <div className="grid-2">
            <label>
              Page URL
              <input type="text" value={form.pageUrl} onChange={handleChange('pageUrl')} placeholder="Optional" />
            </label>
            <label>
              Effort (mins)
              <input
                type="number"
                min="0"
                value={form.effortMins}
                onChange={handleChange('effortMins')}
                placeholder="e.g. 300"
              />
            </label>
          </div>

          <label className="full">
            Row number (optional)
            <input
              type="number"
              min="2"
              value={form.targetRow}
              onChange={handleChange('targetRow')}
              placeholder="Leave blank to add at the end — entering a number overwrites that row"
            />
          </label>

          <label className="full">
            Assigned by
            <input type="text" value={form.assignedBy} onChange={handleChange('assignedBy')} placeholder="Optional" />
          </label>

          {error && <div className="notice error">{error}</div>}
          {toast && <div className="notice ok">{toast}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Add to sheet'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
