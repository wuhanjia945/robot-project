import yaml
from pathlib import Path
from typing import Optional
from app.schemas.requirement import HardwareInfo, HardwareAlgorithmRequest
from app.schemas.hardware import ComputePlatform, SensorType
from app.schemas.algorithm import (
    AlgorithmSpec, AlgorithmLevel, AlgorithmAdaptationResult, RobotCategory
)
from app.core.contradiction_detector import ContradictionDetector, COMPUTE_ALGORITHM_MAP
from app.config import Settings

class AlgorithmAdapter:
    def __init__(self, data_dir: Optional[Path] = None):
        self._settings = Settings()
        self._data_dir = data_dir or self._settings.DATA_DIR / "algorithms"
        self._algorithms: list[dict] = []
        self._loaded = False
        self._detector = ContradictionDetector()

    def load(self) -> None:
        if self._loaded:
            return
        algo_dir = self._data_dir
        if not algo_dir.exists():
            raise FileNotFoundError(f"Algorithm data directory not found: {algo_dir}")
        for yaml_file in algo_dir.glob("*.yaml"):
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if data and "algorithms" in data:
                    for algo in data["algorithms"]:
                        algo["_category"] = data.get("category", "")
                    self._algorithms.extend(data["algorithms"])
        self._loaded = True

    def get_algorithm_by_name(self, name: str) -> Optional[dict]:
        self.load()
        for algo in self._algorithms:
            if algo.get("name") == name:
                return algo
        return None

    def get_all_algorithms(self) -> list[dict]:
        self.load()
        return self._algorithms

    def get_algorithms_by_category(self, category: str) -> list[dict]:
        self.load()
        return [a for a in self._algorithms if a.get("_category") == category]

    def get_algorithms_by_level(self, level: str) -> list[dict]:
        self.load()
        return [a for a in self._algorithms if a.get("level") == level]

    def get_algorithms_by_robot(self, robot_type: str) -> list[dict]:
        self.load()
        results = []
        for algo in self._algorithms:
            if robot_type in algo.get("applicable_robots", []):
                results.append(algo)
        return results

    def search_algorithms(self, keyword: str) -> list[dict]:
        self.load()
        keyword_lower = keyword.lower()
        results = []
        for algo in self._algorithms:
            searchable = f"{algo.get('name', '')} {algo.get('description', '')} {algo.get('_category', '')}".lower()
            if keyword_lower in searchable:
                results.append(algo)
        return results

    def adapt_for_hardware(self, request: HardwareAlgorithmRequest) -> dict:
        self.load()
        hw = request.hardware_info
        compute_platform_str = hw.compute_platform.get("platform", "")
        try:
            compute_platform = ComputePlatform(compute_platform_str)
        except ValueError:
            compute_platform = ComputePlatform.STM32F4
        platform_info = COMPUTE_ALGORITHM_MAP.get(compute_platform, {})
        max_level = platform_info.get("max_level", 1)
        level_map = {"basic": 1, "advanced": 2, "expert": 3}
        sensor_type_strs = [s.get("type", "") for s in hw.sensors]
        matched_algorithms = []
        for algo in self._algorithms:
            algo_level = level_map.get(algo.get("level", "basic"), 1)
            if algo_level > max_level:
                continue
            applicable = algo.get("applicable_robots", [])
            desired_match = any(
                func.lower() in algo.get("name", "").lower() or func.lower() in algo.get("description", "").lower()
                for func in request.desired_functions
            )
            if not desired_match and applicable:
                pass
            if desired_match or self._is_relevant_algorithm(algo, request.desired_functions):
                adapted_params = self._adapt_parameters(algo, hw)
                warnings = []
                required_sensors = algo.get("required_sensors", [])
                for rs in required_sensors:
                    if rs not in sensor_type_strs:
                        warnings.append(f"算法'{algo['name']}'需要传感器'{rs}'，但硬件未检测到")
                matched_algorithms.append({
                    "algorithm": algo,
                    "adapted_parameters": adapted_params,
                    "compatibility_notes": self._generate_compatibility_notes(algo, compute_platform, sensor_type_strs),
                    "warnings": warnings,
                    "estimated_performance": self._estimate_performance(algo, compute_platform),
                })
        contradictions = self._detector.check_hardware_algorithm(hw, request.desired_functions)
        return {
            "matched_algorithms": matched_algorithms,
            "contradictions": contradictions,
            "platform_info": {
                "compute_platform": compute_platform_str,
                "max_algorithm_level": max_level,
                "description": platform_info.get("description", ""),
            },
            "total_matched": len(matched_algorithms),
        }

    def _is_relevant_algorithm(self, algo: dict, desired_functions: list[str]) -> bool:
        algo_name = algo.get("name", "").lower()
        algo_desc = algo.get("description", "").lower()
        algo_category = algo.get("_category", "").lower()
        relevance_map = {
            "运动": ["运动学", "控制", "pid", "mpc"],
            "抓取": ["逆运动学", "视觉伺服", "阻抗"],
            "导航": ["路径规划", "slam", "避障", "纯追踪"],
            "平衡": ["平衡", "zmp", "vmc", "倒立摆"],
            "步态": ["步态", "cpg", "行走"],
            "视觉": ["yolo", "检测", "aruco", "视觉"],
            "力控": ["阻抗", "力控", "柔顺"],
        }
        for func in desired_functions:
            keywords = relevance_map.get(func, [func.lower()])
            if any(kw in algo_name or kw in algo_desc or kw in algo_category for kw in keywords):
                return True
        return False

    def _adapt_parameters(self, algo: dict, hw: HardwareInfo) -> dict:
        params = {}
        for p in algo.get("parameters", []):
            name = p.get("name")
            default = p.get("default")
            if default is not None:
                params[name] = default
        mechanical = hw.mechanical or {}
        if "运动学" in algo.get("_category", ""):
            if mechanical.get("wheel_radius"):
                params["wheel_radius"] = mechanical["wheel_radius"]
            if mechanical.get("wheel_base"):
                params["wheel_base"] = mechanical["wheel_base"]
            if mechanical.get("hip_length"):
                params["hip_length"] = mechanical["hip_length"]
            if mechanical.get("thigh_length"):
                params["thigh_length"] = mechanical["thigh_length"]
            if mechanical.get("calf_length"):
                params["calf_length"] = mechanical["calf_length"]
        return params

    def _generate_compatibility_notes(self, algo: dict, platform: ComputePlatform, sensor_types: list[str]) -> list[str]:
        notes = []
        required_sensors = algo.get("required_sensors", [])
        for rs in required_sensors:
            if rs not in sensor_types:
                notes.append(f"缺少传感器: {rs}")
        algo_level_str = algo.get("level", "basic")
        level_map = {"basic": 1, "advanced": 2, "expert": 3}
        algo_level = level_map.get(algo_level_str, 1)
        platform_info = COMPUTE_ALGORITHM_MAP.get(platform, {})
        max_level = platform_info.get("max_level", 1)
        if algo_level == max_level:
            notes.append(f"算法已达当前平台{platform.value}的算力上限，可能影响控制频率")
        return notes

    def _estimate_performance(self, algo: dict, platform: ComputePlatform) -> dict:
        platform_info = COMPUTE_ALGORITHM_MAP.get(platform, {})
        algo_level_str = algo.get("level", "basic")
        level_map = {"basic": 1, "advanced": 2, "expert": 3}
        algo_level = level_map.get(algo_level_str, 1)
        max_level = platform_info.get("max_level", 1)
        if algo_level <= max_level - 1:
            estimated_freq = "100-1000Hz"
            latency = "<1ms"
        elif algo_level == max_level:
            estimated_freq = "10-100Hz"
            latency = "1-10ms"
        else:
            estimated_freq = "1-10Hz"
            latency = ">100ms"
        return {
            "estimated_control_frequency": estimated_freq,
            "estimated_latency": latency,
            "compute_utilization": "low" if algo_level < max_level else ("medium" if algo_level == max_level else "high"),
        }
