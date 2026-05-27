SYSTEM_PROMPT_ROBOT_EXPERT = """你是一位资深的机器人系统架构师，拥有丰富的机器人硬件选型、软件架构设计和算法适配经验。
你精通轮式机器人、足式机器人、机械臂、复合机器人和无人机等各类机器人的设计与开发。
你的回答必须以JSON格式输出，确保结构清晰、内容专业、建议可行。"""

PROMPT_SOLUTION_GENERATION = """请根据以下机器人需求，生成一套完整的系统方案，包括架构分层、技术栈、BOM清单、算法推荐和风险评估。

## 需求信息
- 机器人类型: {robot_type}
- 核心功能: {core_functions}
- 预算范围: {budget_min}~{budget_max}元
- 使用场景: {scenario}
- 性能要求: {performance}
- 团队技能: {team_skills}
- 开发周期: {timeline}周
- 控制方式: {control_mode}
- 网络条件: {network}
- 其他约束: {constraints}

## 输出格式（JSON）
{{
  "architecture_layers": [
    {{"name": "层名称", "components": ["组件1", "组件2"], "description": "层描述"}}
  ],
  "tech_stack": [
    {{"name": "技术名称", "version": "版本", "purpose": "用途", "category": "分类"}}
  ],
  "bom": [
    {{"category": "硬件分类", "name": "硬件名称", "price_min": 0, "price_max": 0, "quantity": 1}}
  ],
  "algorithms": [
    {{"name": "算法名称", "category": "算法分类", "level": "basic/advanced/expert", "description": "算法描述", "adapted_parameters": {{}}, "compatibility_notes": ["注意事项"]}}
  ],
  "estimated_cost_min": 0,
  "estimated_cost_max": 0,
  "risk_assessment": {{
    "overall_level": "low/medium/high",
    "risks": [
      {{"level": "high/medium/low", "description": "风险描述"}}
    ]
  }},
  "expert_advice": "专家建议"
}}"""

PROMPT_REQUIREMENT_ANALYSIS = """请分析以下用户输入的机器人需求描述，提取结构化的需求信息。

## 用户输入
{user_input}

## 输出格式（JSON）
{{
  "robot_type": "wheeled/legged/arm/composite/drone",
  "core_functions": ["功能1", "功能2"],
  "budget_min": 0,
  "budget_max": 0,
  "performance": {{
    "payload_kg": null,
    "speed_ms": null,
    "position_accuracy_mm": null,
    "battery_hours": null
  }},
  "scenario": "使用场景描述",
  "team_skills": ["技能1", "技能2"],
  "timeline_weeks": null,
  "control_mode": "遥控/半自主/全自主",
  "network_condition": "有网/弱网/完全离线",
  "special_requirements": ["特殊需求1"],
  "clarification_questions": ["需要向用户确认的问题1"]
}}"""

PROMPT_ALGORITHM_RECOMMENDATION = """请根据以下硬件配置和功能需求，推荐适合的算法方案。

## 硬件信息
{hardware_info}

## 期望功能
{desired_functions}

## 当前问题描述
{problem_description}

## 输出格式（JSON）
{{
  "recommended_algorithms": [
    {{
      "name": "算法名称",
      "category": "算法分类",
      "level": "basic/advanced/expert",
      "description": "算法描述",
      "required_sensors": ["所需传感器"],
      "required_compute": ["计算资源需求"],
      "parameters": {{"参数名": "推荐值"}},
      "compatibility_notes": ["兼容性说明"],
      "implementation_difficulty": 1,
      "estimated_development_hours": 40
    }}
  ],
  "architecture_suggestions": ["架构建议1"],
  "risk_notes": ["风险提示1"]
}}"""
