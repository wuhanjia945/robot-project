import yaml
from pathlib import Path
from fastapi import APIRouter, Query
from app.config import Settings

router = APIRouter(prefix="/api/market", tags=["市场方案"])
settings = Settings()

def _load_yaml(filename: str) -> dict:
    filepath = settings.DATA_DIR / filename
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@router.get("/robots", summary="获取市场主流机器人方案列表")
def list_market_robots(category: str = Query(None, description="按类别筛选")):
    data = _load_yaml("market_robots.yaml")
    robots = data.get("robots", [])
    if category:
        robots = [r for r in robots if r.get("category") == category]
    return {"robots": robots}

@router.get("/robots/{robot_name}", summary="获取指定机器人方案详情")
def get_market_robot(robot_name: str):
    data = _load_yaml("market_robots.yaml")
    for robot in data.get("robots", []):
        if robot.get("name") == robot_name:
            return robot
    return {"error": "Robot not found"}

@router.get("/categories", summary="获取机器人分类列表")
def list_categories():
    data = _load_yaml("market_robots.yaml")
    categories = list(set(r.get("category", "") for r in data.get("robots", [])))
    return {"categories": categories}

@router.get("/frontier", summary="获取前沿技术内容")
def get_frontier_tech():
    data = _load_yaml("robot_basics.yaml")
    return {"frontier_tech": data.get("frontier_tech", [])}

@router.get("/basics", summary="获取机器人入门基础知识")
def get_basics():
    data = _load_yaml("robot_basics.yaml")
    return data
