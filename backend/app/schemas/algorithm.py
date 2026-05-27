from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.hardware import ComputePlatform, SensorType


class AlgorithmLevel(str, Enum):
    BASIC = "basic"
    ADVANCED = "advanced"
    EXPERT = "expert"


class RobotCategory(str, Enum):
    WHEELED = "wheeled"
    DIFF_DRIVE = "diff_drive"
    MECANUM = "mecanum"
    ARM = "arm"
    QUADRUPED = "quadruped"
    HUMANOID = "humanoid"
    DRONE = "drone"


class AlgorithmSpec(BaseModel):
    name: str
    category: str
    level: AlgorithmLevel
    applicable_robots: list[RobotCategory]
    required_sensors: list[SensorType]
    required_compute: list[ComputePlatform]
    parameters: list[dict]
    description: str
    input_spec: dict
    output_spec: dict
    difficulty: int = Field(ge=1, le=5)


class AlgorithmAdaptationResult(BaseModel):
    algorithm: AlgorithmSpec
    adapted_parameters: dict
    compatibility_notes: list[str]
    warnings: list[str] = []
    estimated_performance: Optional[dict] = None
