from fastapi import APIRouter, Query
from app.schemas.requirement import HardwareAlgorithmRequest
from app.core.algorithm_adapter import AlgorithmAdapter

router = APIRouter(prefix="/api/algorithm", tags=["算法库"])
adapter = AlgorithmAdapter()

@router.get("/list", summary="获取所有算法列表")
def list_algorithms(category: str = Query(None, description="按类别筛选"), level: str = Query(None, description="按级别筛选"), robot_type: str = Query(None, description="按机器人类型筛选")):
    if category:
        return {"algorithms": adapter.get_algorithms_by_category(category)}
    if level:
        return {"algorithms": adapter.get_algorithms_by_level(level)}
    if robot_type:
        return {"algorithms": adapter.get_algorithms_by_robot(robot_type)}
    return {"algorithms": adapter.get_all_algorithms()}

@router.get("/search", summary="搜索算法")
def search_algorithms(keyword: str = Query(..., description="搜索关键词")):
    return {"algorithms": adapter.search_algorithms(keyword)}

@router.get("/detail", summary="获取算法详情")
def get_algorithm_detail(name: str = Query(..., description="算法名称")):
    result = adapter.get_algorithm_by_name(name)
    if not result:
        return {"error": "Algorithm not found", "algorithm": None}
    return {"algorithm": result}

@router.post("/adapt", summary="根据硬件信息适配算法")
def adapt_algorithms(request: HardwareAlgorithmRequest):
    return adapter.adapt_for_hardware(request)
