import uuid
from fastapi import APIRouter, HTTPException
from app.schemas.requirement import (
    RequirementCreate, RequirementResponse, HardwareAlgorithmRequest,
    RobotType, ROBOT_TYPE_LABELS
)
from app.core.requirement_engine import RequirementEngine

router = APIRouter(prefix="/api/requirement", tags=["需求采集"])
engine = RequirementEngine()

@router.post("/session", summary="创建需求采集会话")
def create_session():
    session_id = str(uuid.uuid4())
    result = engine.create_session(session_id)
    result["session_id"] = session_id
    return result

@router.get("/session/{session_id}/round/{round_num}", summary="获取指定轮次的问题")
def get_round_questions(session_id: str, round_num: int):
    result = engine.get_round_questions(session_id, round_num)
    return result

@router.post("/session/{session_id}/round/{round_num}", summary="提交指定轮次的答案")
def submit_answers(session_id: str, round_num: int, answers: dict):
    result = engine.submit_answers(session_id, round_num, answers)
    return result

@router.get("/session/{session_id}", summary="获取会话状态")
def get_session(session_id: str):
    session = engine.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/session/{session_id}/build", summary="从会话构建需求对象")
def build_requirement(session_id: str):
    requirement = engine.build_requirement(session_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="Session not found or incomplete")
    return requirement

@router.get("/robot-types", summary="获取机器人类型选项")
def get_robot_types():
    return {
        "types": [
            {"value": t.value, "label": ROBOT_TYPE_LABELS[t]}
            for t in RobotType
        ]
    }

@router.post("/hardware-algorithm", summary="处理硬件算法适配请求")
def process_hardware_algorithm_request(request: HardwareAlgorithmRequest):
    result = engine.process_hardware_algorithm_request(request)
    return result
