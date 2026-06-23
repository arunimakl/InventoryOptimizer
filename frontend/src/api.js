/**
 * InvOpt API Client — Version 1
 * Base URL is read from env so deployments never need source changes.
 * Vite proxy handles dev routing; set VITE_API_BASE for production.
 */

const BASE_URL = import.meta.env.VITE_API_BASE ?? "";

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * @param {{ demand: number, ordering_cost: number, holding_cost: number }} params
 * @returns {Promise<{ eoq: number, orders_per_year: number, time_between_orders: number }>}
 */
export function calculateEOQ(params) {
  return post("/eoq", params);
}

/**
 * @param {{ daily_demand: number, lead_time: number }} params
 * @returns {Promise<{ rop: number }>}
 */
export function calculateROP(params) {
  return post("/rop", params);
}

// Future: calculateSafetyStock, runABCAnalysis, compareScenarios