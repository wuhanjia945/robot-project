import uuid
import logging
from datetime import datetime
from typing import Optional
from app.config import settings
from app.core.llm_client import llm_client
from app.core.prompts import PROMPT_SOLUTION_GENERATION
from app.schemas.requirement import RequirementCreate, RobotType
from app.schemas.hardware import BOMSheet, BOMItem, HardwareItem
from app.schemas.algorithm import AlgorithmSpec, AlgorithmLevel, AlgorithmAdaptationResult, RobotCategory
from app.schemas.solution import (
    SolutionResponse, SolutionStatus, TechStackItem, ArchitectureLayer, Contradiction
)
from app.core.knowledge_base import KnowledgeBase
from app.core.hardware_catalog import HardwareCatalog
from app.core.contradiction_detector import ContradictionDetector

logger = logging.getLogger(__name__)

ROBOT_TYPE_TO_CATEGORY = {
    RobotType.WHEELED: [RobotCategory.WHEELED, RobotCategory.DIFF_DRIVE, RobotCategory.MECANUM],
    RobotType.LEGGED: [RobotCategory.QUADRUPED, RobotCategory.HUMANOID],
    RobotType.ARM: [RobotCategory.ARM],
    RobotType.COMPOSITE: [RobotCategory.WHEELED, RobotCategory.ARM],
    RobotType.DRONE: [RobotCategory.DRONE],
}

ARCHITECTURE_TEMPLATES = {
    RobotType.WHEELED: [
        ArchitectureLayer(name="感知层", components=["激光雷达/摄像头", "IMU", "编码器"], description="环境感知与自身状态检测"),
        ArchitectureLayer(name="决策层", components=["SLAM建图", "路径规划", "避障"], description="地图构建与路径决策"),
        ArchitectureLayer(name="控制层", components=["运动学解算", "PID控制", "速度分配"], description="运动控制与速度指令生成"),
        ArchitectureLayer(name="驱动层", components=["电机驱动", "PWM/UART控制"], description="底层电机驱动与信号输出"),
        ArchitectureLayer(name="通信层", components=["ROS2/串口", "WiFi/蓝牙"], description="模块间通信与远程控制"),
    ],
    RobotType.LEGGED: [
        ArchitectureLayer(name="感知层", components=["IMU", "关节编码器", "足端力传感器"], description="姿态与触地感知"),
        ArchitectureLayer(name="决策层", components=["步态生成", "地形评估", "路径规划"], description="步态决策与路径规划"),
        ArchitectureLayer(name="控制层", components=["全身控制WBC/MPC", "逆运动学", "平衡控制"], description="全身协调与平衡控制"),
        ArchitectureLayer(name="驱动层", components=["电机驱动", "FOC/总线舵机控制"], description="关节电机驱动"),
        ArchitectureLayer(name="通信层", components=["ROS2", "CAN/串口总线"], description="模块间通信"),
    ],
    RobotType.ARM: [
        ArchitectureLayer(name="感知层", components=["摄像头/深度相机", "关节编码器", "力传感器"], description="视觉与力觉感知"),
        ArchitectureLayer(name="决策层", components=["目标检测", "抓取规划", "碰撞检测"], description="抓取策略与运动规划"),
        ArchitectureLayer(name="控制层", components=["逆运动学", "轨迹规划", "力/位混合控制"], description="运动控制与力控"),
        ArchitectureLayer(name="驱动层", components=["电机驱动", "PWM/总线控制"], description="关节驱动"),
        ArchitectureLayer(name="通信层", components=["ROS2 MoveIt2", "串口/CAN"], description="运动规划通信"),
    ],
    RobotType.COMPOSITE: [
        ArchitectureLayer(name="感知层", components=["激光雷达", "深度相机", "IMU", "编码器", "力传感器"], description="多模态感知融合"),
        ArchitectureLayer(name="决策层", components=["SLAM", "路径规划", "抓取规划", "避障"], description="导航+操作联合决策"),
        ArchitectureLayer(name="控制层", components=["底盘运动学", "机械臂IK", "协调控制"], description="底盘+臂协调控制"),
        ArchitectureLayer(name="驱动层", components=["底盘电机驱动", "臂电机驱动"], description="双系统驱动"),
        ArchitectureLayer(name="通信层", components=["ROS2", "WiFi/CAN"], description="全系统通信"),
    ],
    RobotType.DRONE: [
        ArchitectureLayer(name="感知层", components=["IMU", "气压计", "光流/GPS", "摄像头"], description="飞行状态与环境感知"),
        ArchitectureLayer(name="决策层", components=["飞行模式管理", "路径规划", "避障"], description="飞行决策"),
        ArchitectureLayer(name="控制层", components=["姿态控制PID", "位置控制", "高度保持"], description="飞行控制"),
        ArchitectureLayer(name="驱动层", components=["电调PWM", "FOC控制"], description="电机驱动"),
        ArchitectureLayer(name="通信层", components=["MAVLink", "遥控器/数传"], description="飞控通信"),
    ],
}

class SolutionGenerator:
    def __init__(self):
        self._kb = KnowledgeBase()
        self._hw_catalog = HardwareCatalog()
        self._detector = ContradictionDetector()

    def generate(self, requirement: RequirementCreate) -> SolutionResponse:
        contradictions = self._detector.check_requirement(requirement)

        architecture = []
        tech_stack = []
        bom = BOMSheet(items=[], total_min=0, total_max=0)
        algorithms = []
        preset_success = False

        try:
            architecture = self._generate_architecture(requirement)
            tech_stack = self._select_tech_stack(requirement)
            bom = self._generate_bom(requirement)
            algorithms = self._select_algorithms(requirement)
            preset_success = True
        except Exception as e:
            logger.warning(f"[SolutionGenerator] Preset generation failed: {e}")

        needs_llm = not preset_success or self._should_use_llm(requirement)
        llm_solution = None

        if needs_llm and llm_client.is_available:
            logger.info("[SolutionGenerator] Using LLM for solution generation")
            llm_solution = self._generate_with_llm(requirement)

        if llm_solution:
            return llm_solution

        cost_min, cost_max = self._estimate_cost(bom)
        risk = self._assess_risk(requirement, contradictions)
        return SolutionResponse(
            id=str(uuid.uuid4()),
            requirement_id="",
            status=SolutionStatus.PROPOSED,
            architecture_layers=architecture,
            tech_stack=tech_stack,
            bom=bom,
            algorithms=algorithms,
            contradictions=contradictions,
            estimated_cost_min=cost_min,
            estimated_cost_max=cost_max,
            risk_assessment=risk,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

    def _generate_architecture(self, requirement: RequirementCreate) -> list[ArchitectureLayer]:
        template = ARCHITECTURE_TEMPLATES.get(requirement.robot_type, ARCHITECTURE_TEMPLATES[RobotType.WHEELED])
        return template

    def _select_tech_stack(self, requirement: RequirementCreate) -> list[TechStackItem]:
        stack = []
        func_names = [f.name for f in requirement.core_functions]
        if requirement.robot_type in [RobotType.WHEELED, RobotType.COMPOSITE]:
            stack.append(TechStackItem(name="ROS2", version="Humble/Iron", purpose="机器人中间件", category="框架"))
            stack.append(TechStackItem(name="Nav2", version="1.2+", purpose="自主导航", category="导航"))
        if requirement.robot_type in [RobotType.ARM, RobotType.COMPOSITE]:
            stack.append(TechStackItem(name="MoveIt2", version="2.8+", purpose="运动规划", category="运动控制"))
        if "视觉" in func_names or "抓取" in func_names:
            stack.append(TechStackItem(name="OpenCV", version="4.8+", purpose="图像处理", category="视觉"))
            stack.append(TechStackItem(name="YOLOv8", version="8.1+", purpose="目标检测", category="视觉"))
        if requirement.robot_type == RobotType.LEGGED:
            stack.append(TechStackItem(name="ROS2 Control", version="3.15+", purpose="运动控制框架", category="运动控制"))
        if requirement.robot_type == RobotType.DRONE:
            stack.append(TechStackItem(name="PX4", version="1.14+", purpose="飞控系统", category="飞控"))
        stack.append(TechStackItem(name="Gazebo", version="Harmonic", purpose="仿真验证", category="仿真"))
        return stack

    def _generate_bom(self, requirement: RequirementCreate) -> BOMSheet:
        items = []
        budget_max = requirement.budget.max_amount
        if requirement.robot_type == RobotType.WHEELED:
            if budget_max < 500:
                items = self._wheeled_budget_bom()
            elif budget_max < 3000:
                items = self._wheeled_mid_bom()
            else:
                items = self._wheeled_advanced_bom()
        elif requirement.robot_type == RobotType.ARM:
            if budget_max < 2000:
                items = self._arm_budget_bom()
            else:
                items = self._arm_mid_bom()
        elif requirement.robot_type == RobotType.LEGGED:
            items = self._quadruped_bom()
        elif requirement.robot_type == RobotType.DRONE:
            items = self._drone_bom()
        else:
            items = self._composite_bom()
        total_min = sum(i.subtotal_min or (i.item.price_min * i.quantity) for i in items)
        total_max = sum(i.subtotal_max or (i.item.price_max * i.quantity) for i in items)
        return BOMSheet(items=items, total_min=total_min, total_max=total_max)

    def _wheeled_budget_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="主控制器", name="Arduino UNO R3", specs={}, price_min=25, price_max=40), quantity=1),
            BOMItem(item=HardwareItem(category="执行器", name="TT马达+轮子", specs={}, price_min=6, price_max=12), quantity=2),
            BOMItem(item=HardwareItem(category="驱动", name="L298N电机驱动", specs={}, price_min=8, price_max=15), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="HC-SR04超声波", specs={}, price_min=2, price_max=5), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="18650电池+电池盒", specs={}, price_min=12, price_max=20), quantity=1),
            BOMItem(item=HardwareItem(category="结构件", name="亚克力底盘套件", specs={}, price_min=15, price_max=25), quantity=1),
        ]

    def _wheeled_mid_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="主控制器", name="树莓派5 8GB", specs={}, price_min=580, price_max=750), quantity=1),
            BOMItem(item=HardwareItem(category="下位机", name="STM32F407开发板", specs={}, price_min=50, price_max=120), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="RPLIDAR A1", specs={}, price_min=350, price_max=500), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="MPU6050", specs={}, price_min=5, price_max=15), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="USB摄像头", specs={}, price_min=35, price_max=80), quantity=1),
            BOMItem(item=HardwareItem(category="执行器", name="步进电机+TMC2209", specs={}, price_min=45, price_max=90), quantity=4),
            BOMItem(item=HardwareItem(category="结构件", name="麦轮底盘套件", specs={}, price_min=200, price_max=400), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="3S锂电池+充电器", specs={}, price_min=80, price_max=150), quantity=1),
        ]

    def _wheeled_advanced_bom(self) -> list[BOMItem]:
        items = self._wheeled_mid_bom()
        items.append(BOMItem(item=HardwareItem(category="主控制器", name="Jetson Orin Nano 8GB", specs={}, price_min=1500, price_max=2000), quantity=1, notes="替代树莓派5"))
        items.append(BOMItem(item=HardwareItem(category="传感器", name="Intel RealSense D435i", specs={}, price_min=2200, price_max=3200), quantity=1))
        return items

    def _arm_budget_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="执行器", name="MG996R舵机", specs={}, price_min=8, price_max=20), quantity=6),
            BOMItem(item=HardwareItem(category="主控制器", name="Arduino UNO R3", specs={}, price_min=25, price_max=40), quantity=1),
            BOMItem(item=HardwareItem(category="结构件", name="3D打印机械臂件", specs={}, price_min=50, price_max=150), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="5V 3A电源", specs={}, price_min=10, price_max=20), quantity=1),
        ]

    def _arm_mid_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="执行器", name="串行总线舵机STS3215", specs={}, price_min=120, price_max=200), quantity=6),
            BOMItem(item=HardwareItem(category="执行器", name="夹爪舵机", specs={}, price_min=25, price_max=50), quantity=1),
            BOMItem(item=HardwareItem(category="主控制器", name="树莓派5 8GB", specs={}, price_min=580, price_max=750), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="USB摄像头", specs={}, price_min=35, price_max=80), quantity=1),
            BOMItem(item=HardwareItem(category="结构件", name="3D打印+铝型材", specs={}, price_min=100, price_max=200), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="12V 5A电源", specs={}, price_min=20, price_max=40), quantity=1),
        ]

    def _quadruped_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="执行器", name="串行总线舵机(大扭矩)", specs={}, price_min=120, price_max=200), quantity=12),
            BOMItem(item=HardwareItem(category="主控制器", name="树莓派5 8GB", specs={}, price_min=580, price_max=750), quantity=1),
            BOMItem(item=HardwareItem(category="下位机", name="STM32F407开发板", specs={}, price_min=50, price_max=120), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="BNO085 IMU", specs={}, price_min=45, price_max=80), quantity=1),
            BOMItem(item=HardwareItem(category="传感器", name="USB摄像头", specs={}, price_min=35, price_max=80), quantity=1),
            BOMItem(item=HardwareItem(category="结构件", name="3D打印+碳纤维板", specs={}, price_min=200, price_max=400), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="3S锂电池", specs={}, price_min=60, price_max=120), quantity=1),
        ]

    def _drone_bom(self) -> list[BOMItem]:
        return [
            BOMItem(item=HardwareItem(category="飞控", name="Pixhawk 4", specs={}, price_min=200, price_max=400), quantity=1),
            BOMItem(item=HardwareItem(category="执行器", name="无刷电机2212+电调", specs={}, price_min=40, price_max=80), quantity=4),
            BOMItem(item=HardwareItem(category="传感器", name="GPS模块", specs={}, price_min=30, price_max=80), quantity=1),
            BOMItem(item=HardwareItem(category="结构件", name="F450机架套件", specs={}, price_min=80, price_max=150), quantity=1),
            BOMItem(item=HardwareItem(category="电源", name="3S锂电池4000mAh", specs={}, price_min=80, price_max=150), quantity=1),
            BOMItem(item=HardwareItem(category="遥控", name="遥控器+接收机", specs={}, price_min=150, price_max=300), quantity=1),
        ]

    def _composite_bom(self) -> list[BOMItem]:
        items = self._wheeled_mid_bom()
        items.extend(self._arm_mid_bom()[1:])
        return items

    def _select_algorithms(self, requirement: RequirementCreate) -> list[AlgorithmAdaptationResult]:
        algorithms = []
        categories = ROBOT_TYPE_TO_CATEGORY.get(requirement.robot_type, [])
        if RobotCategory.WHEELED in categories or RobotCategory.DIFF_DRIVE in categories:
            algorithms.append(AlgorithmAdaptationResult(
                algorithm=AlgorithmSpec(
                    name="差速运动学", category="运动学", level=AlgorithmLevel.BASIC,
                    applicable_robots=[RobotCategory.DIFF_DRIVE],
                    required_sensors=[], required_compute=[],
                    parameters=[], description="差速底盘运动学",
                    input_spec={}, output_spec={}, difficulty=1
                ),
                adapted_parameters={"wheel_radius": 0.033, "wheel_base": 0.15},
                compatibility_notes=["需要编码器反馈"],
            ))
            algorithms.append(AlgorithmAdaptationResult(
                algorithm=AlgorithmSpec(
                    name="PID控制器", category="控制算法", level=AlgorithmLevel.BASIC,
                    applicable_robots=[RobotCategory.WHEELED],
                    required_sensors=[], required_compute=[],
                    parameters=[], description="速度/位置PID控制",
                    input_spec={}, output_spec={}, difficulty=1
                ),
                adapted_parameters={"kp": 1.0, "ki": 0.01, "kd": 0.1},
                compatibility_notes=["需要根据实际电机调参"],
            ))
        if RobotCategory.ARM in categories:
            algorithms.append(AlgorithmAdaptationResult(
                algorithm=AlgorithmSpec(
                    name="数值逆运动学", category="运动学", level=AlgorithmLevel.ADVANCED,
                    applicable_robots=[RobotCategory.ARM],
                    required_sensors=[], required_compute=[],
                    parameters=[], description="机械臂逆运动学求解",
                    input_spec={}, output_spec={}, difficulty=3
                ),
                adapted_parameters={"max_iterations": 100, "tolerance": 0.0001, "damping_factor": 0.01},
                compatibility_notes=["需要提供DH参数"],
            ))
        if RobotCategory.QUADRUPED in categories:
            algorithms.append(AlgorithmAdaptationResult(
                algorithm=AlgorithmSpec(
                    name="CPG步态生成器", category="步态与规划", level=AlgorithmLevel.ADVANCED,
                    applicable_robots=[RobotCategory.QUADRUPED],
                    required_sensors=[], required_compute=[],
                    parameters=[], description="四足步态生成",
                    input_spec={}, output_spec={}, difficulty=3
                ),
                adapted_parameters={"frequency": 2.0, "swing_height": 0.05},
                compatibility_notes=["需要IMU反馈"],
            ))
        return algorithms

    def _estimate_cost(self, bom: BOMSheet) -> tuple[float, float]:
        return bom.total_min, bom.total_max

    def _assess_risk(self, requirement: RequirementCreate, contradictions: list[dict]) -> dict:
        risks = []
        critical_count = sum(1 for c in contradictions if c.get("severity") == "critical")
        warning_count = sum(1 for c in contradictions if c.get("severity") == "warning")
        if critical_count > 0:
            risks.append({"level": "high", "description": f"存在{critical_count}个严重矛盾，需解决后再开发"})
        if warning_count > 0:
            risks.append({"level": "medium", "description": f"存在{warning_count}个警告，建议优化"})
        if requirement.constraints and requirement.constraints.timeline_weeks and requirement.constraints.timeline_weeks < 4:
            risks.append({"level": "medium", "description": "开发周期较短，建议分阶段交付"})
        if requirement.robot_type in [RobotType.LEGGED, RobotType.COMPOSITE]:
            risks.append({"level": "medium", "description": f"{requirement.robot_type.value}类型机器人开发难度较高，建议有相关经验"})
        return {
            "overall_level": "high" if critical_count > 0 else ("medium" if warning_count > 0 else "low"),
            "risks": risks,
            "critical_count": critical_count,
            "warning_count": warning_count,
        }

    def _should_use_llm(self, requirement: RequirementCreate) -> bool:
        if not settings.LLM_ENABLED:
            return False
        if requirement.robot_type not in ARCHITECTURE_TEMPLATES:
            return True
        budget_max = requirement.budget.max_amount
        if budget_max > 0:
            constraints = {
                RobotType.WHEELED: 5000,
                RobotType.LEGGED: 20000,
                RobotType.ARM: 10000,
                RobotType.COMPOSITE: 50000,
                RobotType.DRONE: 10000,
            }
            if budget_max > constraints.get(requirement.robot_type, 10000):
                return True
        core_funcs = [f.name for f in requirement.core_functions]
        special_funcs = ["大模型", "具身智能", "VLA", "强化学习", "RL", "Sim2Real", "遥操作", "数字孪生"]
        if any(sf in " ".join(core_funcs) for sf in special_funcs):
            return True
        return False

    def _generate_with_llm(self, requirement: RequirementCreate) -> Optional[SolutionResponse]:
        from app.core.prompts import SYSTEM_PROMPT_ROBOT_EXPERT

        user_prompt = PROMPT_SOLUTION_GENERATION.format(
            robot_type=requirement.robot_type.value,
            core_functions=", ".join(f.name for f in requirement.core_functions),
            budget_min=requirement.budget.min_amount,
            budget_max=requirement.budget.max_amount,
            scenario=requirement.description or "未指定",
            performance=f"负载{requirement.performance.payload_kg or '?'}kg, 速度{requirement.performance.speed_ms or '?'}m/s, 精度{requirement.performance.position_accuracy_mm or '?'}mm, 续航{requirement.performance.battery_hours or '?'}h",
            team_skills=", ".join(requirement.constraints.team_skills) if requirement.constraints.team_skills else "未指定",
            timeline=requirement.constraints.timeline_weeks or "未指定",
            control_mode="未指定",
            network=requirement.environment.network if requirement.environment else "有网",
            constraints=f"量产: {requirement.constraints.production_scale or '否'}",
        )

        result = llm_client.chat_json(SYSTEM_PROMPT_ROBOT_EXPERT, user_prompt)
        if not result:
            if settings.LLM_FALLBACK_ENABLED:
                logger.info("[SolutionGenerator] LLM failed, falling back to preset rules")
                return None
            else:
                logger.warning("[SolutionGenerator] LLM failed and fallback is disabled")
                return None

        try:
            architecture_layers = []
            for layer in result.get("architecture_layers", []):
                architecture_layers.append(ArchitectureLayer(
                    name=layer.get("name", ""),
                    components=layer.get("components", []),
                    description=layer.get("description", ""),
                ))

            tech_stack_items = []
            for ts in result.get("tech_stack", []):
                tech_stack_items.append(TechStackItem(
                    name=ts.get("name", ""),
                    version=ts.get("version", ""),
                    purpose=ts.get("purpose", ""),
                    category=ts.get("category", ""),
                ))

            bom_items = []
            for item in result.get("bom", []):
                bom_items.append(BOMItem(
                    item=HardwareItem(
                        category=item.get("category", ""),
                        name=item.get("name", ""),
                        specs={},
                        price_min=float(item.get("price_min", 0)),
                        price_max=float(item.get("price_max", 0)),
                    ),
                    quantity=int(item.get("quantity", 1)),
                ))

            total_min = sum(i.item.price_min * i.quantity for i in bom_items)
            total_max = sum(i.item.price_max * i.quantity for i in bom_items)
            bom_sheet = BOMSheet(items=bom_items, total_min=total_min, total_max=total_max)

            algorithms = []
            for algo in result.get("algorithms", []):
                level_map = {"basic": AlgorithmLevel.BASIC, "advanced": AlgorithmLevel.ADVANCED, "expert": AlgorithmLevel.EXPERT}
                algo_level = level_map.get(algo.get("level", "basic"), AlgorithmLevel.BASIC)
                categories = ROBOT_TYPE_TO_CATEGORY.get(requirement.robot_type, [])
                algorithms.append(AlgorithmAdaptationResult(
                    algorithm=AlgorithmSpec(
                        name=algo.get("name", ""),
                        category=algo.get("category", ""),
                        level=algo_level,
                        applicable_robots=categories,
                        required_sensors=[],
                        required_compute=[],
                        parameters=[],
                        description=algo.get("description", ""),
                        input_spec={},
                        output_spec={},
                        difficulty={"basic": 1, "advanced": 3, "expert": 5}.get(algo.get("level", "basic"), 1),
                    ),
                    adapted_parameters=algo.get("adapted_parameters", {}),
                    compatibility_notes=algo.get("compatibility_notes", []),
                ))

            risk_data = result.get("risk_assessment", {})
            risk = {
                "overall_level": risk_data.get("overall_level", "medium"),
                "risks": risk_data.get("risks", []),
                "critical_count": sum(1 for r in risk_data.get("risks", []) if r.get("level") == "high"),
                "warning_count": sum(1 for r in risk_data.get("risks", []) if r.get("level") == "medium"),
                "expert_advice": result.get("expert_advice", ""),
            }

            contradictions = self._detector.check_requirement(requirement)

            return SolutionResponse(
                id=str(uuid.uuid4()),
                requirement_id="",
                status=SolutionStatus.PROPOSED,
                architecture_layers=architecture_layers,
                tech_stack=tech_stack_items,
                bom=bom_sheet,
                algorithms=algorithms,
                contradictions=contradictions,
                estimated_cost_min=float(result.get("estimated_cost_min", total_min)),
                estimated_cost_max=float(result.get("estimated_cost_max", total_max)),
                risk_assessment=risk,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
        except Exception as e:
            logger.error(f"[SolutionGenerator] LLM result parsing failed: {e}")
            if settings.LLM_FALLBACK_ENABLED:
                return None
            raise
