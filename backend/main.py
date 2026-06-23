"""
InvOpt API — Version 1
Entry point. Routes delegate all computation to formulas.py.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from formulas import calculate_eoq, calculate_rop

app = FastAPI(
    title="InvOpt API",
    description="Inventory Optimization Decision Support System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schemas ───────────────────────────────────────────────────────────

class EOQRequest(BaseModel):
    demand: float = Field(..., gt=0, description="Annual demand (units/year)")
    ordering_cost: float = Field(..., gt=0, description="Fixed ordering cost ($/order)")
    holding_cost: float = Field(..., gt=0, description="Holding cost ($/unit/year)")


class ROPRequest(BaseModel):
    daily_demand: float = Field(..., gt=0, description="Average daily demand (units/day)")
    lead_time: float = Field(..., gt=0, description="Replenishment lead time (days)")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/eoq")
def eoq(req: EOQRequest):
    try:
        return calculate_eoq(req.demand, req.ordering_cost, req.holding_cost)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/rop")
def rop(req: ROPRequest):
    try:
        return calculate_rop(req.daily_demand, req.lead_time)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


