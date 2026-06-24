import { useState } from "react";
import { runABCAnalysis } from "./api";

export default function ABCForm() {
  const [items, setItems] = useState([
    { name: "", annual_usage: "", unit_cost: "" },
  ]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(i, field, value) {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  }

  function addRow() {
    setItems([
      ...items,
      { name: "", annual_usage: "", unit_cost: "" },
    ]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const cleanedItems = items
      .filter(
        (i) =>
          i.name?.trim() !== "" &&
          i.annual_usage !== "" &&
          i.unit_cost !== ""
      )
      .map((i) => ({
        name: i.name.trim(),
        annual_usage: Number(i.annual_usage),
        unit_cost: Number(i.unit_cost),
      }))
      .filter(
        (i) =>
          !Number.isNaN(i.annual_usage) &&
          !Number.isNaN(i.unit_cost)
      );

    if (cleanedItems.length === 0) {
      setError("Please enter at least one valid item");
      return;
    }

    setLoading(true);

    try {
      const data = await runABCAnalysis({ items: cleanedItems });
      setResult(data);
    } catch (err) {
      setError("ABC calculation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-card">

      {/* HEADER */}
      <div className="module-header">
        
        <h2 className="module-title">ABC Analysis</h2>
        <p className="module-formula">
          Annual Value = Usage × Unit Cost
        </p>
      </div>

      {/* INPUT TABLE */}
      <form onSubmit={handleSubmit} className="calc-form">

        <table className="abc-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Annual Usage</th>
              <th>Unit Cost</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <input
                    value={item.name}
                    placeholder="e.g. Motor"
                    onChange={(e) =>
                      handleChange(i, "name", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={item.annual_usage}
                    placeholder="500"
                    onChange={(e) =>
                      handleChange(i, "annual_usage", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={item.unit_cost}
                    placeholder="120"
                    onChange={(e) =>
                      handleChange(i, "unit_cost", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button type="button" className="calc-btn" onClick={addRow}>
            + Add Row
          </button>

          <button type="submit" className="calc-btn" disabled={loading}>
            {loading ? "Calculating..." : "Calculate ABC"}
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}
      </form>

      {/* OUTPUT TABLE */}
      {result && (
        <div className="results-panel">

          <div className="module-title" style={{ marginBottom: "10px" }}>
            Results
          </div>

          <table className="abc-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Annual Value</th>
                <th>Cum %</th>
                <th>Class</th>
              </tr>
            </thead>

            <tbody>
              {result.classified_items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.annual_value}</td>
                  <td>{item.cumulative_pct}%</td>
                  <td>
                    <span className={`abc-badge abc-${item.category}`}>
                      {item.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}