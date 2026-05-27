import pytest
import time
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.schemas.requirement import (
    RequirementCreate, RobotType, CoreFunction, FunctionPriority,
    PerformanceSpec, BudgetRange, DevConstraint, DeployEnvironment,
    HardwareInfo, HardwareAlgorithmRequest
)
from app.schemas.hardware import ComputePlatform, ActuatorType, SensorType
from app.schemas.algorithm import AlgorithmLevel, RobotCategory
from app.core.knowledge_base import KnowledgeBase
from app.core.hardware_catalog import HardwareCatalog
from app.core.requirement_engine import RequirementEngine
from app.core.contradiction_detector import ContradictionDetector
from app.core.solution_generator import SolutionGenerator
from app.core.algorithm_adapter import AlgorithmAdapter


class TestKnowledgeBase:
    def setup_method(self):
        self.kb = KnowledgeBase()

    def test_load(self):
        self.kb.load()
        assert self.kb._loaded is True

    def test_get_all_categories(self):
        categories = self.kb.get_all_categories()
        assert len(categories) > 0
        assert "运动控制" in categories

    def test_get_items_by_category(self):
        items = self.kb.get_items_by_category("运动控制")
        assert len(items) > 0
        assert any(i.get("name") == "ROS2 Control" for i in items)

    def test_search_items(self):
        results = self.kb.search_items("YOLO")
        assert len(results) > 0

    def test_get_items_by_tag(self):
        results = self.kb.get_items_by_tag("ros2")
        assert len(results) > 0

    def test_get_items_by_compatibility(self):
        results = self.kb.get_items_by_compatibility("Linux")
        assert len(results) > 0

    def test_get_item_by_name(self):
        item = self.kb.get_item_by_name("MoveIt2")
        assert item is not None
        assert item["name"] == "MoveIt2"

    def test_get_item_by_name_not_found(self):
        item = self.kb.get_item_by_name("不存在的东西")
        assert item is None

    def test_get_all_items(self):
        items = self.kb.get_all_items()
        assert len(items) > 20


class TestHardwareCatalog:
    def setup_method(self):
        self.catalog = HardwareCatalog()

    def test_load(self):
        self.catalog.load()
        assert self.catalog._loaded is True

    def test_get_all_categories(self):
        categories = self.catalog.get_all_categories()
        assert len(categories) > 0

    def test_get_items_by_robot_type(self):
        items = self.catalog.get_items_by_robot_type("wheeled")
        assert len(items) > 0

    def test_get_robot_kits(self):
        kits = self.catalog.get_robot_kits()
        assert len(kits) > 0

    def test_get_robot_kits_by_type(self):
        kits = self.catalog.get_robot_kits(robot_type="wheeled")
        assert len(kits) > 0
        assert all(k.get("robot_type") == "wheeled" for k in kits)

    def test_get_items_by_budget(self):
        kits = self.catalog.get_items_by_budget(0, 500, robot_type="wheeled")
        assert len(kits) > 0

    def test_search_items(self):
        results = self.catalog.search_items("树莓派")
        assert len(results) > 0


class TestRequirementEngine:
    def setup_method(self):
        self.engine = RequirementEngine()

    def test_create_session(self):
        result = self.engine.create_session("test-session-1")
        assert "questions" in result or "round" in result

    def test_get_round_questions(self):
        self.engine.create_session("test-session-2")
        result = self.engine.get_round_questions("test-session-2", 1)
        assert "questions" in result
        assert len(result["questions"]) > 0

    def test_submit_answers_round1(self):
        self.engine.create_session("test-session-3")
        answers = {
            "robot_type": "wheeled",
            "core_function_1": "自主导航",
            "budget_min": 500,
            "budget_max": 3000,
            "usage_scenario": "室内导航",
        }
        result = self.engine.submit_answers("test-session-3", 1, answers)
        assert "completeness_score" in result
        assert result["completeness_score"] > 0

    def test_contradiction_detection_low_budget(self):
        self.engine.create_session("test-session-4")
        answers = {
            "robot_type": "legged",
            "core_function_1": "步态行走",
            "budget_min": 0,
            "budget_max": 50,
        }
        result = self.engine.submit_answers("test-session-4", 1, answers)
        assert len(result["contradictions"]) > 0

    def test_build_requirement(self):
        self.engine.create_session("test-session-5")
        answers = {
            "robot_type": "wheeled",
            "core_function_1": "自主导航",
            "budget_min": 500,
            "budget_max": 3000,
            "usage_scenario": "室内",
            "team_skills": "Python,嵌入式",
            "timeline": 8,
            "control_mode": "半自主",
            "network_condition": "有网",
        }
        self.engine.submit_answers("test-session-5", 1, answers)
        req = self.engine.build_requirement("test-session-5")
        assert req is not None
        assert req.robot_type == RobotType.WHEELED

    def test_hardware_algorithm_request(self):
        request = HardwareAlgorithmRequest(
            hardware_info=HardwareInfo(
                actuators=[{"type": "servo", "quantity": 2}],
                sensors=[{"type": "encoder"}, {"type": "imu"}],
                compute_platform={"platform": "stm32f4"},
            ),
            desired_functions=["运动控制", "平衡控制"],
        )
        result = self.engine.process_hardware_algorithm_request(request)
        assert "hardware_summary" in result
        assert "follow_up_questions" in result


class TestContradictionDetector:
    def setup_method(self):
        self.detector = ContradictionDetector()

    def test_budget_insufficient(self):
        req = RequirementCreate(
            robot_type=RobotType.LEGGED,
            core_functions=[CoreFunction(name="步态行走", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=0, max_amount=50),
        )
        contradictions = self.detector.check_requirement(req)
        assert len(contradictions) > 0
        assert any(c["type"] == "budget_insufficient" for c in contradictions)

    def test_function_mismatch_arm_navigation(self):
        req = RequirementCreate(
            robot_type=RobotType.ARM,
            core_functions=[CoreFunction(name="自主导航", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=0, max_amount=5000),
        )
        contradictions = self.detector.check_requirement(req)
        assert any(c["type"] == "function_mismatch" for c in contradictions)

    def test_no_contradiction_reasonable(self):
        req = RequirementCreate(
            robot_type=RobotType.WHEELED,
            core_functions=[CoreFunction(name="自主导航", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=1000, max_amount=3000),
        )
        contradictions = self.detector.check_requirement(req)
        critical = [c for c in contradictions if c["severity"] == "critical"]
        assert len(critical) == 0

    def test_hardware_compute_insufficient(self):
        hw = HardwareInfo(
            actuators=[{"type": "servo", "quantity": 12}],
            sensors=[{"type": "imu"}],
            compute_platform={"platform": "stm32f103"},
        )
        contradictions = self.detector.check_hardware_algorithm(hw, ["MPC", "WBC"])
        assert len(contradictions) > 0
        assert any(c["type"] == "compute_insufficient" for c in contradictions)

    def test_hardware_sensor_missing(self):
        hw = HardwareInfo(
            actuators=[{"type": "servo", "quantity": 2}],
            sensors=[{"type": "encoder"}],
            compute_platform={"platform": "raspberry_pi5"},
        )
        contradictions = self.detector.check_hardware_algorithm(hw, ["导航"])
        assert any(c["type"] == "sensor_missing" for c in contradictions)


class TestSolutionGenerator:
    def setup_method(self):
        self.generator = SolutionGenerator()

    def test_generate_wheeled_solution(self):
        req = RequirementCreate(
            robot_type=RobotType.WHEELED,
            core_functions=[CoreFunction(name="自主导航", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(speed_ms=0.5),
            budget=BudgetRange(min_amount=500, max_amount=3000),
        )
        solution = self.generator.generate(req)
        assert solution.status.value == "proposed"
        assert len(solution.architecture_layers) > 0
        assert len(solution.tech_stack) > 0
        assert len(solution.bom.items) > 0
        assert solution.estimated_cost_min > 0

    def test_generate_arm_solution(self):
        req = RequirementCreate(
            robot_type=RobotType.ARM,
            core_functions=[CoreFunction(name="视觉抓取", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(position_accuracy_mm=1.0),
            budget=BudgetRange(min_amount=1000, max_amount=5000),
        )
        solution = self.generator.generate(req)
        assert len(solution.architecture_layers) > 0
        assert any("逆运动学" in a.algorithm.name for a in solution.algorithms)

    def test_generate_quadruped_solution(self):
        req = RequirementCreate(
            robot_type=RobotType.LEGGED,
            core_functions=[CoreFunction(name="步态行走", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=2000, max_amount=8000),
        )
        solution = self.generator.generate(req)
        assert len(solution.architecture_layers) > 0
        assert any("步态" in a.algorithm.name for a in solution.algorithms)

    def test_generate_drone_solution(self):
        req = RequirementCreate(
            robot_type=RobotType.DRONE,
            core_functions=[CoreFunction(name="飞行控制", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=500, max_amount=3000),
        )
        solution = self.generator.generate(req)
        assert len(solution.bom.items) > 0

    def test_solution_with_contradictions(self):
        req = RequirementCreate(
            robot_type=RobotType.LEGGED,
            core_functions=[CoreFunction(name="步态行走", priority=FunctionPriority.CRITICAL)],
            performance=PerformanceSpec(),
            budget=BudgetRange(min_amount=0, max_amount=50),
        )
        solution = self.generator.generate(req)
        assert len(solution.contradictions) > 0


class TestAlgorithmAdapter:
    def setup_method(self):
        self.adapter = AlgorithmAdapter()

    def test_load(self):
        self.adapter.load()
        assert self.adapter._loaded is True

    def test_get_all_algorithms(self):
        algos = self.adapter.get_all_algorithms()
        assert len(algos) > 15

    def test_get_algorithms_by_category(self):
        algos = self.adapter.get_algorithms_by_category("运动学")
        assert len(algos) > 0

    def test_get_algorithms_by_level(self):
        algos = self.adapter.get_algorithms_by_level("basic")
        assert len(algos) > 0

    def test_search_algorithms(self):
        algos = self.adapter.search_algorithms("PID")
        assert len(algos) > 0

    def test_adapt_for_hardware(self):
        request = HardwareAlgorithmRequest(
            hardware_info=HardwareInfo(
                actuators=[{"type": "servo", "quantity": 2, "specs": {"torque": "11kg·cm"}}],
                sensors=[{"type": "encoder"}, {"type": "imu"}],
                compute_platform={"platform": "STM32F4"},
                mechanical={"wheel_radius": 0.033, "wheel_base": 0.15},
            ),
            desired_functions=["运动", "平衡"],
        )
        result = self.adapter.adapt_for_hardware(request)
        assert "matched_algorithms" in result
        assert "contradictions" in result
        assert "platform_info" in result

    def test_adapt_advanced_on_basic_platform(self):
        request = HardwareAlgorithmRequest(
            hardware_info=HardwareInfo(
                actuators=[{"type": "servo", "quantity": 12}],
                sensors=[{"type": "imu"}, {"type": "encoder"}],
                compute_platform={"platform": "stm32f103"},
            ),
            desired_functions=["MPC", "WBC"],
        )
        result = self.adapter.adapt_for_hardware(request)
        assert len(result["contradictions"]) > 0


class TestAPIEndpoints:
    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)

    def test_health(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_requirement_session(self, client):
        response = client.post("/api/requirement/session")
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data

    def test_requirement_round_questions(self, client):
        create_resp = client.post("/api/requirement/session")
        session_id = create_resp.json()["session_id"]
        response = client.get(f"/api/requirement/session/{session_id}/round/1")
        assert response.status_code == 200

    def test_solution_generate(self, client):
        response = client.post("/api/solution/generate", json={
            "robot_type": "wheeled",
            "core_functions": [{"name": "自主导航", "priority": "critical"}],
            "performance": {},
            "budget": {"min_amount": 500, "max_amount": 3000},
        })
        assert response.status_code == 200
        data = response.json()
        assert "architecture_layers" in data
        assert "bom" in data

    def test_algorithm_list(self, client):
        response = client.get("/api/algorithm/list")
        assert response.status_code == 200

    def test_algorithm_search(self, client):
        response = client.get("/api/algorithm/search?keyword=PID")
        assert response.status_code == 200

    def test_hardware_list(self, client):
        response = client.get("/api/hardware/list")
        assert response.status_code == 200

    def test_hardware_categories(self, client):
        response = client.get("/api/hardware/categories")
        assert response.status_code == 200

    def test_hardware_kits(self, client):
        response = client.get("/api/hardware/kits")
        assert response.status_code == 200

    def test_validator_requirement(self, client):
        response = client.post("/api/validator/requirement", json={
            "robot_type": "wheeled",
            "core_functions": [{"name": "自主导航", "priority": "critical"}],
            "performance": {},
            "budget": {"min_amount": 500, "max_amount": 3000},
        })
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert "contradictions" in data

    def test_validator_contradiction(self, client):
        response = client.post("/api/validator/requirement", json={
            "robot_type": "legged",
            "core_functions": [{"name": "步态行走", "priority": "critical"}],
            "performance": {},
            "budget": {"min_amount": 0, "max_amount": 50},
        })
        data = response.json()
        assert data["valid"] is False
        assert data["critical_count"] > 0
