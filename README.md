# 一起动手来手搓机器人

> 让每个人都能手搓一台机器人

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/your-repo/robot-vision-motion-system/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

---

## 📖 项目简介

一起动手来手搓机器人是一个面向机器人爱好者、学生和开发者的开源平台，让每个人都能手搓一台机器人。无论你是零基础小白还是经验丰富的工程师，都能通过本系统快速了解机器人技术全貌、采集需求、生成方案、选择算法与硬件，并进入仿真环境验证——一站式完成从想法到原型的全过程。

## ✨ 核心功能

### 1. 🏪 市场方案
提供 **10 种主流机器人技术框架**，每种框架包含完整的 BOM（物料清单）和实现路径，帮助你快速选型。

### 2. 📚 入门知识
涵盖机器人发展史、核心概念和技术框架，为零基础用户提供系统化的学习路径。

### 3. 🔬 前沿技术
追踪具身智能、强化学习运动策略、大模型+机器人、VLA（Vision-Language-Action）模型等前沿方向。

### 4. 📋 需求采集
3 轮渐进式问卷 + 7 类矛盾检测，精准捕捉你的机器人需求，避免方案与需求脱节。

### 5. 🧩 方案生成
预设规则 + LLM 兜底，自动生成完整技术方案，涵盖算法、硬件、部署全链路。

### 6. 🧠 算法供给
**22+ 算法详情**，每个算法包含参数说明、输入输出规格、代码模板和部署建议。

### 7. 🔧 硬件方案
**26+ 硬件详情**，包含 BOM、配套算法推荐和可部署方案，从传感器到执行器全覆盖。

### 8. 🖥️ 仿真学习
6 种主流仿真软件介绍 + 教程链接，让你在虚拟环境中安全验证方案。

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | FastAPI + Python 3.11+ |
| 前端 | React + TypeScript + Vite |
| 知识库 | YAML 数据驱动 |
| LLM | OpenAI 兼容接口（支持 OpenAI / DeepSeek / Ollama / vLLM / LocalAI） |
| 部署 | Docker Compose |

## 🚀 快速开始

### Docker 部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/wuhanjia945/robot-project.git
cd robot-project

# 配置环境变量（可选，启用 LLM 功能时需要）
cp backend/.env.example backend/.env
# 编辑 backend/.env 填入你的 LLM API Key

# 一键启动
docker compose up -d

# 访问应用
# 前端：http://localhost:5180
# 后端：http://localhost:9500
# API 文档：http://localhost:9500/docs
```

### 本地开发

```bash
# 后端
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --host 127.0.0.1 --port 9500 --reload

# 前端（新终端）
cd frontend
npm install
npm run dev
# 访问 http://localhost:5180
```

## 🤖 LLM 配置说明

本系统支持任何 OpenAI 兼容的 LLM 接口，通过环境变量进行配置：

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `APP_LLM_ENABLED` | 是否启用 LLM | `false` |
| `APP_LLM_PROVIDER` | LLM 提供商 | `openai` |
| `APP_LLM_API_KEY` | API 密钥 | - |
| `APP_LLM_API_BASE` | API 基础地址 | `https://api.openai.com/v1` |
| `APP_LLM_MODEL` | 模型名称 | `gpt-4o-mini` |
| `APP_LLM_FALLBACK_ENABLED` | 启用规则兜底 | `true` |

### 各提供商配置示例

**OpenAI**
```env
APP_LLM_PROVIDER=openai
APP_LLM_API_KEY=sk-xxx
APP_LLM_API_BASE=https://api.openai.com/v1
APP_LLM_MODEL=gpt-4o-mini
```

**DeepSeek**
```env
APP_LLM_PROVIDER=deepseek
APP_LLM_API_KEY=sk-xxx
APP_LLM_API_BASE=https://api.deepseek.com/v1
APP_LLM_MODEL=deepseek-chat
```

**Ollama（本地）**
```env
APP_LLM_PROVIDER=ollama
APP_LLM_API_KEY=ollama
APP_LLM_API_BASE=http://localhost:11434/v1
APP_LLM_MODEL=qwen2.5:7b
```

**vLLM（本地）**
```env
APP_LLM_PROVIDER=vllm
APP_LLM_API_KEY=EMPTY
APP_LLM_API_BASE=http://localhost:8000/v1
APP_LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

**LocalAI（本地）**
```env
APP_LLM_PROVIDER=localai
APP_LLM_API_KEY=xxx
APP_LLM_API_BASE=http://localhost:8080/v1
APP_LLM_MODEL=gpt-4
```

> 💡 即使不配置 LLM，系统也能通过内置规则引擎正常运行所有功能（`APP_LLM_FALLBACK_ENABLED=true`）。

## 📁 项目结构

```
robot-vision-motion-system/
├── backend/                  # 后端服务
│   ├── app/
│   │   ├── api/              # API 路由
│   │   │   ├── algorithm.py  # 算法接口
│   │   │   ├── hardware.py   # 硬件接口
│   │   │   ├── market.py     # 市场方案接口
│   │   │   ├── requirement.py# 需求采集接口
│   │   │   ├── solution.py   # 方案生成接口
│   │   │   └── validator.py  # 数据校验接口
│   │   ├── core/             # 核心业务逻辑
│   │   │   ├── algorithm_adapter.py    # 算法适配器
│   │   │   ├── contradiction_detector.py # 矛盾检测
│   │   │   ├── hardware_catalog.py     # 硬件目录
│   │   │   ├── knowledge_base.py       # 知识库加载
│   │   │   ├── llm_client.py           # LLM 客户端
│   │   │   ├── prompts.py              # 提示词模板
│   │   │   ├── requirement_engine.py   # 需求引擎
│   │   │   └── solution_generator.py   # 方案生成器
│   │   ├── schemas/          # 数据模型
│   │   ├── config.py         # 配置管理
│   │   └── main.py           # 应用入口
│   ├── data/                 # YAML 知识库
│   │   ├── algorithms/       # 算法数据
│   │   ├── hardware/         # 硬件数据
│   │   ├── tech_stack/       # 技术栈数据
│   │   ├── market_robots.yaml
│   │   └── robot_basics.yaml
│   ├── tests/                # 测试
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── docs/                     # 文档
├── docker-compose.yaml
└── .github/workflows/ci.yml
```

## 🤝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

# Build Robots Together

> An open-source system that enables even complete beginners to build robots

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/your-repo/robot-vision-motion-system/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

---

## 📖 Introduction

The Build Robots Together is an open-source platform designed for robotics enthusiasts, students, and developers — empowering everyone to build their own robot. Whether you're a complete beginner or an experienced engineer, this system helps you quickly understand the full landscape of robotics technology, collect requirements, generate solutions, select algorithms and hardware, and validate in simulation — completing the entire journey from idea to prototype in one place.

## ✨ Core Features

### 1. 🏪 Market Solutions
Provides **10 mainstream robot technology frameworks**, each with complete BOM (Bill of Materials) and implementation paths to help you make quick selections.

### 2. 📚 Getting Started Knowledge
Covers the history of robotics, core concepts, and technology frameworks, providing a systematic learning path for beginners.

### 3. 🔬 Cutting-edge Technology
Tracks frontier directions including embodied intelligence, RL motion policies, LLM + robotics, and VLA (Vision-Language-Action) models.

### 4. 📋 Requirement Collection
3-round progressive questionnaire + 7 types of contradiction detection to precisely capture your robot requirements and prevent solution-requirement mismatches.

### 5. 🧩 Solution Generation
Preset rules + LLM fallback to automatically generate complete technical solutions covering algorithms, hardware, and deployment.

### 6. 🧠 Algorithm Supply
**22+ algorithm details**, each including parameter descriptions, I/O specifications, code templates, and deployment recommendations.

### 7. 🔧 Hardware Solutions
**26+ hardware details** including BOM, recommended matching algorithms, and deployable solutions — from sensors to actuators.

### 8. 🖥️ Simulation Learning
6 mainstream simulation software introductions + tutorial links for safe virtual environment validation.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python 3.11+ |
| Frontend | React + TypeScript + Vite |
| Knowledge Base | YAML data-driven |
| LLM | OpenAI-compatible interface (OpenAI / DeepSeek / Ollama / vLLM / LocalAI) |
| Deployment | Docker Compose |

## 🚀 Quick Start

### Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-repo/robot-vision-motion-system.git
cd robot-vision-motion-system

# Configure environment variables (optional, needed for LLM features)
cp backend/.env.example backend/.env
# Edit backend/.env to fill in your LLM API Key

# Start with one command
docker compose up -d

# Access the application
# Frontend: http://localhost:5180
# Backend: http://localhost:9500
# API Docs: http://localhost:9500/docs
```

### Local Development

```bash
# Backend
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --host 127.0.0.1 --port 9500 --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Visit http://localhost:5180
```

## 🤖 LLM Configuration

This system supports any OpenAI-compatible LLM interface, configured via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_LLM_ENABLED` | Enable LLM | `false` |
| `APP_LLM_PROVIDER` | LLM provider | `openai` |
| `APP_LLM_API_KEY` | API key | - |
| `APP_LLM_API_BASE` | API base URL | `https://api.openai.com/v1` |
| `APP_LLM_MODEL` | Model name | `gpt-4o-mini` |
| `APP_LLM_FALLBACK_ENABLED` | Enable rule fallback | `true` |

### Provider Configuration Examples

**OpenAI**
```env
APP_LLM_PROVIDER=openai
APP_LLM_API_KEY=sk-xxx
APP_LLM_API_BASE=https://api.openai.com/v1
APP_LLM_MODEL=gpt-4o-mini
```

**DeepSeek**
```env
APP_LLM_PROVIDER=deepseek
APP_LLM_API_KEY=sk-xxx
APP_LLM_API_BASE=https://api.deepseek.com/v1
APP_LLM_MODEL=deepseek-chat
```

**Ollama (Local)**
```env
APP_LLM_PROVIDER=ollama
APP_LLM_API_KEY=ollama
APP_LLM_API_BASE=http://localhost:11434/v1
APP_LLM_MODEL=qwen2.5:7b
```

**vLLM (Local)**
```env
APP_LLM_PROVIDER=vllm
APP_LLM_API_KEY=EMPTY
APP_LLM_API_BASE=http://localhost:8000/v1
APP_LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

**LocalAI (Local)**
```env
APP_LLM_PROVIDER=localai
APP_LLM_API_KEY=xxx
APP_LLM_API_BASE=http://localhost:8080/v1
APP_LLM_MODEL=gpt-4
```

> 💡 Even without LLM configuration, the system runs all features normally via the built-in rule engine (`APP_LLM_FALLBACK_ENABLED=true`).

## 📁 Project Structure

```
robot-vision-motion-system/
├── backend/                  # Backend service
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── algorithm.py
│   │   │   ├── hardware.py
│   │   │   ├── market.py
│   │   │   ├── requirement.py
│   │   │   ├── solution.py
│   │   │   └── validator.py
│   │   ├── core/             # Core business logic
│   │   │   ├── algorithm_adapter.py
│   │   │   ├── contradiction_detector.py
│   │   │   ├── hardware_catalog.py
│   │   │   ├── knowledge_base.py
│   │   │   ├── llm_client.py
│   │   │   ├── prompts.py
│   │   │   ├── requirement_engine.py
│   │   │   └── solution_generator.py
│   │   ├── schemas/          # Data models
│   │   ├── config.py         # Configuration
│   │   └── main.py           # Application entry
│   ├── data/                 # YAML knowledge base
│   │   ├── algorithms/
│   │   ├── hardware/
│   │   ├── tech_stack/
│   │   ├── market_robots.yaml
│   │   └── robot_basics.yaml
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── docs/
├── docker-compose.yaml
└── .github/workflows/ci.yml
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
