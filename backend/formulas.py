"""
InvOpt Formula Library — Version 1
Pure mathematical functions. No I/O, no API logic.
Designed for extension: Safety Stock, ABC Analysis, newsvendor model, etc.
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

    Note: Version 2 will extend this with safety_stock parameter.
    """
    rop = daily_demand * lead_time

    return {
        "rop": round(rop, 4),
    }


