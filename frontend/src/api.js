/**
 * InvOpt API Client — Stable Version
 * Handles EOQ, ROP, Safety Stock safely with unified error handling
 */

const BASE_URL = import.meta.env.VITE_API_BASE ?? "";

/**
 * Safe POST wrapper (prevents unknown errors & crashes)
 */
async function post(endpoint, body) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data?.detail ||
        data?.message ||
        `Request failed with status ${res.status}`;

      throw new Error(message);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

/* ───────────────────────────── EOQ ───────────────────────────── */

export function calculateEOQ(params) {
  return post("/eoq", params);
}

/* ───────────────────────────── ROP ───────────────────────────── */

export function calculateROP(params) {
  return post("/rop", params);
}

/* ─────────────────────── SAFETY STOCK (V2 READY) ─────────────────────── */

export function calculateSafetyStock(params) {
  return post("/safety-stock", params);
}

/* ─────────────────────── FUTURE MODULES (STUBS) ─────────────────────── */

// export function runABCAnalysis(params) {
//   return post("/abc", params);
// }