from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel

from app.schemas.algorithm import AlgorithmAdaptationResult
from app.schemas.hardware import BOMSheet


class SolutionStatus(str, Enum):
    DRAFT = "draft"
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    REVISING = "revising"


class TechStackItem(BaseModel):
    name: str
    version: Optional[str] = None
    purpose: str
    category: str


class ArchitectureLayer(BaseModel):
    name: str
    components: list[str]
    description: str


class Contradiction(BaseModel):
    type: str
    severity: str
    message: str
    suggestion: str


class SolutionCreate(BaseModel):
    requirement_id: str
    status: SolutionStatus = SolutionStatus.DRAFT


class SolutionResponse(BaseModel):
    id: str
    requirement_id: str
    status: SolutionStatus
    architecture_layers: list[ArchitectureLayer]
    tech_stack: list[TechStackItem]
    bom: BOMSheet
    algorithms: list[AlgorithmAdaptationResult]
    contradictions: list[Contradiction]
    estimated_cost_min: float
    estimated_cost_max: float
    risk_assessment: dict
    created_at: datetime
    updated_at: datetime
