import React, { useState } from "react";
import { calculateROP } from "./api";

const INITIAL = { daily_demand: "", lead_time: "" };

export default function ROPForm() {
  const [fields, setFields] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        daily_demand: parseFloat(fields.daily_demand),
        lead_time: parseFloat(fields.lead_time),
      };
      const data = await calculateROP(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-card">
      <div className="module-header">
        <span className="module-tag">ROP</span>
        <h2 className="module-title">Reorder Point</h2>
        <p className="module-formula">R = d × L</p>
      </div>

      <form className="calc-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="daily_demand">
            Daily Demand <span className="field-unit">(d) — units/day</span>
          </label>
          <input
            id="daily_demand"
            name="daily_demand"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="e.g. 40"
            value={fields.daily_demand}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="lead_time">
            Lead Time <span className="field-unit">(L) — days</span>
          </label>
          <input
            id="lead_time"
            name="lead_time"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="e.g. 7"
            value={fields.lead_time}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="calc-btn" type="submit" disabled={loading}>
          {loading ? "Calculating…" : "Calculate ROP"}
        </button>
      </form>

      {result && (
        <div className="results-panel">
          <div className="result-row result-row--highlight">
            <span className="result-label">Reorder Point (R)</span>
            <span className="result-value">
              {result.rop.toLocaleString()}{" "}
              <span className="result-unit">units</span>
            </span>
          </div>
          <p className="result-note">
            Place a new order when inventory drops to this level.
          </p>
        </div>
      )}
    </div>
  );
}