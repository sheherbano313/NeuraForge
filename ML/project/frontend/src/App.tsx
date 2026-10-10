
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000";

type Prediction = {
  prediction: number;
  result: string;
  note: string;
};

export default function App() {
  const [features, setFeatures] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Connecting...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);

  useEffect(() => {
    fetch(`${API}/features`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load features");
        return r.json();
      })
      .then((data: { features: string[]; count: number }) => {
        setFeatures(data.features);
        setValues(Object.fromEntries(data.features.map((f) => [f, ""])));
        setStatus(`API Connected · ${data.count} features`);
      })
      .catch(() => {
        setStatus("API Offline");
        setError("Start Flask using python app.py, then refresh this page.");
      });
  }, []);

  async function predict(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (features.some((f) => values[f]?.trim() === "")) {
      setError("Please fill in all feature fields.");
      return;
    }

    const input = Object.fromEntries(
      features.map((f) => [f, Number(values[f])])
    );

    if (!Object.values(input).every(Number.isFinite)) {
      setError("Enter valid numeric values in every field.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed");
      setResult(data as Prediction);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setValues(Object.fromEntries(features.map((f) => [f, ""])));
    setResult(null);
    setError("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home"><span>✳</span> BreastIQ</a>
        <p className="side-label">WORKSPACE</p>
        <a className="nav-link active" href="#home">⌂ <span>Dashboard</span></a>
        <a className="nav-link" href="#prediction">⌘ <span>Prediction</span></a>
        <div className="sidebar-model">♧ <span>ML MODEL<br />RANDOM FOREST</span></div>
      </aside>

      <main className="main-area" id="home">
        <header className="topbar">
          <span>Workspace <b>/</b> Prediction</span>
          <span className="api-status"><i /> {status}</span>
        </header>

        <div className="dashboard-layout">
          <div className="left-column">
            <section className="hero-card">
              <p className="eyebrow">MACHINE LEARNING · HEALTH RESEARCH DEMO</p>
              <h1>Welcome to <span>BreastIQ.</span></h1>
              <p>Enter dataset measurements to test your trained classification model.</p>
              <div className="hero-decoration">✳</div>
            </section>

            <section className="panel" id="prediction">
              <div className="panel-title">
                <div className="round-icon">♧</div>
                <div>
                  <p className="eyebrow">PREDICTION WORKSPACE</p>
                  <h2>Feature measurements</h2>
                </div>
                <span className="feature-badge">{features.length} FEATURES</span>
              </div>

              <p className="muted">
                Enter numerical values from a dataset row. All model features are required.
              </p>

              {features.length > 0 && (
                <form onSubmit={predict}>
                  <div className="feature-grid">
                    {features.map((name, index) => (
                      <label className="feature-field" key={name}>
                        <span>
                          <small>{String(index + 1).padStart(2, "0")}</small>
                          {name.replaceAll("_", " ")}
                        </span>
                        <input
                          type="number"
                          step="any"
                          required
                          value={values[name] ?? ""}
                          placeholder="Enter value"
                          onChange={(e) =>
                            setValues((old) => ({ ...old, [name]: e.target.value }))
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="clear-btn" onClick={clearForm}>
                      ↻ Clear all
                    </button>
                    <button type="submit" className="predict-btn" disabled={loading}>
                      {loading ? "Predicting..." : "✧ Run Model Prediction →"}
                    </button>
                  </div>
                </form>
              )}

              {error && <div className="error-box">{error}</div>}
            </section>
          </div>

          <aside className="right-column">
            <section className="panel status-panel">
              <div className="side-card-title"><span className="round-icon">▤</span><h3>Model Status</h3></div>
              <p>Random Forest Classifier</p>
              <p className="muted">Trained on Wisconsin Breast Cancer Dataset</p>
              <div className="stats-grid">
                <div><strong>{features.length || "—"}</strong><span>Features</span></div>
                <div><strong>569</strong><span>Samples</span></div>
                <div><strong>2</strong><span>Classes</span></div>
              </div>
              <p className="muted small-status">{status}</p>
            </section>

            <section className="panel result-panel">
              <div className="side-card-title"><span className="round-icon purple">◎</span><h3>Prediction Result</h3></div>
              {result ? (
                <div className="result-content" aria-live="polite">
                  <div className="result-symbol">{result.result === "Benign" ? "✓" : "!"}</div>
                  <h2 className={result.result === "Benign" ? "benign" : "malignant"}>{result.result}</h2>
                  <p>{result.note}</p>
                </div>
              ) : (
                <div className="empty-result">
                  <div className="empty-symbol">＋</div>
                  <h3>No prediction yet</h3>
                  <p>Enter all feature values and click<br />“Run Model Prediction”.</p>
                </div>
              )}
            </section>

            <section className="panel about-panel">
              <div className="side-card-title"><span className="round-icon">i</span><h3>About BreastIQ</h3></div>
              <p>This prototype uses machine learning to classify measurements from a breast cancer dataset.</p>
              <p className="muted">Educational use only. This result is not a medical diagnosis.</p>
            </section>
            <p className="tagline">♥ Better Data · Smarter Models</p>
          </aside>
        </div>

        <footer className="footer">BreastIQ <span>·</span> NeuraForge ML project</footer>
      </main>
    </div>
  );
}