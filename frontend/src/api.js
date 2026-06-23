/**
 * InvOpt API Client — Stable Version
 * Handles EOQ, ROP, Safety Stock safely with unified error handling
 */

const BASE_URL = import.meta.env.VITE_API_BASE ?? "";

/**
 * Safe POST wrapper (prevents unknown errors & crashes)
 */
async function post(endpoint, body) {
  const res = await fetch(`http://localhost:8000${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  console.log("STATUS:", res.status);
  console.log("RESPONSE FROM BACKEND:", data);

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}
/* ───────────────────────────── EOQ ───────────────────────────── */

export function calculateEOQ(params) {
  return post("/eoq", params);
}

/* ───────────────────────────── ROP ───────────────────────────── */

export function calculateROP(params) {
  return post("/rop", params);
}

/* ─────────────────────── SAFETY STOCK  ─────────────────────── */

export function calculateSafetyStock(params) {
  return post("/safety-stock", params);
}

/* ─────────────────────── ABC Analysis ─────────────────────── */

export function runABCAnalysis(params) {
  return post("/abc", params);
}
/* ─────────────────────── FUTURE MODULES (STUBS) ─────────────────────── */

// export function runABCAnalysis(params) {
//   return post("/abc", params);
// }