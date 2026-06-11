from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid
import random

app = FastAPI(title="AI内容筛选API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_CONTENTS = [
    {"id": "1", "title": "DeepSeek R2 模型技术深度解析", "summary": "最新大模型架构创新与性能突破", "content_type": "article", "ai_score": 0.94, "cover": "https://picsum.photos/id/1/350/180", "source": "AI前线", "tags": ["AI", "大模型"]},
    {"id": "2", "title": "2025年AI产品经理生存指南", "summary": "从工具到决策，AI正在重塑产品岗位", "content_type": "article", "ai_score": 0.88, "cover": "https://picsum.photos/id/26/350/180", "source": "人人都是产品经理", "tags": ["产品", "AI"]},
    {"id": "3", "title": "用RAG构建企业知识库的完整实践", "summary": "从向量数据库到问答系统落地", "content_type": "video", "ai_score": 0.91, "cover": "https://picsum.photos/id/0/350/180", "source": "B站", "tags": ["RAG", "工程"]},
    {"id": "4", "title": "YouTube热门AI工具盘点 2025", "summary": "10款提升10倍效率的AI神器", "content_type": "video", "ai_score": 0.85, "cover": "https://picsum.photos/id/20/350/180", "source": "YouTube", "tags": ["工具"]},
    {"id": "5", "title": "硅谷AI创业公司最新融资动态", "summary": "谁在领跑下一轮AI浪潮", "content_type": "article", "ai_score": 0.87, "cover": "https://picsum.photos/id/29/350/180", "source": "36氪", "tags": ["商业"]},
    {"id": "6", "title": "Stable Diffusion 3 实战教程", "summary": "从安装到生成第一张图", "content_type": "gallery", "ai_score": 0.89, "cover": "https://picsum.photos/id/15/350/180", "source": "小红书", "tags": ["AIGC"]},
]

user_profiles: Dict[str, Dict] = {}

class SearchRequest(BaseModel):
    keyword: str
    content_type: str
    mode: bool
    user_id: Optional[str] = None

class PreferenceRequest(BaseModel):
    content_id: str
    action: str
    mode: bool
    user_id: Optional[str] = None

@app.get("/")
def root():
    return {"message": "AI内容筛选API已启动"}

@app.post("/api/search")
async def search(req: SearchRequest):
    filtered = [c for c in MOCK_CONTENTS if req.keyword.lower() in c["title"].lower() or req.keyword.lower() in c["summary"].lower()]
    
    if req.content_type != "all":
        filtered = [c for c in filtered if c["content_type"] == req.content_type]
    
    if not filtered:
        filtered = random.sample(MOCK_CONTENTS, min(3, len(MOCK_CONTENTS)))
    
    for item in filtered:
        item["id"] = str(uuid.uuid4())
    
    updated_profile = None
    if req.mode and req.user_id:
        if req.user_id not in user_profiles:
            user_profiles[req.user_id] = {"tags": {"科技": 0.6, "AI": 0.7, "产品": 0.5}}
        tags = user_profiles[req.user_id]["tags"]
        if "AI" in req.keyword or "模型" in req.keyword:
            tags["AI"] = min(1.0, tags.get("AI", 0.5) + 0.1)
            tags["科技"] = min(1.0, tags.get("科技", 0.5) + 0.05)
        if "产品" in req.keyword:
            tags["产品"] = min(1.0, tags.get("产品", 0.5) + 0.1)
        user_profiles[req.user_id]["tags"] = tags
        updated_profile = user_profiles[req.user_id]
    
    return {"results": filtered, "updated_profile": updated_profile}

@app.post("/api/preference")
async def preference(req: PreferenceRequest):
    if req.mode and req.user_id and req.user_id in user_profiles:
        tags = user_profiles[req.user_id]["tags"]
        if req.action == "like":
            for tag in tags:
                tags[tag] = min(1.0, tags[tag] + 0.05)
        elif req.action == "dislike":
            for tag in tags:
                tags[tag] = max(0.1, tags[tag] - 0.05)
        user_profiles[req.user_id]["tags"] = tags
    return {"status": "success"}

@app.get("/api/user_profile")
async def get_user_profile(user_id: str):
    if user_id in user_profiles:
        return user_profiles[user_id]
    return {"tags": {"科技": 0.5, "AI": 0.5, "产品": 0.5}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)