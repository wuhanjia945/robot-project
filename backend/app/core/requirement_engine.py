import logging
from typing import Optional
from app.config import settings
from app.core.llm_client import llm_client
from app.core.prompts import PROMPT_REQUIREMENT_ANALYSIS
from app.schemas.requirement import (
    RequirementCreate, RobotType, CoreFunction, FunctionPriority,
    PerformanceSpec, BudgetRange, DevConstraint, DeployEnvironment,
    HardwareInfo, HardwareAlgorithmRequest
)

logger = logging.getLogger(__name__)

QUESTION_ROUNDS = {
    1: {
        "name": "定方向",
        "questions": [
            {"id": "robot_type", "text": "您想开发什么类型的机器人？", "type": "select", "options": [e.value for e in RobotType], "required": True},
            {"id": "core_function_1", "text": "机器人最核心的功能是什么？（如：移动、抓取、视觉识别、语音交互、自主导航）", "type": "text", "required": True},
            {"id": "core_function_2", "text": "第二重要的功能是什么？", "type": "text", "required": False},
            {"id": "budget_range", "text": "您的预算范围是多少？（单位：元）", "type": "range", "required": True},
            {"id": "usage_scenario", "text": "机器人主要在什么场景下使用？（如：室内家庭、工厂车间、室外、实验室）", "type": "text", "required": True},
        ]
    },
    2: {
        "name": "定细节",
        "questions_template": [
            {"id": "payload", "text": "机器人需要承载多重的负载？（单位：kg）", "type": "number", "depends_on": {"robot_type": ["wheeled", "arm", "composite"]}},
            {"id": "speed", "text": "机器人最大运动速度要求？（单位：m/s）", "type": "number", "depends_on": {"robot_type": ["wheeled", "legged", "composite", "drone"]}},
            {"id": "accuracy", "text": "定位/运动精度要求？（单位：mm，如无特殊要求填0）", "type": "number", "depends_on": {"robot_type": ["arm", "composite"]}},
            {"id": "battery_life", "text": "续航时间要求？（单位：小时）", "type": "number"},
            {"id": "team_skills", "text": "团队技术背景？（如：嵌入式开发、Python算法、全栈等）", "type": "text", "required": True},
            {"id": "timeline", "text": "期望开发周期？（单位：周）", "type": "number", "required": True},
            {"id": "production_scale", "text": "是否需要量产？预计产量？", "type": "text"},
            {"id": "control_mode", "text": "控制方式偏好？（遥控/半自主/全自主）", "type": "select", "options": ["遥控", "半自主", "全自主"], "required": True},
        ]
    },
    3: {
        "name": "定边界",
        "questions": [
            {"id": "extreme_scenario", "text": "机器人可能遇到的极端场景？（如：断电、碰撞、网络中断）", "type": "text"},
            {"id": "safety_requirement", "text": "安全等级要求？（如：人机协作需要ISO 10218/TS 15066认证）", "type": "text"},
            {"id": "scalability", "text": "未来是否需要扩展功能？如需要，可能扩展哪些？", "type": "text"},
            {"id": "network_condition", "text": "部署环境的网络条件？（有网/弱网/完全离线）", "type": "select", "options": ["有网", "弱网", "完全离线"], "required": True},
            {"id": "existing_hardware", "text": "是否已有部分硬件？如有，请描述", "type": "text"},
        ]
    }
}

BUDGET_CONSTRAINTS = {
    RobotType.WHEELED: {"min_viable": 100, "min_reasonable": 500, "recommended": 2000},
    RobotType.LEGGED: {"min_viable": 1500, "min_reasonable": 3000, "recommended": 8000},
    RobotType.ARM: {"min_viable": 500, "min_reasonable": 2000, "recommended": 5000},
    RobotType.COMPOSITE: {"min_viable": 3000, "min_reasonable": 8000, "recommended": 20000},
    RobotType.DRONE: {"min_viable": 500, "min_reasonable": 1500, "recommended": 5000},
}

class RequirementEngine:
    def __init__(self):
        self._sessions: dict[str, dict] = {}

    def create_session(self, session_id: str) -> dict:
        self._sessions[session_id] = {
            "current_round": 1,
            "answers": {},
            "contradictions": [],
            "completeness_score": 0.0,
        }
        return self.get_round_questions(session_id, 1)

    def get_round_questions(self, session_id: str, round_num: int) -> dict:
        round_config = QUESTION_ROUNDS.get(round_num)
        if not round_config:
            return {"error": f"Round {round_num} not found", "questions": []}
        session = self._sessions.get(session_id, {})
        answers = session.get("answers", {})
        robot_type = answers.get("robot_type")
        questions = []
        if round_num == 2:
            for q in round_config["questions_template"]:
                depends = q.get("depends_on")
                if depends:
                    if robot_type and robot_type not in depends.get("robot_type", []):
                        continue
                questions.append(q)
        else:
            questions = round_config.get("questions", [])
        return {
            "round": round_num,
            "round_name": round_config["name"],
            "questions": questions,
            "total_rounds": len(QUESTION_ROUNDS),
        }

    def submit_answers(self, session_id: str, round_num: int, answers: dict) -> dict:
        if session_id not in self._sessions:
            self.create_session(session_id)
        session = self._sessions[session_id]
        session["answers"].update(answers)
        contradictions = self._check_contradictions(session["answers"])
        session["contradictions"] = contradictions
        session["completeness_score"] = self._calculate_completeness(session["answers"])
        next_round = round_num + 1 if round_num < len(QUESTION_ROUNDS) else None
        result = {
            "session_id": session_id,
            "current_round": round_num,
            "completeness_score": session["completeness_score"],
            "contradictions": contradictions,
            "next_round": next_round,
        }
        if next_round and session["completeness_score"] < 85.0:
            result["next_questions"] = self.get_round_questions(session_id, next_round)
        elif session["completeness_score"] >= 85.0:
            result["ready_for_solution"] = True
        return result

    def _check_contradictions(self, answers: dict) -> list[dict]:
        contradictions = []
        robot_type_str = answers.get("robot_type", "")
        try:
            robot_type = RobotType(robot_type_str)
        except ValueError:
            robot_type = None
        budget_min = answers.get("budget_min")
        budget_max = answers.get("budget_max")
        if robot_type and budget_max is not None:
            constraints = BUDGET_CONSTRAINTS.get(robot_type, {})
            min_viable = constraints.get("min_viable", 0)
            min_reasonable = constraints.get("min_reasonable", 0)
            if budget_max < min_viable:
                contradictions.append({
                    "type": "budget_insufficient",
                    "severity": "critical",
                    "message": f"预算{budget_max}元远低于{robot_type.value}类型机器人的最低可行成本{min_viable}元",
                    "suggestion": f"建议提高预算至{min_reasonable}元以上，或降低机器人类型/功能需求"
                })
            elif budget_max < min_reasonable:
                contradictions.append({
                    "type": "budget_tight",
                    "severity": "warning",
                    "message": f"预算{budget_max}元低于{robot_type.value}类型机器人的合理成本{min_reasonable}元",
                    "suggestion": f"建议预算{min_reasonable}元以上可获得较好效果"
                })
        core_funcs = [answers.get("core_function_1", ""), answers.get("core_function_2", "")]
        if robot_type == RobotType.ARM and "自主导航" in core_funcs:
            contradictions.append({
                "type": "function_mismatch",
                "severity": "warning",
                "message": "机械臂类型机器人通常不具备自主导航功能",
                "suggestion": "如需移动+抓取，建议选择复合型机器人(底盘+机械臂)"
            })
        if robot_type == RobotType.WHEELED and "抓取" in str(core_funcs):
            contradictions.append({
                "type": "function_mismatch",
                "severity": "info",
                "message": "轮式机器人需要额外配备机械臂才能实现抓取功能",
                "suggestion": "建议选择复合型机器人，或降低抓取功能优先级"
            })
        return contradictions

    def _calculate_completeness(self, answers: dict) -> float:
        total_weight = 0.0
        filled_weight = 0.0
        weight_map = {
            "robot_type": 20, "core_function_1": 15, "budget_range": 15,
            "budget_min": 8, "budget_max": 8, "usage_scenario": 10,
            "payload": 5, "speed": 3, "accuracy": 3, "battery_life": 3,
            "team_skills": 8, "timeline": 5, "control_mode": 5,
            "network_condition": 5, "safety_requirement": 2,
        }
        for key, weight in weight_map.items():
            total_weight += weight
            if answers.get(key) is not None and answers.get(key) != "":
                filled_weight += weight
        if total_weight == 0:
            return 0.0
        return round((filled_weight / total_weight) * 100, 1)

    def get_session(self, session_id: str) -> Optional[dict]:
        return self._sessions.get(session_id)

    def build_requirement(self, session_id: str) -> Optional[RequirementCreate]:
        session = self._sessions.get(session_id)
        if not session:
            return None
        answers = session["answers"]
        robot_type_str = answers.get("robot_type", "wheeled")
        try:
            robot_type = RobotType(robot_type_str)
        except ValueError:
            robot_type = RobotType.WHEELED
        core_functions = []
        for i in range(1, 3):
            func_name = answers.get(f"core_function_{i}")
            if func_name:
                core_functions.append(CoreFunction(
                    name=func_name,
                    priority=FunctionPriority.CRITICAL if i == 1 else FunctionPriority.HIGH,
                ))
        budget_min = answers.get("budget_min", 0)
        budget_max = answers.get("budget_max", 0)
        if not budget_min and not budget_max:
            budget_range_str = answers.get("budget_range", "0-0")
            try:
                parts = budget_range_str.replace("元", "").split("-")
                budget_min = float(parts[0].strip())
                budget_max = float(parts[1].strip()) if len(parts) > 1 else budget_min
            except (ValueError, IndexError):
                budget_min, budget_max = 0, 0
        return RequirementCreate(
            robot_type=robot_type,
            core_functions=core_functions,
            performance=PerformanceSpec(
                payload_kg=answers.get("payload"),
                speed_ms=answers.get("speed"),
                battery_hours=answers.get("battery_life"),
                position_accuracy_mm=answers.get("accuracy"),
            ),
            budget=BudgetRange(min_amount=budget_min, max_amount=budget_max),
            constraints=DevConstraint(
                team_skills=answers.get("team_skills", "").split(",") if answers.get("team_skills") else [],
                timeline_weeks=answers.get("timeline"),
                production_scale=answers.get("production_scale"),
            ),
            environment=DeployEnvironment(
                network=answers.get("network_condition", "online"),
            ),
            description=answers.get("usage_scenario"),
        )

    def process_hardware_algorithm_request(self, request: HardwareAlgorithmRequest) -> dict:
        hw = request.hardware_info
        compute = hw.compute_platform
        compute_platform_str = compute.get("platform", "STM32F4")
        actuator_count = sum(a.get("quantity", 1) for a in hw.actuators)
        sensor_types = [s.get("type", "") for s in hw.sensors]
        problems = hw.problem_description or ""
        return {
            "hardware_summary": {
                "compute_platform": compute_platform_str,
                "actuator_count": actuator_count,
                "sensor_types": sensor_types,
                "has_camera": "camera" in sensor_types or "depth_camera" in sensor_types,
                "has_imu": "imu" in sensor_types,
                "has_lidar": "lidar_2d" in sensor_types or "lidar_3d" in sensor_types,
                "has_force_sensor": "force_sensor" in sensor_types,
            },
            "desired_functions": request.desired_functions,
            "follow_up_questions": self._generate_hardware_follow_ups(hw, request),
        }

    def _generate_hardware_follow_ups(self, hw: HardwareInfo, request: HardwareAlgorithmRequest) -> list[dict]:
        questions = []
        sensor_types = [s.get("type", "") for s in hw.sensors]
        if not hw.mechanical and any(a.get("type") in ["stepper", "brushless", "servo_motor"] for a in hw.actuators):
            questions.append({
                "id": "mechanical_structure",
                "text": "请提供机器人的机械结构参数（连杆长度、关节限位等），这对运动学建模至关重要",
                "type": "text",
                "required": True,
            })
        if "imu" not in sensor_types and any(f in request.desired_functions for f in ["平衡控制", "步态生成", "导航"]):
            questions.append({
                "id": "imu_missing",
                "text": "您需要平衡/步态/导航功能，但未检测到IMU传感器。是否有IMU？如没有，建议添加",
                "type": "confirm",
                "required": True,
            })
        if not hw.problem_description:
            questions.append({
                "id": "current_problem",
                "text": "请描述当前遇到的具体问题（如：走不直、抓不准、站不稳等），越详细越好",
                "type": "text",
                "required": True,
            })
        return questions

    def analyze_with_llm(self, user_input: str) -> Optional[dict]:
        if not llm_client.is_available:
            return None
        from app.core.prompts import SYSTEM_PROMPT_ROBOT_EXPERT
        user_prompt = PROMPT_REQUIREMENT_ANALYSIS.format(user_input=user_input)
        result = llm_client.chat_json(SYSTEM_PROMPT_ROBOT_EXPERT, user_prompt)
        if result:
            logger.info("[RequirementEngine] LLM analysis completed")
        return result
