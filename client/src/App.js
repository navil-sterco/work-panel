import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const WORK_TYPES = [
  "Project Setup",
  "Backend Setup",
  "Frontend Integration",
  "Help",
  "Testing",
  "Version Update",
  "Payment Gatway",
  "AMC Work",
  "CMS Integration",
  "Module Integration",
  "Banner Integration",
  "Live",
  "Live Testing",
  "Functionality Testing",
  "SEO Migration",
  "R&D",
  "Ongoing New Development",
  "API Integration",
  "API Development",
  "DevOps",
  "Database Migration",
  "Website Migration",
  "Other Feedback",
  "Upload to demo",
  "Security Module",
  "Server Configured",
  "Meeting",
  "GSC SEO Audits",
  "Feedback",
];
const STATUSES = ["Done", "In Progress", "Pending"];
const PLAN_OPTIONS = ["Planned", "UnPlanned", "New"];
const API_BASE =
  process.env.REACT_APP_API_BASE || "https://work-panel-u6fu.vercel.app";

async function fetchNextRow() {
  const res = await fetch(`${API_BASE}/api/entries/next-row`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Could not determine the next row.");
  }
  return data.row;
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  employeeName: "Navil Faisal",
  projectName: "",
  planStatus: "Planned",
  workType: [WORK_TYPES[0]],
  workDescription: "",
  pageUrl: "",
  status: STATUSES[0],
  effortMins: "",
  assignedBy: "",
  targetRow: "",
};

function Icon({ name, size = 20 }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    folder: (
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    note: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    hash: (
      <>
        <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
        <path d="m19 14 1.1 2.4L22 17l-1.9.6L19 20l-.8-2.4L16 17l2.2-.6z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function WorkTypeMultiSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef(null);
  const listboxId = "work-type-options";

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const toggleOption = (option) => {
    onChange(
      value.includes(option)
        ? value.filter((selected) => selected !== option)
        : [...value, option],
    );
  };
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="multi-select" ref={pickerRef}>
      <button
        type="button"
        className={`multi-select-trigger${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby="work-type-label"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span
          className={
            value.length ? "multi-select-value" : "multi-select-placeholder"
          }
        >
          {value.length
            ? `${value.length} work type${value.length === 1 ? "" : "s"} selected`
            : "Choose work types"}
        </span>
        <Icon name="chevron" size={17} />
      </button>

      {value.length > 0 && (
        <div className="selected-tags" aria-label="Selected work types">
          {value.map((item) => (
            <span className="selected-tag" key={item}>
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => toggleOption(item)}
              >
                <Icon name="close" size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="multi-select-menu">
          <div className="multi-select-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              aria-label="Search work types"
              placeholder="Search work types..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            />
          </div>
          <div
            className="multi-select-options"
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = value.includes(option);
                return (
                  <div
                    className={`multi-select-option${selected ? " is-selected" : ""}`}
                    key={option}
                    role="option"
                    aria-selected={selected}
                    tabIndex={0}
                    onClick={() => toggleOption(option)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleOption(option);
                      }
                    }}
                  >
                    <span className="option-check">
                      {selected && <Icon name="check" size={13} />}
                    </span>
                    <span>{option}</span>
                  </div>
                );
              })
            ) : (
              <div className="multi-select-empty">No matching work types.</div>
            )}
          </div>
          <div className="multi-select-footer">{value.length} selected</div>
        </div>
      )}
    </div>
  );
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const enterDigit = (digit) => {
    setDisplay((current) =>
      waitingForOperand || current === "0" || current === "Error"
        ? digit
        : current + digit,
    );
    setWaitingForOperand(false);
  };

  const enterDecimal = () => {
    setDisplay((current) => {
      if (waitingForOperand || current === "Error") return "0.";
      return current.includes(".") ? current : `${current}.`;
    });
    setWaitingForOperand(false);
  };

  const calculate = (left, right, operation) => {
    switch (operation) {
      case "+":
        return left + right;
      case "−":
        return left - right;
      case "×":
        return left * right;
      case "÷":
        return right === 0 ? null : left / right;
      default:
        return right;
    }
  };

  const chooseOperator = (nextOperator) => {
    const currentValue = Number(display);
    if (!Number.isFinite(currentValue)) return;

    if (operator && !waitingForOperand) {
      const result = calculate(storedValue, currentValue, operator);
      if (result === null) {
        setDisplay("Error");
        setStoredValue(null);
        setOperator(null);
        setWaitingForOperand(false);
        return;
      }
      setDisplay(String(result));
      setStoredValue(result);
    } else if (storedValue === null) {
      setStoredValue(currentValue);
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const showResult = () => {
    if (!operator || storedValue === null || waitingForOperand) return;
    const result = calculate(storedValue, Number(display), operator);
    setDisplay(result === null ? "Error" : String(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const clear = () => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const buttons = [
    { label: "C", action: clear, className: "calculator-clear" },
    { label: "÷", action: () => chooseOperator("÷"), className: "calculator-operator" },
    { label: "7", action: () => enterDigit("7") },
    { label: "8", action: () => enterDigit("8") },
    { label: "9", action: () => enterDigit("9") },
    { label: "×", action: () => chooseOperator("×"), className: "calculator-operator" },
    { label: "4", action: () => enterDigit("4") },
    { label: "5", action: () => enterDigit("5") },
    { label: "6", action: () => enterDigit("6") },
    { label: "−", action: () => chooseOperator("−"), className: "calculator-operator" },
    { label: "1", action: () => enterDigit("1") },
    { label: "2", action: () => enterDigit("2") },
    { label: "3", action: () => enterDigit("3") },
    { label: "+", action: () => chooseOperator("+"), className: "calculator-operator" },
    { label: "0", action: () => enterDigit("0"), className: "calculator-zero" },
    { label: ".", action: enterDecimal },
    { label: "=", action: showResult, className: "calculator-equals" },
  ];

  return (
    <aside className="calculator-card" aria-label="Calculator">
      <div className="calculator-heading">
        <h2>Calculator</h2>
        <p>Quick calculations while you log work.</p>
      </div>
      <output className="calculator-display" aria-live="polite">
        {display}
      </output>
      <div className="calculator-buttons">
        {buttons.map(({ label, action, className = "" }) => (
          <button
            type="button"
            key={label}
            className={`calculator-button ${className}`}
            onClick={action}
            aria-label={
              label === "C"
                ? "Clear calculator"
                : label === "="
                  ? "Calculate result"
                  : label
            }
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function App() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [descriptionLines, setDescriptionLines] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [nextRow, setNextRow] = useState(null);
  const [loadingNextRow, setLoadingNextRow] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNextRow()
      .then((row) => {
        if (!cancelled) setNextRow(row);
      })
      .catch(() => {
        if (!cancelled) setError("Could not determine the next row to add.");
      })
      .finally(() => {
        if (!cancelled) setLoadingNextRow(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleEffortChange = (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      effortMins:
        value === ""
          ? ""
          : String(Math.round(Math.min(1000, Math.max(0, Number(value))))),
    }));
  };

  const handleCleanDescription = async () => {
    if (!form.workDescription.trim()) return;
    const numberOfLines = descriptionLines.trim()
      ? Number(descriptionLines)
      : 5;
    if (!Number.isSafeInteger(numberOfLines) || numberOfLines < 1) {
      setError("Enter a whole number of lines greater than zero.");
      return;
    }
    setError("");
    setCleaning(true);
    try {
      const res = await fetch(`${API_BASE}/api/clean-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.workDescription,
          numberOfLines,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not clean up the text.");
        return;
      }
      setForm((f) => ({ ...f, workDescription: data.cleaned }));
    } catch (err) {
      setError("Failed to reach the server.");
    } finally {
      setCleaning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast("");

    if (!form.employeeName.trim() || !form.projectName.trim()) {
      setError("Employee name and project name are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save entry.");
        return;
      }
      setToast(data.row);
      setForm((f) => ({
        ...emptyForm,
        date: f.date,
        employeeName: f.employeeName,
        assignedBy: f.assignedBy,
      }));
      try {
        setNextRow(await fetchNextRow());
      } catch {
        setNextRow(null);
        setError("Entry was saved, but the next row could not be refreshed.");
      }
    } catch (err) {
      setError("Failed to reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="masthead">
        <div>
          <span className="eyebrow">WORKSPACE / DAILY TRACKING</span>
          <h1>Work log</h1>
          <p className="sub">
            Capture your progress and keep the team in sync.
          </p>
        </div>
        <span className="header-mark">
          <Icon name="layers" size={23} />
        </span>
      </header>

      <main className="layout-with-sidebar">
        <form className="entry-form form-card" onSubmit={handleSubmit}>
          <div className="card-heading">
            <span className="card-icon icon-purple">
              <Icon name="briefcase" />
            </span>
            <div>
              <h2>Log your work</h2>
              <p>Capture a task and save it directly to the work log.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span className="field-label">
                <Icon name="calendar" size={17} /> Date
              </span>
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                required
              />
            </label>
            <label>
              <span className="field-label">
                <Icon name="user" size={17} /> Employee name
              </span>
              <input
                type="text"
                value={form.employeeName}
                onChange={handleChange("employeeName")}
                placeholder="e.g. Navil Faisal"
                required
              />
            </label>
            <label>
              <span className="field-label">
                <Icon name="folder" size={17} /> Project name
              </span>
              <input
                type="text"
                value={form.projectName}
                onChange={handleChange("projectName")}
                placeholder="e.g. Jnu Jaipur"
                required
              />
            </label>
            <label>
              <span className="field-label">
                <Icon name="layers" size={17} /> Plan / Unplanned
              </span>
              <select
                value={form.planStatus}
                onChange={handleChange("planStatus")}
              >
                {PLAN_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="field-group">
              <span className="field-label" id="work-type-label">
                <Icon name="layers" size={17} /> Type of work
              </span>
              <WorkTypeMultiSelect
                options={WORK_TYPES}
                value={form.workType}
                onChange={(workType) => setForm((f) => ({ ...f, workType }))}
              />
              <span className="field-hint">Select one or more work types.</span>
            </div>
            <label>
              <span className="field-label">
                <Icon name="check" size={17} /> Status
              </span>
              <select value={form.status} onChange={handleChange("status")}>
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="effort-field">
              <span className="field-label">
                <Icon name="clock" size={17} /> Effort (mins)
              </span>
              <span className="effort-input-row">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={form.effortMins === "" ? 0 : form.effortMins}
                  onChange={handleEffortChange}
                  aria-label="Effort in minutes slider"
                />
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={form.effortMins}
                  onChange={handleEffortChange}
                  placeholder="0"
                  aria-label="Effort in minutes"
                />
              </span>
              <span className="range-labels">
                <span>0 min</span>
                <span>1000 min</span>
              </span>
            </label>
            <label>
              <span className="field-label">
                <Icon name="link" size={17} /> Page URL
              </span>
              <input
                type="text"
                value={form.pageUrl}
                onChange={handleChange("pageUrl")}
                placeholder="Optional"
              />
            </label>
            <div className="field-group description-field">
              <span className="label-row">
                <label className="field-label" htmlFor="work-description">
                  <Icon name="note" size={17} /> Work description
                </label>
                <span className="description-tools">
                  <label className="line-count-field" htmlFor="description-lines">
                    Lines
                    <input
                      id="description-lines"
                      type="number"
                      min="1"
                      step="1"
                      value={descriptionLines}
                      onChange={(event) =>
                        setDescriptionLines(event.target.value)
                      }
                      placeholder="5"
                      aria-label="Number of work description lines"
                    />
                  </label>
                  <button
                    type="button"
                    className="clean-btn"
                    onClick={handleCleanDescription}
                    disabled={cleaning || !form.workDescription.trim()}
                  >
                    <Icon name="sparkle" size={15} />
                    {cleaning ? "Cleaning…" : "Clean up wording"}
                  </button>
                </span>
              </span>
              <span className="field-hint">
                Leave lines blank to generate 5 lines.
              </span>
              <textarea
                id="work-description"
                rows={3}
                value={form.workDescription}
                onChange={handleChange("workDescription")}
                placeholder="What did you work on? Write it roughly — you can clean it up before saving."
              />
            </div>
            <label>
              <span className="field-label">
                <Icon name="hash" size={17} /> Row number (optional)
              </span>
              <input
                type="number"
                min="2"
                step="1"
                value={form.targetRow}
                onChange={handleChange("targetRow")}
                placeholder="Leave blank for next row"
              />
            </label>
            <label>
              <span className="field-label">
                <Icon name="user" size={17} /> Assigned by
              </span>
              <input
                type="text"
                value={form.assignedBy}
                onChange={handleChange("assignedBy")}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="row-preview" role="status" aria-live="polite">
            <span className="row-preview-icon">
              <Icon name="check" size={18} />
            </span>
            <span>
              {form.targetRow ? (
                <>
                  Entry will be written to row <strong>{form.targetRow}</strong>
                </>
              ) : loadingNextRow ? (
                "Checking next row…"
              ) : nextRow ? (
                <>
                  Blank row number uses the next available row:{" "}
                  <strong>{nextRow}</strong>
                </>
              ) : (
                "Next row number is unavailable."
              )}
            </span>
          </div>

          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          {toast && (
            <div className="notice success" role="status">
              Entry added to row <strong>{toast}</strong>
            </div>
          )}

          <div className="form-actions">
            <span className="save-hint">
              Your entry will be saved to the work log sheet.
            </span>
            <button type="submit" disabled={submitting}>
              {submitting ? (
                "Saving…"
              ) : (
                <>
                  <Icon name="check" size={18} /> Add entry
                </>
              )}
            </button>
          </div>
        </form>
        <Calculator />
      </main>
    </div>
  );
}

export default App;
