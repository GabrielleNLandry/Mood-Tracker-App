import React, { useEffect, useMemo, useReducer, useState } from "react";

/** -------------------------
 *  Data & utilities
 *  -------------------------
 */
const MOODS = [
  { key: "great", label: "Great", emoji: "😄" },
  { key: "good", label: "Good", emoji: "🙂" },
  { key: "meh", label: "Meh", emoji: "😐" },
  { key: "bad", label: "Bad", emoji: "🙁" },
  { key: "awful", label: "Awful", emoji: "😣" },
];

const STORAGE = "mood_pwa_entries_v1";
const SETTINGS = "mood_pwa_settings_v1";

const todayISO = () => {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const loadEntries = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE) || "[]"); } catch { return []; }
};
const saveEntries = (e) => localStorage.setItem(STORAGE, JSON.stringify(e));

const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS) || "{}"); } catch { return {}; }
};
const saveSettings = (s) => localStorage.setItem(SETTINGS, JSON.stringify(s));

/** -------------------------
 *  State reducer
 *  -------------------------
 */
const initialState = {
  entries: loadEntries(),
  settings: { enableHints: true, startWeekOnMonday: false, ...loadSettings() },
};

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const next = [action.payload, ...state.entries].sort((a, b) => (a.date < b.date ? 1 : -1));
      saveEntries(next);
      return { ...state, entries: next };
    }
    case "update": {
      const next = state.entries.map((e) => (e.id === action.payload.id ? action.payload : e));
      saveEntries(next);
      return { ...state, entries: next };
    }
    case "delete": {
      const next = state.entries.filter((e) => e.id !== action.id);
      saveEntries(next);
      return { ...state, entries: next };
    }
    case "bulkReplace": {
      saveEntries(action.payload || []);
      return { ...state, entries: action.payload || [] };
    }
    case "settings": {
      const next = { ...state.settings, ...action.payload };
      saveSettings(next);
      return { ...state, settings: next };
    }
    default:
      return state;
  }
}

/** -------------------------
 *  UI helpers
 *  -------------------------
 */
function MoodPill({ mood, selected, onSelect }) {
  return (
    <button
      type="button"
      className="pill"
      aria-pressed={selected === mood.key}
      onClick={() => onSelect(mood.key)}
      title={mood.label}
    >
      <span style={{ fontSize: 20 }}>{mood.emoji}</span>
      <span>{mood.label}</span>
    </button>
  );
}

function EntryForm({ initial, onSave, showHints }) {
  const [date, setDate] = useState(initial?.date || todayISO());
  const [mood, setMood] = useState(initial?.mood || "good");
  const [note, setNote] = useState(initial?.note || "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      id: initial?.id || uid(),
      date,
      mood,
      note: note.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: initial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      {showHints && (
        <p className="muted" style={{ fontSize: 12 }}>
          Pick your mood and jot a quick note. Data is saved locally and works offline.
        </p>
      )}

      <div className="row">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="row">
        <label>Mood</label>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
          {MOODS.map((m) => (
            <MoodPill key={m.key} mood={m} selected={mood} onSelect={setMood} />
          ))}
        </div>
      </div>

      <div className="row">
        <label>Notes (optional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What influenced your mood?" />
      </div>

      <div className="row">
        <label>Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="sleep, workout, study" />
      </div>

      <div className="row" style={{ gridAutoFlow: "column", justifyContent: "start" }}>
        <button className="btn primary" type="submit">{initial ? "Update Entry" : "Save Entry"}</button>
      </div>
    </form>
  );
}

function EntryItem({ entry, onEdit, onDelete }) {
  const meta = MOODS.find((m) => m.key === entry.mood);
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 22 }}>{meta?.emoji}</div>
          <strong>{entry.date}</strong>
          <span className="tag">{meta?.label}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn icon" title="Edit" onClick={() => onEdit(entry)}>✏️</button>
          <button className="btn icon" title="Delete" onClick={() => onDelete(entry.id)}>🗑️</button>
        </div>
      </div>

      {!!entry.tags?.length && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {entry.tags.map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
        </div>
      )}

      {entry.note && (
        <p className="muted" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{entry.note}</p>
      )}
    </div>
  );
}

function Journal({ entries, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [mood, setMood] = useState("all");

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchQ = q ? (e.note || "").toLowerCase().includes(q.toLowerCase()) ||
        (e.tags || []).join(" ").toLowerCase().includes(q.toLowerCase()) : true;
      const matchMood = mood === "all" ? true : e.mood === mood;
      return matchQ && matchMood;
    });
  }, [entries, q, mood]);

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 8 }}>
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes or #tags" />
        <select value={mood} onChange={(e) => setMood(e.target.value)} aria-label="Filter mood">
          <option value="all">All moods</option>
          {MOODS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <p className="muted">No entries yet.</p>}

      <div className="grid" style={{ gap: 10 }}>
        {filtered.map((e) => (
          <EntryItem key={e.id} entry={e} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function Insights({ entries }) {
  const last7 = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      days.push(iso);
    }
    const map = Object.fromEntries(days.map((d) => [d, null]));
    entries.forEach((e) => { if (map.hasOwnProperty(e.date)) map[e.date] = e.mood; });
    return map;
  }, [entries]);

  const moodCounts = useMemo(() => {
    const counts = Object.fromEntries(MOODS.map((m) => [m.key, 0]));
    Object.values(last7).forEach((m) => { if (m && counts[m] !== undefined) counts[m]++; });
    return counts;
  }, [last7]);

  const streak = useMemo(() => {
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 1000; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      const has = entries.some((e) => e.date === iso);
      if (has) s++; else break;
    }
    return s;
  }, [entries]);

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <strong>Last 7 Days</strong>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {Object.entries(last7).map(([date, mood]) => {
            const m = MOODS.find((x) => x.key === mood);
            return (
              <div key={date} style={{ display: "grid", gap: 6, placeItems: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, border: "1px solid #e5e7eb",
                  display: "grid", placeItems: "center", fontSize: 22, opacity: m ? 1 : .4
                }}>
                  {m ? m.emoji : "–"}
                </div>
                <span className="muted" style={{ fontSize: 11 }}>{date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <strong>Streak</strong>
        <p style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{streak} day{streak === 1 ? "" : "s"}</p>
        <p className="muted" style={{ marginTop: 2 }}>Days in a row with at least one entry.</p>
      </div>

      <div className="card">
        <strong>Mood Totals (7 days)</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {MOODS.map((m) => (
            <span key={m.key} className="tag">{m.emoji} {m.label}: {moodCounts[m.key]}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPane({ settings, onChange, onExport, onImport }) {
  const [file, setFile] = useState(null);

  async function handleImport(e) {
    e.preventDefault();
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      onImport(parsed);
    } catch {
      alert("Invalid JSON file.");
    }
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <strong>Preferences</strong>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!settings.enableHints}
              onChange={(e) => onChange({ enableHints: e.target.checked })}
            />
            Show helpful hints
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!settings.startWeekOnMonday}
              onChange={(e) => onChange({ startWeekOnMonday: e.target.checked })}
            />
            Start week on Monday
          </label>
        </div>
      </div>

      <div className="card">
        <strong>Data</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button className="btn" onClick={onExport}>⬇️ Export JSON</button>
          <form onSubmit={handleImport} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="file" accept="application/json" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="btn" type="submit">⬆️ Import</button>
          </form>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Data is stored locally on your device only.</p>
      </div>
    </div>
  );
}

/** -------------------------
 *  App (tabs + pages)
 *  -------------------------
 */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tab, setTab] = useState("today");
  const [editing, setEditing] = useState(null);

  const todayExisting = useMemo(() => state.entries.find((e) => e.date === todayISO()), [state.entries]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(state.entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mood-entries-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(list) {
    if (!Array.isArray(list)) return alert("Invalid format.");
    dispatch({ type: "bulkReplace", payload: list });
  }

  return (
    <div className="container">
<header className="appbar">
  <div className="title">
    <div className="logo">🌙</div>
    <h1 style={{ margin: 0, fontSize: 18 }}>MoonMood</h1>
  </div>
  <span className="badge">PWA</span>
</header>


      <div className="tabs" role="tablist" aria-label="Navigation">
        {["today","journal","insights","settings"].map((t) => (
          <button key={t} className="tab-btn" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {tab === "today" && (
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Today – {todayISO()}</h2>
            <EntryForm
              initial={editing || todayExisting}
              showHints={state.settings.enableHints}
              onSave={(payload) => {
                if (editing || todayExisting) {
                  dispatch({ type: "update", payload });
                  setEditing(null);
                } else {
                  dispatch({ type: "add", payload });
                }
                setTab("journal");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

        {tab === "journal" && (
          <Journal
            entries={state.entries}
            onEdit={(e) => { setEditing(e); setTab("today"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onDelete={(id) => dispatch({ type: "delete", id })}
          />
        )}

        {tab === "insights" && <Insights entries={state.entries} />}

        {tab === "settings" && (
          <SettingsPane
            settings={state.settings}
            onChange={(p) => dispatch({ type: "settings", payload: p })}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </div>

      <footer className="install">
        <div className="install-inner">Installable • Offline-ready • Data stays on device</div>
      </footer>
    </div>
  );
}
