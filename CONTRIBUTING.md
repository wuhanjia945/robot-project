# 贡献指南

感谢你对一起动手来手搓机器人的关注！我们欢迎任何形式的贡献。

---

## 如何贡献

### 基本流程

1. **Fork** 本仓库到你的 GitHub 账号
2. 从 `main` 分支创建新的功能分支：`git checkout -b feature/your-feature-name`
3. 进行修改并提交：`git commit -m "feat: 添加新功能描述"`
4. 推送到你的 Fork：`git push origin feature/your-feature-name`
5. 创建 **Pull Request** 到本仓库的 `main` 分支
6. 等待代码审查和合并

### 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 新功能 | `feature/xxx` | `feature/add-drone-algorithm` |
| 修复 | `fix/xxx` | `fix/solution-generator-bug` |
| 文档 | `docs/xxx` | `docs/update-readme` |
| 重构 | `refactor/xxx` | `refactor/api-response-format` |

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型（type）：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具变更

---

## 开发环境搭建

### 前置要求

- Python 3.11+
- Node.js 20+
- Git

### 后端开发

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --host 127.0.0.1 --port 9500 --reload
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 运行测试

```bash
# 后端测试
cd backend
python -m pytest tests/ -v

# 前端构建检查
cd frontend
npx tsc --noEmit
npm run build
```

---

## 代码规范

### Python（后端）

- 遵循 PEP 8 编码规范
- 使用类型注解（Type Hints）
- 函数和类添加 docstring
- 使用 `pydantic` 进行数据验证
- API 路由使用 `async def`

### TypeScript（前端）

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 `interface` 定义 Props 类型
- CSS 使用统一风格，避免内联样式

---

## 提交新机器人方案

机器人方案数据存储在 `backend/data/` 目录下的 YAML 文件中。添加新方案的步骤：

### 1. 添加市场方案

编辑 `backend/data/market_robots.yaml`，按以下格式添加：

```yaml
- name: "你的机器人名称"
  category: "分类"  # 如：人形机器人、四足机器人、机械臂等
  difficulty: "初级|中级|高级"
  description: "简要描述"
  tech_stack:
    - name: "技术名称"
      description: "技术说明"
  bom:
    - component: "组件名"
      specification: "规格"
      quantity: 1
      estimated_price: "价格范围"
  implementation_path:
    - step: 1
      title: "步骤标题"
      description: "步骤描述"
```

### 2. 添加算法

在 `backend/data/algorithms/` 目录下创建或编辑对应的 YAML 文件：

```yaml
- id: "algorithm-unique-id"
  name: "算法名称"
  category: "分类"  # perception | control | kinematics | gait_planning | balancing
  description: "算法描述"
  parameters:
    - name: "参数名"
      type: "参数类型"
      default: "默认值"
      description: "参数说明"
  inputs:
    - name: "输入名"
      type: "数据类型"
      description: "输入说明"
  outputs:
    - name: "输出名"
      type: "数据类型"
      description: "输出说明"
  code_template: |
    # Python 代码模板
    pass
  deployment:
    hardware_requirements: "硬件要求"
    latency: "预期延迟"
    notes: "部署注意事项"
```

### 3. 添加硬件

在 `backend/data/hardware/` 目录下创建或编辑对应的 YAML 文件：

```yaml
- id: "hardware-unique-id"
  name: "硬件名称"
  category: "分类"  # sensors | actuators | controllers | power_communication | robot_kits
  specifications:
    key_param: "值"
  price_range: "价格范围"
  compatible_algorithms:
    - "algorithm-id-1"
    - "algorithm-id-2"
  deployment_notes: "部署说明"
```

---

## 提交新算法

1. 确定算法所属分类（perception / control / kinematics / gait_planning / balancing）
2. 在对应的 YAML 文件中按上述格式添加算法条目
3. 确保 `id` 全局唯一
4. 提供完整的参数、输入输出说明
5. 附上代码模板和部署建议
6. 提交 PR 并在描述中说明算法来源和适用场景

---

## 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/your-repo/robot-vision-motion-system/issues) 提交，包含以下信息：

1. **Bug 描述**：清晰描述问题
2. **复现步骤**：如何复现该问题
3. **预期行为**：你期望的正确行为
4. **实际行为**：实际发生的行为
5. **环境信息**：操作系统、Python 版本、Node 版本等
6. **截图/日志**：如有，请附上相关截图或错误日志

---

## 贡献者名单

感谢所有为本项目做出贡献的开发者！

<!-- 贡献者列表将自动更新 -->

---

# Contributing Guide

Thank you for your interest in Build Robots Together! We welcome contributions in any form.

---

## How to Contribute

### Basic Workflow

1. **Fork** this repository to your GitHub account
2. Create a feature branch from `main`: `git checkout -b feature/your-feature-name`
3. Make changes and commit: `git commit -m "feat: add new feature description"`
4. Push to your Fork: `git push origin feature/your-feature-name`
5. Create a **Pull Request** to the `main` branch of this repository
6. Wait for code review and merge

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/xxx` | `feature/add-drone-algorithm` |
| Fix | `fix/xxx` | `fix/solution-generator-bug` |
| Docs | `docs/xxx` | `docs/update-readme` |
| Refactor | `refactor/xxx` | `refactor/api-response-format` |

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Test related
- `chore`: Build/tool changes

---

## Development Environment Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Git

### Backend Development

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --host 127.0.0.1 --port 9500 --reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend build check
cd frontend
npx tsc --noEmit
npm run build
```

---

## Code Standards

### Python (Backend)

- Follow PEP 8 coding conventions
- Use type hints
- Add docstrings to functions and classes
- Use `pydantic` for data validation
- Use `async def` for API routes

### TypeScript (Frontend)

- Use TypeScript strict mode
- Use functional components + Hooks
- Define Props types with `interface`
- Use consistent CSS styling, avoid inline styles

---

## Submitting a New Robot Solution

Robot solution data is stored in YAML files under `backend/data/`. Steps to add a new solution:

### 1. Add Market Solution

Edit `backend/data/market_robots.yaml` and add in the following format:

```yaml
- name: "Your Robot Name"
  category: "Category"  # e.g., humanoid, quadruped, robotic arm, etc.
  difficulty: "beginner|intermediate|advanced"
  description: "Brief description"
  tech_stack:
    - name: "Technology Name"
      description: "Technology description"
  bom:
    - component: "Component Name"
      specification: "Specification"
      quantity: 1
      estimated_price: "Price Range"
  implementation_path:
    - step: 1
      title: "Step Title"
      description: "Step Description"
```

### 2. Add Algorithm

Create or edit the corresponding YAML file in `backend/data/algorithms/`:

```yaml
- id: "algorithm-unique-id"
  name: "Algorithm Name"
  category: "Category"  # perception | control | kinematics | gait_planning | balancing
  description: "Algorithm description"
  parameters:
    - name: "Parameter Name"
      type: "Parameter Type"
      default: "Default Value"
      description: "Parameter Description"
  inputs:
    - name: "Input Name"
      type: "Data Type"
      description: "Input Description"
  outputs:
    - name: "Output Name"
      type: "Data Type"
      description: "Output Description"
  code_template: |
    # Python code template
    pass
  deployment:
    hardware_requirements: "Hardware Requirements"
    latency: "Expected Latency"
    notes: "Deployment Notes"
```

### 3. Add Hardware

Create or edit the corresponding YAML file in `backend/data/hardware/`:

```yaml
- id: "hardware-unique-id"
  name: "Hardware Name"
  category: "Category"  # sensors | actuators | controllers | power_communication | robot_kits
  specifications:
    key_param: "Value"
  price_range: "Price Range"
  compatible_algorithms:
    - "algorithm-id-1"
    - "algorithm-id-2"
  deployment_notes: "Deployment Notes"
```

---

## Submitting a New Algorithm

1. Determine the algorithm category (perception / control / kinematics / gait_planning / balancing)
2. Add the algorithm entry in the corresponding YAML file using the format above
3. Ensure the `id` is globally unique
4. Provide complete parameter, input/output descriptions
5. Include a code template and deployment recommendations
6. Submit a PR and describe the algorithm source and applicable scenarios

---

## Reporting Bugs

If you find a bug, please submit it via [GitHub Issues](https://github.com/your-repo/robot-vision-motion-system/issues) with the following information:

1. **Bug Description**: Clearly describe the issue
2. **Reproduction Steps**: How to reproduce the problem
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment Info**: OS, Python version, Node version, etc.
6. **Screenshots/Logs**: If available, attach relevant screenshots or error logs

---

## Contributors

Thanks to all developers who have contributed to this project!

<!-- Contributors list will be auto-updated -->
