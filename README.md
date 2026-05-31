# AI Kanban Todo App

全端 AI 任務管理板：Next.js 前端 + FastAPI 後端 + 本地 Ollama（GPU）。

## 功能特色

Kanban 看板管理（Todo / Doing / Done）
任務新增、編輯、刪除
拖曳移動與狀態更新
AI 自動拆解任務為子任務
本地 Ollama AI 整合
任務資料同步與即時更新


## 專案結構

```
Kanban Todo App/
├── frontend/                 # Next.js App Router + Tailwind + Zustand
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── Dockerfile
│   └── package.json
├── backend/                  # FastAPI + SQLAlchemy + Ollama (httpx)
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/          # health, tasks, ai
│   │   ├── services/         # ollama_service, breakdown_service
│   │   ├── models/
│   │   └── schemas/
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml        # frontend + backend + ollama
└── README.md
```

## 功能

- Kanban 三欄：Todo / Doing / Done
- 拖曳、新增、編輯、刪除任務（SQLite 持久化）
- **AI 拆解任務**：輸入描述 → Ollama 本地推論 → JSON 子任務 → 一鍵加入看板
- Health check、CORS、timeout、logging、錯誤處理

## 快速啟動（Docker）

```powershell
cd "d:\Kanban Todo App"

docker compose up --build -d

# 首次下載模型（GPU）
docker exec -it ai-kanban-ollama ollama pull llama3.2:3b
```

| 服務 | 網址 |
|------|------|
| 前端 | http://localhost:3000 |
| 後端 API | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| Ollama | http://localhost:11434 |

## 本地開發

### 後端

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:OLLAMA_BASE_URL="http://localhost:11434"
uvicorn app.main:app --reload --port 8000
```

### 前端

```powershell
cd frontend
npm install
$env:BACKEND_URL="http://localhost:8000"
npm run dev
```

### Ollama（本機）

```powershell
ollama serve
ollama pull llama3.2:3b
```

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/health` | 健康檢查 + Ollama 狀態 |
| GET | `/api/tasks` | 列出任務 |
| POST | `/api/tasks` | 建立任務 |
| PATCH | `/api/tasks/{id}` | 更新任務 |
| DELETE | `/api/tasks/{id}` | 刪除任務 |
| POST | `/ai/breakdown` | AI 拆解任務 |

### AI 拆解範例

```json
POST /ai/breakdown
{ "description": "建立 Kanban 全端應用" }

→ [
  { "id": 1, "title": "初始化 Next.js 專案" },
  { "id": 2, "title": "建立 FastAPI 後端" }
]
```

## 環境變數

### Backend (`backend/.env.example`)

| 變數 | 預設 |
|------|------|
| `OLLAMA_BASE_URL` | `http://ollama:11434` |
| `OLLAMA_MODEL` | `llama3.2:3b` |
| `OLLAMA_TIMEOUT_SECONDS` | `120` |
| `CORS_ORIGINS` | `http://localhost:3000,...` |
| `DATA_DIR` | `./data` |

### Frontend (`frontend/.env.example`)

| 變數 | 預設 |
|------|------|
| `BACKEND_URL` | `http://localhost:8000` |

## 分別建置 Docker Image

```powershell
docker build -t ai-kanban-backend ./backend
docker build -t ai-kanban-frontend ./frontend
docker pull ollama/ollama
```

## GPU 需求

Ollama 容器使用 `gpus: all`。需 NVIDIA 驅動 + Docker GPU 支援。

```powershell
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
```
