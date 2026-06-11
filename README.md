<div align="center">
  <h1>🧠 MindKeeper · 智寻灵境</h1>
  <p><strong>Intelligent Interaction Design for Quality Content Discovery</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/Ant%20Design-5.0-0170FE?logo=antdesign&logoColor=white" alt="Ant Design">
    <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" alt="FastAPI">
    <img src="https://img.shields.io/badge/Python-3.10-3776AB?logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </p>
  <p>✨ 基于大模型的全网智能内容筛选与个性化推送平台 ✨</p>
</div>

## 📖 项目简介

**MindKeeper·智寻灵境**是一个基于大语言模型的智能内容筛选与推送平台，旨在帮助用户在海量信息中高效获取高质量内容。

### 🎯 核心理念

> **“帮你找到值得看的内容”**

在信息爆炸的时代，我们每天被海量内容淹没，却发现真正有价值的信息如大海捞针。传统算法以“流量”和“停留时长”为目标，让用户陷入信息茧房。MindKeeper将信息的主动权交还给你，让每一次浏览都有价值。

## 🚀 核心功能

### 1. 大模型驱动的智能筛选引擎
- 调用大模型API，基于多维质量指标体系对全网内容进行实时评估
- 质量指标包括：信息密度、来源可信度、内容原创性、时效性与价值等

### 2. 双模式设计 · 尊重用户选择
- **灵境模式** (开启推送)：系统记录偏好，构建用户画像，实现个性化推荐
- **净土模式** (不开启推送)：每次使用均为“一次性”搜索，不保留任何记录

### 3. 主动偏好干预
- ✅ “想看更多此类内容”：增加相似内容推送权重
- ❌ “减少此类内容”：降低相似内容推送权重
- 🚫 “彻底屏蔽”：完全屏蔽某类内容或来源

### 4. 搜索-推荐协同优化
每一次搜索行为都会触发画像更新，形成“搜索探索 → 发现兴趣 → 画像更新 → 更精准推荐”的正向循环。

### 5. 多格式内容统一筛选
用户可自由选择内容形式偏好（文章、视频、图文、播客等），系统在各形式内部进行质量筛选，打破平台壁垒。

## 📁 项目结构

MindKeeper/
├── frontend/                 # React 前端项目
│   ├── src/
│   │   ├── App.jsx          # 主应用界面（含5个功能页面）
│   │   ├── index.css        # 全局样式
│   │   └── main.jsx         # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── backend/                  # FastAPI 后端服务
│   └── main.py              # API服务主文件
└── README.md

## 🛠️ 快速开始

### 环境要求
- **Node.js**: 18.x 或更高版本
- **Python**: 3.10 或更高版本
- **npm** 或 **yarn** 包管理器
- **Git**（用于克隆仓库）

### 安装与运行

#### 1. 克隆项目
git clone https://github.com/Chia-cell/MindKeeper_Intelligent-Interaction-Design.git
cd MindKeeper_Intelligent-Interaction-Design

#### 2. 启动前端
cd frontend
npm install
npm run dev
前端服务将运行在 `http://localhost:5173`

#### 3. 启动后端
cd ../backend
pip install fastapi uvicorn
python main.py
后端API服务将运行在 `http://localhost:8000`

## 🔌 API 接口文档

### 搜索接口 `POST /api/search`

#### 请求示例
{
  "keyword": "人工智能",
  "content_type": "all",
  "mode": true,
  "user_id": "user_123456"
}

#### 响应示例
{
  "results": [
    {
      "id": "uuid-xxx",
      "title": "深度学习的未来发展趋势",
      "summary": "本文探讨了深度学习在未来的发展方向...",
      "content_type": "article",
      "ai_score": 0.92,
      "cover": "https://example.com/cover.jpg",
      "source": "AI科技评论",
      "url": "https://example.com/article"
    }
  ],
  "updated_profile": null
}

### 偏好设置接口 `POST /api/preference`

#### 请求示例
{
  "content_id": "uuid-xxx",
  "action": "like",
  "mode": true,
  "user_id": "user_123456"
}

### 获取用户画像 `GET /api/user_profile?user_id={userId}`

## 🤖 模型对接说明

本项目的 AI 筛选功能通过 `backend/main.py` 中的 `/api/search` 接口实现。当模型同学准备好后，只需替换模拟数据部分为真实模型调用：

### ！！！当前是模拟数据
MOCK_CONTENTS = [...]

### 替换为真实模型调用
### from ai_model import search_content
### results = search_content(keyword=req.keyword, ...)

### 模型输出格式要求

{
  "results": [
    {
      "id": "唯一ID",
      "title": "内容标题",
      "summary": "内容摘要",
      "content_type": "article/video/gallery",
      "ai_score": 0.85,
      "cover": "封面图URL",
      "source": "来源网站",
      "url": "原文链接"
    }
  ]
}

## 🏗️ 技术栈

### 前端
- [React 18](https://react.dev/) - UI框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Ant Design](https://ant.design/) - UI组件库
- [ECharts](https://echarts.apache.org/) - 数据可视化
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Axios](https://axios-http.com/) - HTTP客户端

### 后端
- [FastAPI](https://fastapi.tiangolo.com/) - Web框架
- [Uvicorn](https://www.uvicorn.org/) - ASGI服务器
- [Python 3.10](https://www.python.org/) - 主要编程语言

## 📄 License

本项目采用 MIT 许可证。

<div align="center">
  <sub>Built with  by MindKeeper Team</sub>
</div>
```
