"""
InvOpt API — Version 1 (Extended)
Entry point. Routes delegate all computation to formulas.py.
"""

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from formulas import (
    abc_classify,
    calculate_eoq,
    calculate_rop,
    calculate_safety_stock,
)

app = FastAPI(
    title="InvOpt API",
    description="Inventory Optimization Decision Support System",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── REQUEST MODELS ─────────────────────────────────────────────────────

class EOQRequest(BaseModel):
    demand: float = Field(..., gt=0)
    ordering_cost: float = Field(..., gt=0)
    holding_cost: float = Field(..., gt=0)


class ROPRequest(BaseModel):
    daily_demand: float = Field(..., gt=0)
    lead_time: float = Field(..., gt=0)


class SafetyStockRequest(BaseModel):
    mean_demand_lead_time: float = Field(..., gt=0)
    std_dev_lead_time: float = Field(..., gt=0)
    service_level: float = Field(..., gt=0, lt=1)

# ── ROUTES ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "1.0.0"
    }

# ── EOQ ────────────────────────────────────────────────────────────────
@app.post("/eoq")
def eoq(req: EOQRequest):
    try:
        return calculate_eoq(
            req.demand,
            req.ordering_cost,
            req.holding_cost
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

# ── ROP ────────────────────────────────────────────────────────────────
@app.post("/rop")
def rop(req: ROPRequest):
    try:
        return calculate_rop(
            req.daily_demand,
            req.lead_time
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

# ── SAFETY STOCK ───────────────────────────────────────────────────────
@app.post("/safety-stock")
def safety_stock(req: SafetyStockRequest):
    try:
        return calculate_safety_stock(
        req.mean_demand_lead_time,
        req.std_dev_lead_time,
        req.service_level
    )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

# ── ABC ANALYSIS ────────────────────────────────────────────────────────────────
class ABCItem(BaseModel):
    name: str
    annual_usage: float
    unit_cost: float


class ABCRequest(BaseModel):
    items: List[ABCItem]


@app.post("/abc")
def abc(req: ABCRequest):
    print("ABC REQUEST RECEIVED:", req)

    data = [item.model_dump() for item in req.items]
    print("PARSED DATA:", data)

    result = abc_classify(data)
    print("RESULT:", result)

    return result
