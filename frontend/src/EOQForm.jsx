import React, { useState } from "react";
import { calculateEOQ } from "./api";

const INITIAL = {
  demand: "",
  ordering_cost: "",
  holding_cost: "",
};

export default function EOQForm() {
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
      demand: Number(fields.demand),
      ordering_cost: Number(fields.ordering_cost),
      holding_cost: Number(fields.holding_cost),
    };

    if (!payload.demand || !payload.ordering_cost || !payload.holding_cost) {
      setError("Please enter valid positive numbers");
      return;
    }

    setLoading(true);

    try {
      const data = await calculateEOQ(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-card">
      <div className="module-header">
        <span className="module-tag">EOQ</span>
        <h2 className="module-title">Economic Order Quantity</h2>
        <p className="module-formula">Q* = √( 2DS / H )</p>
      </div>

      <form className="calc-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Annual Demand (D)</label>
          <input
            name="demand"
            type="number"
            value={fields.demand}
            onChange={handleChange}
            placeholder="e.g. 10000"
          />
        </div>

        <div className="field-group">
          <label>Ordering Cost (S)</label>
          <input
            name="ordering_cost"
            type="number"
            value={fields.ordering_cost}
            onChange={handleChange}
            placeholder="e.g. 200"
          />
        </div>

        <div className="field-group">
          <label>Holding Cost (H)</label>
          <input
            name="holding_cost"
            type="number"
            value={fields.holding_cost}
            onChange={handleChange}
            placeholder="e.g. 5"
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button className="calc-btn" type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate EOQ"}
        </button>
      </form>

      {result && (() => {
        // ── CONSISTENT FORMATTING ──
        const eoq = Math.round(result.eoq);
        const orders = result.orders_per_year.toFixed(1);

        const days = Math.round(result.time_between_orders * 365);
        const weeks = Math.round(days / 7);

        return (
          <div className="results-panel">
            <ResultRow
              label="EOQ"
              value={eoq}
              unit="units"
              highlight
            />

            <ResultRow
              label="Orders per Year"
              value={orders}
              unit=""
            />

            <ResultRow
              label="Time Between Orders"
              value={`${days} days (~${weeks} weeks)`}
              unit=""
            />
          </div>
        );
      })()}
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