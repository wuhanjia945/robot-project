from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class RobotType(str, Enum):
    WHEELED = "wheeled"
    LEGGED = "legged"
    ARM = "arm"
    COMPOSITE = "composite"
    DRONE = "drone"

ROBOT_TYPE_LABELS: dict[RobotType, str] = {
    RobotType.WHEELED: "轮式机器人 Wheeled Robot",
    RobotType.LEGGED: "足式机器人 Legged Robot",
    RobotType.ARM: "机械臂 Robotic Arm",
    RobotType.COMPOSITE: "复合机器人 Composite Robot",
    RobotType.DRONE: "无人机 Drone/UAV",
}


class FunctionPriority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CoreFunction(BaseModel):
    name: str
    priority: FunctionPriority
    description: Optional[str] = None


class PerformanceSpec(BaseModel):
    payload_kg: Optional[float] = None
    speed_ms: Optional[float] = None
    battery_hours: Optional[float] = None
    latency_ms: Optional[float] = None
    position_accuracy_mm: Optional[float] = None


class BudgetRange(BaseModel):
    min_amount: float
    max_amount: float
    currency: str = "CNY"


class DevConstraint(BaseModel):
    team_skills: list[str]
    timeline_weeks: Optional[int] = None
    production_scale: Optional[int] = None


class DeployEnvironment(BaseModel):
    network: str = "online"
    compute_platform: Optional[str] = None
    safety_level: str = "standard"


class RequirementCreate(BaseModel):
    robot_type: RobotType
    core_functions: list[CoreFunction]
    performance: PerformanceSpec
    budget: BudgetRange
    constraints: Optional[DevConstraint] = None
    environment: Optional[DeployEnvironment] = None
    description: Optional[str] = None


class RequirementResponse(RequirementCreate):
    id: str
    created_at: datetime
    completeness_score: float


class HardwareInfo(BaseModel):
    actuators: list[dict]
    sensors: list[dict]
    compute_platform: dict
    communication: Optional[dict] = None
    mechanical: Optional[dict] = None
    existing_code: Optional[str] = None
    problem_description: Optional[str] = None
    urdf_content: Optional[str] = None


class HardwareAlgorithmRequest(BaseModel):
    hardware_info: HardwareInfo
    desired_functions: list[str]
    performance_requirements: Optional[dict] = None
