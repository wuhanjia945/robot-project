from fastapi import APIRouter, Query
from app.core.hardware_catalog import HardwareCatalog

router = APIRouter(prefix="/api/hardware", tags=["硬件方案"])
catalog = HardwareCatalog()

@router.get("/list", summary="获取所有硬件列表")
def list_hardware(category: str = Query(None, description="按类别筛选"), robot_type: str = Query(None, description="按机器人类型筛选")):
    if category:
        return {"items": catalog.get_items_by_category(category)}
    if robot_type:
        return {"items": catalog.get_items_by_robot_type(robot_type)}
    return {"items": catalog.get_all_items()}

@router.get("/categories", summary="获取硬件分类列表")
def list_categories():
    return {"categories": catalog.get_all_categories()}

@router.get("/search", summary="搜索硬件")
def search_hardware(keyword: str = Query(..., description="搜索关键词")):
    return {"items": catalog.search_items(keyword)}

@router.get("/kits", summary="获取机器人完整方案")
def list_kits(robot_type: str = Query(None, description="机器人类型"), level: str = Query(None, description="方案级别")):
    return {"kits": catalog.get_robot_kits(robot_type=robot_type, level=level)}

@router.get("/budget", summary="按预算筛选方案")
def list_by_budget(budget_min: float = Query(...), budget_max: float = Query(...), robot_type: str = Query(None)):
    return {"kits": catalog.get_items_by_budget(budget_min, budget_max, robot_type)}

@router.get("/item", summary="获取硬件详情")
def get_hardware_detail(name: str = Query(..., description="硬件名称")):
    result = catalog.get_item_by_name(name)
    if not result:
        return {"error": "Item not found", "item": None}
    return {"item": result}

@router.get("/kit", summary="获取方案详情")
def get_kit_detail(name: str = Query(..., description="方案名称")):
    kits = catalog.get_robot_kits()
    for kit in kits:
        if kit.get("name") == name:
            return {"kit": kit}
    return {"error": "Kit not found", "kit": None}

@router.get("/tech-stack", summary="获取技术栈列表")
def list_tech_stack(category: str = Query(None, description="按类别筛选")):
    from app.core.knowledge_base import KnowledgeBase
    kb = KnowledgeBase()
    if category:
        return {"items": kb.get_items_by_category(category)}
    return {"items": kb.get_all_items(), "categories": kb.get_all_categories()}
