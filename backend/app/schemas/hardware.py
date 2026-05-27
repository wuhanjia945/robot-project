from enum import Enum
from typing import Optional

from pydantic import BaseModel


class ActuatorType(str, Enum):
    SERVO = "servo"
    STEPPER = "stepper"
    BRUSHLESS = "brushless"
    SERVO_MOTOR = "servo_motor"


class SensorType(str, Enum):
    IMU = "imu"
    ENCODER = "encoder"
    CAMERA = "camera"
    LIDAR = "lidar"
    FORCE = "force"
    ULTRASONIC = "ultrasonic"


class ComputePlatform(str, Enum):
    STM32F103 = "stm32f103"
    STM32F4 = "stm32f4"
    ESP32 = "esp32"
    RASPBERRY_PI5 = "raspberry_pi5"
    JETSON_NANO = "jetson_nano"
    JETSON_ORIN_NANO = "jetson_orin_nano"
    IPC = "ipc"


class ActuatorSpec(BaseModel):
    type: ActuatorType
    name: str
    model: Optional[str] = None
    quantity: int
    specs: Optional[dict] = None
    control_interface: Optional[str] = None


class SensorSpec(BaseModel):
    type: SensorType
    name: str
    model: Optional[str] = None
    quantity: int
    specs: Optional[dict] = None


class ComputeSpec(BaseModel):
    platform: ComputePlatform
    name: str
    cpu_info: Optional[str] = None
    gpu_info: Optional[str] = None
    memory_gb: Optional[float] = None
    os_type: Optional[str] = None
    storage_gb: Optional[float] = None


class HardwareItem(BaseModel):
    category: str
    name: str
    brand: Optional[str] = None
    model: Optional[str] = None
    specs: dict
    price_min: float
    price_max: float
    currency: str = "CNY"
    availability: str = "available"
    compatibility_tags: list[str] = []
    url: Optional[str] = None


class BOMItem(BaseModel):
    item: HardwareItem
    quantity: int
    subtotal_min: Optional[float] = None
    subtotal_max: Optional[float] = None
    notes: Optional[str] = None


class BOMSheet(BaseModel):
    items: list[BOMItem]
    total_min: float
    total_max: float
    currency: str = "CNY"
