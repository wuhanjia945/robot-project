import json
import logging
import yaml
from pathlib import Path
from typing import Optional
from app.config import Settings, settings
from app.core.llm_client import llm_client
from app.core.prompts import PROMPT_ALGORITHM_RECOMMENDATION

logger = logging.getLogger(__name__)

class HardwareCatalog:
    def __init__(self, data_dir: Optional[Path] = None):
        self._settings = Settings()
        self._data_dir = data_dir or self._settings.DATA_DIR / "hardware"
        self._hardware: dict = {}
        self._loaded = False

    def load(self) -> None:
        if self._loaded:
            return
        hw_dir = self._data_dir
        if not hw_dir.exists():
            raise FileNotFoundError(f"Hardware data directory not found: {hw_dir}")
        for yaml_file in hw_dir.glob("*.yaml"):
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if data and "category" in data:
                    self._hardware[data["category"]] = data.get("items", [])
        self._loaded = True

    def get_all_categories(self) -> list[str]:
        self.load()
        return list(self._hardware.keys())

    def get_items_by_category(self, category: str) -> list[dict]:
        self.load()
        return self._hardware.get(category, [])

    def search_items(self, keyword: str) -> list[dict]:
        self.load()
        results = []
        keyword_lower = keyword.lower()
        for category, items in self._hardware.items():
            for item in items:
                searchable = f"{item.get('name', '')} {item.get('brand', '')} {item.get('model', '')} {item.get('notes', '')} {' '.join(item.get('compatibility_tags', []))}".lower()
                if keyword_lower in searchable:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_items_by_tag(self, tag: str) -> list[dict]:
        self.load()
        results = []
        for category, items in self._hardware.items():
            for item in items:
                if tag.lower() in [t.lower() for t in item.get("compatibility_tags", [])]:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_items_by_robot_type(self, robot_type: str) -> list[dict]:
        self.load()
        results = []
        for category, items in self._hardware.items():
            for item in items:
                applicable = item.get("applicable_robots", [])
                if robot_type in applicable:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_item_by_name(self, name: str) -> Optional[dict]:
        self.load()
        for category, items in self._hardware.items():
            for item in items:
                if item.get("name") == name:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    return item_copy
        return None

    def get_robot_kits(self, robot_type: Optional[str] = None, level: Optional[str] = None) -> list[dict]:
        self.load()
        kits = self._hardware.get("机器人完整方案", [])
        results = []
        for kit in kits:
            if robot_type and kit.get("robot_type") != robot_type:
                continue
            if level and kit.get("level") != level:
                continue
            results.append(kit)
        return results

    def calculate_bom_total(self, bom_items: list[dict]) -> dict:
        total_min = 0.0
        total_max = 0.0
        for item in bom_items:
            price = item.get("price", 0)
            quantity = item.get("quantity", 1)
            total_min += price * quantity
            total_max += price * quantity
        return {
            "total_min": total_min,
            "total_max": total_max,
            "currency": "CNY",
            "item_count": len(bom_items),
        }

    def get_items_by_budget(self, budget_min: float, budget_max: float, robot_type: Optional[str] = None) -> list[dict]:
        kits = self.get_robot_kits(robot_type=robot_type)
        results = []
        for kit in kits:
            kit_min = kit.get("total_price_min", 0)
            kit_max = kit.get("total_price_max", 0)
            if kit_min <= budget_max and kit_max >= budget_min:
                results.append(kit)
        results.sort(key=lambda x: x.get("total_price_min", 0))
        return results

    def get_all_items(self) -> list[dict]:
        self.load()
        results = []
        for category, items in self._hardware.items():
            for item in items:
                item_copy = dict(item)
                item_copy["category"] = category
                results.append(item_copy)
        return results

    def recommend_algorithms_with_llm(self, hardware_info: dict, desired_functions: list, problem_description: str = "") -> Optional[dict]:
        if not llm_client.is_available:
            return None
        from app.core.prompts import SYSTEM_PROMPT_ROBOT_EXPERT
        user_prompt = PROMPT_ALGORITHM_RECOMMENDATION.format(
            hardware_info=json.dumps(hardware_info, ensure_ascii=False, indent=2),
            desired_functions=", ".join(desired_functions),
            problem_description=problem_description or "无",
        )
        result = llm_client.chat_json(SYSTEM_PROMPT_ROBOT_EXPERT, user_prompt)
        if result:
            logger.info("[HardwareCatalog] LLM algorithm recommendation completed")
        return result
