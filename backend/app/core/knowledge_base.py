import yaml
from pathlib import Path
from typing import Optional
from app.config import Settings

class KnowledgeBase:
    def __init__(self, data_dir: Optional[Path] = None):
        self._settings = Settings()
        self._data_dir = data_dir or self._settings.DATA_DIR / "tech_stack"
        self._tech_stack: dict = {}
        self._loaded = False

    def load(self) -> None:
        if self._loaded:
            return
        tech_stack_dir = self._data_dir
        if not tech_stack_dir.exists():
            raise FileNotFoundError(f"Tech stack data directory not found: {tech_stack_dir}")
        for yaml_file in tech_stack_dir.glob("*.yaml"):
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
                if data and "category" in data:
                    self._tech_stack[data["category"]] = data.get("items", [])
        self._loaded = True

    def get_all_categories(self) -> list[str]:
        self.load()
        return list(self._tech_stack.keys())

    def get_items_by_category(self, category: str) -> list[dict]:
        self.load()
        return self._tech_stack.get(category, [])

    def search_items(self, keyword: str) -> list[dict]:
        self.load()
        results = []
        keyword_lower = keyword.lower()
        for category, items in self._tech_stack.items():
            for item in items:
                searchable = f"{item.get('name', '')} {item.get('purpose', '')} {item.get('description', '')} {' '.join(item.get('tags', []))}".lower()
                if keyword_lower in searchable:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_items_by_tag(self, tag: str) -> list[dict]:
        self.load()
        results = []
        for category, items in self._tech_stack.items():
            for item in items:
                if tag.lower() in [t.lower() for t in item.get("tags", [])]:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_items_by_compatibility(self, platform: str) -> list[dict]:
        self.load()
        results = []
        for category, items in self._tech_stack.items():
            for item in items:
                compat = item.get("compatibility", [])
                if platform in compat:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    results.append(item_copy)
        return results

    def get_item_by_name(self, name: str) -> Optional[dict]:
        self.load()
        for category, items in self._tech_stack.items():
            for item in items:
                if item.get("name") == name:
                    item_copy = dict(item)
                    item_copy["category"] = category
                    return item_copy
        return None

    def get_all_items(self) -> list[dict]:
        self.load()
        results = []
        for category, items in self._tech_stack.items():
            for item in items:
                item_copy = dict(item)
                item_copy["category"] = category
                results.append(item_copy)
        return results
