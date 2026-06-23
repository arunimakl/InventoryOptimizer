import { useState } from "react";
import { calculateSafetyStock } from "./api";

const INITIAL = {
  mean_demand_lead_time: "",
  std_dev_lead_time: "",
  service_level: "",
};

export default function SafetyStockForm() {
  const [fields, setFields] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const payload = {
      mean_demand_lead_time: Number(fields.mean_demand_lead_time),
      std_dev_lead_time: Number(fields.std_dev_lead_time),
      service_level: Number(fields.service_level),
    };

    // ── VALIDATION ──
    if (
      !payload.mean_demand_lead_time ||
      !payload.std_dev_lead_time ||
      !payload.service_level
    ) {
      setError("Please enter valid positive numbers");
      return;
    }

    if (payload.service_level <= 0 || payload.service_level >= 1) {
      setError("Service level must be between 0 and 1 (e.g. 0.95)");
      return;
    }

    setLoading(true);

    try {
      const data = await calculateSafetyStock(payload);
      console.log("API RESPONSE:", data); // 👈 ADD THIS HERE
      setResult(data);
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-card">
      <div className="module-header">
        <span className="module-tag">SS</span>
        <h2 className="module-title">Safety Stock Calculator</h2>
        <p className="module-formula">
          SS = Z × σL | ROP = μL + SS
        </p>
      </div>

      <form className="calc-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Mean Demand (μL)</label>
          <input
            name="mean_demand_lead_time"
            type="number"
            value={fields.mean_demand_lead_time}
            onChange={handleChange}
            placeholder="e.g. 500"
          />
        </div>

        <div className="field-group">
          <label>Std Dev of Demand (σL)</label>
          <input
            name="std_dev_lead_time"
            type="number"
            value={fields.std_dev_lead_time}
            onChange={handleChange}
            placeholder="e.g. 40"
          />
        </div>

        <div className="field-group">
          <label>Service Level (0–1)</label>
          <input
            name="service_level"
            type="number"
            step="0.01"
            value={fields.service_level}
            onChange={handleChange}
            placeholder="e.g. 0.95"
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="calc-btn" type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate Safety Stock"}
        </button>
      </form>

      {result && (
        <div className="results-panel">
          <ResultRow label="Z Score" value={result.z_score} unit="" />

          <ResultRow
            label="Safety Stock"
            value={result.safety_stock}
            unit="units"
            highlight
          />

          <ResultRow
            label="Reorder Point (ROP)"
            value={result.reorder_point}
            unit="units"
            highlight
          />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Result Component ───────────────────────── */

function ResultRow({ label, value, unit, highlight }) {
  return (
    <div className={`result-row ${highlight ? "highlight" : ""}`}>
      <span>{label}</span>
      <strong>
        {value} {unit}
      </strong>
    </div>
  );
}