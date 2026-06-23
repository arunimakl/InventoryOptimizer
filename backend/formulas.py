"""
InvOpt Formula Library — Version 3
Pure mathematical functions. No I/O, no API logic.
Designed for extension: newsvendor model, scenario comparison, etc.
"""

import math



# ── EOQ ──────────────────────────────────────────────────────────────────────

def calculate_eoq(demand: float, ordering_cost: float, holding_cost: float) -> dict:
    """
    Economic Order Quantity (Wilson Formula).

    Parameters
    ----------
    demand        : Annual demand (D) in units/year
    ordering_cost : Fixed cost per order (S) in currency units
    holding_cost  : Holding cost per unit per year (H) in currency units

    Returns
    -------
    dict with:
        eoq               : Optimal order quantity (units)
        orders_per_year   : Number of replenishment cycles per year
        time_between_orders: Cycle length in years
    """
    eoq = math.sqrt((2 * demand * ordering_cost) / holding_cost)
    orders_per_year = demand / eoq
    time_between_orders = 1 / orders_per_year  # in years

    return {
        "eoq": round(eoq, 4),
        "orders_per_year": round(orders_per_year, 4),
        "time_between_orders": round(time_between_orders, 4),
    }


# ── ROP ──────────────────────────────────────────────────────────────────────

def calculate_rop(daily_demand: float, lead_time: float) -> dict:
    """
    Reorder Point (deterministic, no safety stock).

    Parameters
    ----------
    daily_demand : Average daily demand (d) in units/day
    lead_time    : Replenishment lead time (L) in days

    Returns
    -------
    dict with:
        rop : Reorder point in units
    """
    rop = daily_demand * lead_time

    return {
        "rop": round(rop, 4),
    }


# ── Safety Stock + Updated ROP (Version 2) ───────────────────────────────────

import math
from scipy import stats

def calculate_safety_stock(
    mean_demand_lead_time: float,
    std_dev_lead_time: float,
    service_level: float,
) -> dict:
    """
    Safety Stock (Textbook Model)

    SS = Z × σL
    ROP = μL + SS

    Parameters:
    mean_demand_lead_time (μL)
    std_dev_lead_time (σL)
    service_level (probability between 0–1)

    Returns:
    dict with SS and ROP
    """

    if not (0 < service_level < 1):
        raise ValueError("service_level must be between 0 and 1")

    # Z from standard normal distribution
    z = stats.norm.ppf(service_level)

    safety_stock = z * std_dev_lead_time
    reorder_point = mean_demand_lead_time + safety_stock

    return {
        "z_score": round(z, 2),
        "safety_stock": round(safety_stock, 2),
        "reorder_point": round(reorder_point, 2),
        "mean_demand_lead_time": round(mean_demand_lead_time, 2)
    }


# ── ABC Analysis (Version 3) ─────────────────────────────────────────────────

def abc_classify(items: list[dict]) -> dict:
    """
    ABC Inventory Classification (Pareto-based).

    Each item must have 'name', 'annual_usage' (units/year), 'unit_cost'.
    Annual value = annual_usage × unit_cost.

    Thresholds (cumulative % of total value):
        A: 0–70%
        B: 70–90%
        C: 90–100%

    Parameters
    ----------
    items : list of dicts with keys: name, annual_usage, unit_cost

    Returns
    -------
    dict with:
        classified_items : list of items enriched with annual_value,
                           cumulative_pct, and category (A/B/C)
        summary          : count and value_pct per category
        total_value      : sum of all annual values
    """
    if not items:
        raise ValueError("Item list is empty.")

    # Compute annual value and sort descending
    enriched = []
    for item in items:
        annual_value = item["annual_usage"] * item["unit_cost"]
        enriched.append({
            "name": item["name"],
            "annual_usage": item["annual_usage"],
            "unit_cost": item["unit_cost"],
            "annual_value": round(annual_value, 4),
        })

    enriched.sort(key=lambda x: x["annual_value"], reverse=True)

    total_value = sum(i["annual_value"] for i in enriched)

    cumulative = 0.0
    summary = {"A": {"count": 0, "value": 0.0}, "B": {"count": 0, "value": 0.0}, "C": {"count": 0, "value": 0.0}}

    for item in enriched:
        cumulative += item["annual_value"]
        pct = (cumulative / total_value) * 100

        if pct <= 70:
            cat = "A"
        elif pct <= 90:
            cat = "B"
        else:
            cat = "C"

        item["cumulative_pct"] = round(pct, 2)
        item["category"] = cat
        summary[cat]["count"] += 1
        summary[cat]["value"] = round(summary[cat]["value"] + item["annual_value"], 4)

    # Compute value % per category
    for cat in summary:
        summary[cat]["value_pct"] = round((summary[cat]["value"] / total_value) * 100, 2)

    return {
        "classified_items": enriched,
        "summary": summary,
        "total_value": round(total_value, 4),
    }


# ── Future modules (stubs) ────────────────────────────────────────────────────
# def newsvendor(demand_dist, cost_underage, cost_overage): ...
# def compare_scenarios(scenarios: list[dict]): ...