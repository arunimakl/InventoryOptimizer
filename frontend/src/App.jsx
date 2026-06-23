import React, { useState } from "react";
import EOQForm from "./EOQForm";
import ROPForm from "./ROPForm";
import SafetyStockForm from "./SafetyStockForm";

const MODULES = [
  { id: "eoq", label: "EOQ" },
  { id: "rop", label: "ROP" },
  { id: "ss", label: "Safety Stock" },
  // Future:
  // { id: "abc", label: "ABC Analysis" },
];

export default function App() {
  const [active, setActive] = useState("eoq");

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-inv">Inv</span>
            <span className="wordmark-opt">Opt</span>
          </div>
          <p className="header-sub">Inventory Decision Support · v1</p>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="module-nav" aria-label="Modules">
        {MODULES.map((m) => (
          <button
            key={m.id}
            className={`nav-tab ${
              active === m.id ? "nav-tab--active" : ""
            }`}
            onClick={() => setActive(m.id)}
            aria-current={active === m.id ? "page" : undefined}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="app-main">
        {active === "eoq" && <EOQForm />}
        {active === "rop" && <ROPForm />}
        {active === "ss" && <SafetyStockForm />}
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        InvOpt v1 · All calculations are stateless · No data is stored
      </footer>
    </div>
  );
}