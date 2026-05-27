from typing import Optional
from app.schemas.requirement import RequirementCreate, RobotType, HardwareInfo
from app.schemas.hardware import ComputePlatform, ActuatorType, SensorType

COMPUTE_ALGORITHM_MAP = {
    ComputePlatform.STM32F103: {"max_level": 1, "max_flops": 0.07, "description": "基础MCU，仅支持简单PID和运动学"},
    ComputePlatform.STM32F4: {"max_level": 1, "max_flops": 0.3, "description": "中端MCU，支持PID/IK/基础步态"},
    ComputePlatform.ESP32: {"max_level": 1, "max_flops": 0.4, "description": "WiFi MCU，支持PID/IK/简单MPC"},
    ComputePlatform.RASPBERRY_PI5: {"max_level": 2, "max_flops": 20, "description": "SBC，支持MPC/步态/视觉伺服/轻量SLAM"},
    ComputePlatform.JETSON_NANO: {"max_level": 2, "max_flops": 472, "description": "边缘AI，支持MPC/WBC/视觉/SLAM"},
    ComputePlatform.JETSON_ORIN_NANO: {"max_level": 3, "max_flops": 40, "description": "高性能边缘AI，支持全部Level2+RL推理"},
    ComputePlatform.IPC: {"max_level": 3, "max_flops": 500, "description": "工控机，支持全部算法"},
}

ROBOT_TYPE_MIN_SENSORS = {
    RobotType.WHEELED: {"required": [SensorType.ENCODER], "recommended": [SensorType.IMU]},
    RobotType.LEGGED: {"required": [SensorType.IMU, SensorType.ENCODER], "recommended": [SensorType.FORCE]},
    RobotType.ARM: {"required": [SensorType.ENCODER], "recommended": [SensorType.CAMERA, SensorType.FORCE]},
    RobotType.COMPOSITE: {"required": [SensorType.ENCODER, SensorType.IMU], "recommended": [SensorType.CAMERA, SensorType.LIDAR]},
    RobotType.DRONE: {"required": [SensorType.IMU], "recommended": [SensorType.CAMERA, SensorType.ENCODER]},
}

BUDGET_THRESHOLDS = {
    RobotType.WHEELED: {"min_viable": 100, "min_reasonable": 500, "recommended": 2000},
    RobotType.LEGGED: {"min_viable": 1500, "min_reasonable": 3000, "recommended": 8000},
    RobotType.ARM: {"min_viable": 500, "min_reasonable": 2000, "recommended": 5000},
    RobotType.COMPOSITE: {"min_viable": 3000, "min_reasonable": 8000, "recommended": 20000},
    RobotType.DRONE: {"min_viable": 500, "min_reasonable": 1500, "recommended": 5000},
}

class ContradictionDetector:
    def check_requirement(self, requirement: RequirementCreate) -> list[dict]:
        contradictions = []
        contradictions.extend(self._check_budget(requirement))
        contradictions.extend(self._check_function_consistency(requirement))
        contradictions.extend(self._check_performance_feasibility(requirement))
        return contradictions

    def check_hardware_algorithm(self, hardware_info: HardwareInfo, desired_functions: list[str]) -> list[dict]:
        contradictions = []
        contradictions.extend(self._check_compute_capability(hardware_info, desired_functions))
        contradictions.extend(self._check_sensor_availability(hardware_info, desired_functions))
        contradictions.extend(self._check_power_constraints(hardware_info))
        contradictions.extend(self._check_communication_bandwidth(hardware_info, desired_functions))
        return contradictions

    def _check_budget(self, requirement: RequirementCreate) -> list[dict]:
        contradictions = []
        thresholds = BUDGET_THRESHOLDS.get(requirement.robot_type, {})
        budget_max = requirement.budget.max_amount
        if thresholds and budget_max < thresholds.get("min_viable", 0):
            contradictions.append({
                "type": "budget_insufficient",
                "severity": "critical",
                "message": f"预算{budget_max}元低于{requirement.robot_type.value}类型机器人最低可行成本{thresholds['min_viable']}元",
                "suggestion": f"建议提高预算至{thresholds['min_reasonable']}元以上，或降低需求"
            })
        elif thresholds and budget_max < thresholds.get("min_reasonable", 0):
            contradictions.append({
                "type": "budget_tight",
                "severity": "warning",
                "message": f"预算{budget_max}元低于{requirement.robot_type.value}类型机器人合理成本{thresholds['min_reasonable']}元",
                "suggestion": f"建议预算{thresholds['min_reasonable']}元以上效果更好"
            })
        return contradictions

    def _check_function_consistency(self, requirement: RequirementCreate) -> list[dict]:
        contradictions = []
        func_names = [f.name for f in requirement.core_functions]
        if requirement.robot_type == RobotType.ARM and "自主导航" in func_names:
            contradictions.append({
                "type": "function_mismatch",
                "severity": "warning",
                "message": "机械臂类型机器人通常不具备自主导航功能",
                "suggestion": "如需移动+抓取，建议选择复合型机器人(底盘+机械臂)"
            })
        if requirement.robot_type == RobotType.WHEELED and "抓取" in func_names:
            contradictions.append({
                "type": "function_mismatch",
                "severity": "info",
                "message": "轮式机器人需要额外配备机械臂才能实现抓取",
                "suggestion": "建议选择复合型机器人，或降低抓取优先级"
            })
        if requirement.robot_type == RobotType.DRONE and "抓取" in func_names:
            contradictions.append({
                "type": "function_mismatch",
                "severity": "warning",
                "message": "无人机抓取需要额外的机械结构和复杂控制",
                "suggestion": "建议先实现基础飞行功能，再逐步添加抓取"
            })
        return contradictions

    def _check_performance_feasibility(self, requirement: RequirementCreate) -> list[dict]:
        contradictions = []
        if requirement.robot_type == RobotType.ARM and requirement.performance.position_accuracy_mm:
            if requirement.performance.position_accuracy_mm < 0.1 and requirement.budget.max_amount < 10000:
                contradictions.append({
                    "type": "performance_budget_mismatch",
                    "severity": "warning",
                    "message": f"要求精度{requirement.performance.position_accuracy_mm}mm需要高精度伺服和谐波减速器，预算可能不足",
                    "suggestion": "0.1mm以下精度建议预算20000元以上，或放宽精度要求至0.5mm"
                })
        if requirement.performance.speed_ms and requirement.performance.speed_ms > 5.0:
            if requirement.robot_type in [RobotType.LEGGED, RobotType.COMPOSITE]:
                contradictions.append({
                    "type": "performance_unrealistic",
                    "severity": "warning",
                    "message": f"足式机器人速度{requirement.performance.speed_ms}m/s实现难度极高",
                    "suggestion": "足式机器人典型速度1-2m/s，如需高速移动建议轮式方案"
                })
        return contradictions

    def _check_compute_capability(self, hardware_info: HardwareInfo, desired_functions: list[str]) -> list[dict]:
        contradictions = []
        platform_str = hardware_info.compute_platform.get("platform", "")
        try:
            platform = ComputePlatform(platform_str)
        except ValueError:
            return contradictions
        platform_info = COMPUTE_ALGORITHM_MAP.get(platform, {})
        max_level = platform_info.get("max_level", 1)
        advanced_functions = ["MPC", "WBC", "全身控制", "强化学习", "SLAM", "视觉伺服"]
        for func in desired_functions:
            if func in advanced_functions and max_level < 2:
                contradictions.append({
                    "type": "compute_insufficient",
                    "severity": "error",
                    "message": f"功能'{func}'需要至少Level 2算力，当前平台{platform.value}仅支持Level {max_level}",
                    "suggestion": f"建议升级至树莓派5或Jetson系列，当前平台适合：{platform_info.get('description', '')}"
                })
        return contradictions

    def _check_sensor_availability(self, hardware_info: HardwareInfo, desired_functions: list[str]) -> list[dict]:
        contradictions = []
        sensor_type_strs = [s.get("type", "") for s in hardware_info.sensors]
        function_sensor_map = {
            "导航": ["lidar_2d", "lidar_3d", "depth_camera"],
            "视觉": ["camera", "depth_camera"],
            "平衡控制": ["imu"],
            "步态生成": ["imu", "encoder"],
            "力控": ["force_sensor"],
            "视觉伺服": ["camera", "encoder"],
            "SLAM": ["lidar_2d", "lidar_3d", "depth_camera", "camera"],
        }
        for func in desired_functions:
            required_sensors = function_sensor_map.get(func, [])
            missing = [s for s in required_sensors if s not in sensor_type_strs]
            if missing:
                contradictions.append({
                    "type": "sensor_missing",
                    "severity": "warning",
                    "message": f"功能'{func}'需要传感器{missing}，但当前硬件未检测到",
                    "suggestion": f"建议添加传感器：{missing}"
                })
        return contradictions

    def _check_power_constraints(self, hardware_info: HardwareInfo) -> list[dict]:
        contradictions = []
        total_current_estimate = 0.0
        for actuator in hardware_info.actuators:
            qty = actuator.get("quantity", 1)
            actuator_type = actuator.get("type", "")
            if actuator_type in ["servo", "bus_servo"]:
                total_current_estimate += qty * 0.5
            elif actuator_type == "stepper":
                total_current_estimate += qty * 1.5
            elif actuator_type in ["brushless", "servo_motor"]:
                total_current_estimate += qty * 3.0
        compute_platform = hardware_info.compute_platform.get("platform", "")
        if compute_platform in ["RASPBERRY_PI5", "JETSON_NANO", "JETSON_ORIN_NANO", "IPC"]:
            total_current_estimate += 3.0
        power_info = hardware_info.compute_platform.get("power_supply", {})
        if power_info:
            max_current = power_info.get("max_current", 0)
            if max_current > 0 and total_current_estimate > max_current:
                contradictions.append({
                    "type": "power_insufficient",
                    "severity": "error",
                    "message": f"预估峰值电流{total_current_estimate:.1f}A超过电源容量{max_current}A",
                    "suggestion": f"建议升级电源至{total_current_estimate * 1.2:.1f}A以上，或减少执行器数量"
                })
        return contradictions

    def _check_communication_bandwidth(self, hardware_info: HardwareInfo, desired_functions: list[str]) -> list[dict]:
        contradictions = []
        comm = hardware_info.communication or {}
        if "视觉" in desired_functions or "视觉伺服" in desired_functions:
            interface = comm.get("camera_interface", "")
            if interface == "spi":
                contradictions.append({
                    "type": "bandwidth_insufficient",
                    "severity": "warning",
                    "message": "SPI接口摄像头带宽有限，高帧率视觉处理可能受限",
                    "suggestion": "建议使用USB3/CSI接口摄像头以获得足够带宽"
                })
        return contradictions
