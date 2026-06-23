import React, { useState } from "react";
import { calculateEOQ } from "./api";

const INITIAL = { demand: "", ordering_cost: "", holding_cost: "" };

export default function EOQForm() {
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
        demand: parseFloat(fields.demand),
        ordering_cost: parseFloat(fields.ordering_cost),
        holding_cost: parseFloat(fields.holding_cost),
      };
      const data = await calculateEOQ(payload);
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
        <span className="module-tag">EOQ</span>
        <h2 className="module-title">Economic Order Quantity</h2>
        <p className="module-formula">
          Q* = √( 2DS / H )
        </p>
      </div>

      <form className="calc-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="demand">
            Annual Demand <span className="field-unit">(D) — units/year</span>
          </label>
          <input
            id="demand"
            name="demand"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="e.g. 10000"
            value={fields.demand}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="ordering_cost">
            Ordering Cost <span className="field-unit">(S) — ₹ or $ per order</span>
          </label>
          <input
            id="ordering_cost"
            name="ordering_cost"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="e.g. 200"
            value={fields.ordering_cost}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label htmlFor="holding_cost">
            Holding Cost <span className="field-unit">(H) — per unit/year</span>
          </label>
          <input
            id="holding_cost"
            name="holding_cost"
            type="number"
            min="0.01"
            step="any"
            required
            placeholder="e.g. 5"
            value={fields.holding_cost}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="calc-btn" type="submit" disabled={loading}>
          {loading ? "Calculating…" : "Calculate EOQ"}
        </button>
      </form>

      {result && (
        <div className="results-panel">
          <ResultRow
            label="Optimal Order Qty (Q*)"
            value={result.eoq.toLocaleString()}
            unit="units"
            highlight
          />
          <ResultRow
            label="Orders per Year"
            value={result.orders_per_year.toLocaleString()}
            unit="orders"
          />
          <ResultRow
            label="Time Between Orders"
            value={(result.time_between_orders * 365).toFixed(1)}
            unit="days"
          />
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, unit, highlight }) {
  return (
    <div className={`result-row${highlight ? " result-row--highlight" : ""}`}>
      <span className="result-label">{label}</span>
      <span className="result-value">
        {value} <span className="result-unit">{unit}</span>
      </span>
    </div>
  );
}