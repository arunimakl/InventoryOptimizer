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


def calculate_safety_stock(
    daily_demand: float,
    lead_time: float,
    std_dev_lead_time: float,
    service_level: float,
) -> dict:
    """
    Safety Stock (Textbook Model)

    SS = Z × σL
    ROP = (d × L) + SS

    Parameters:
    daily_demand (d)
    lead_time (L)
    std_dev_lead_time (σL)
    service_level (0–1)

    Returns:
    dict with SS, ROP, Z
    """

    if not (0 < service_level < 1):
        raise ValueError("service_level must be between 0 and 1")

    # ---- Z-table (no scipy, stable version) ----
    z_table = {
        0.50: 0.00,
        0.55: 0.13,
        0.60: 0.25,
        0.65: 0.39,
        0.70: 0.52,
        0.75: 0.67,
        0.80: 0.84,
        0.85: 1.04,
        0.90: 1.28,
        0.95: 1.64,
        0.97: 1.88,
        0.98: 2.05,
        0.99: 2.33,
    }

    # closest match (safe fallback instead of crash)
    closest_key = min(z_table.keys(), key=lambda k: abs(k - service_level))
    z = z_table[closest_key]

    safety_stock = z * std_dev_lead_time

    base_rop = daily_demand * lead_time

    reorder_point = base_rop + safety_stock

    return {
        "z_score": round(z, 2),
        "safety_stock": round(safety_stock, 2),
        "base_rop": round(base_rop, 2),
        "reorder_point": round(reorder_point, 2),
    }

# ── ABC Analysis (Version 3) ─────────────────────────────────────────────────

def abc_classify(items: list[dict]) -> dict:
    if not items:
        raise ValueError("Item list is empty.")

    enriched = []

    for item in items:
        try:
            usage = float(item["annual_usage"])
            cost = float(item["unit_cost"])
        except:
            raise ValueError(f"Invalid numeric input in item: {item}")

        annual_value = usage * cost

        enriched.append({
            "name": item["name"],
            "annual_usage": usage,
            "unit_cost": cost,
            "annual_value": round(annual_value, 4),
        })

    enriched.sort(key=lambda x: x["annual_value"], reverse=True)

    total_value = sum(i["annual_value"] for i in enriched)

    cumulative = 0.0

    summary = {
        "A": {"count": 0, "value": 0.0},
        "B": {"count": 0, "value": 0.0},
        "C": {"count": 0, "value": 0.0},
    }

    for item in enriched:
        cumulative += item["annual_value"]
        pct = (cumulative / total_value) * 100 if total_value else 0

        if pct <= 70:
            cat = "A"
        elif pct <= 90:
            cat = "B"
        else:
            cat = "C"

        item["cumulative_pct"] = round(pct, 2)
        item["category"] = cat

        summary[cat]["count"] += 1
        summary[cat]["value"] += item["annual_value"]

    for cat in summary:
        summary[cat]["value_pct"] = round(
            (summary[cat]["value"] / total_value) * 100, 2
        ) if total_value else 0

        summary[cat]["value"] = round(summary[cat]["value"], 4)

    return {
        "classified_items": enriched,
        "summary": summary,
        "total_value": round(total_value, 4),
    }