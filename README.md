# RAGWEB - AI 智能问答助手

基于 RAG（检索增强生成）的 AI 智能问答系统，提供 7×24 小时自动化咨询服务。

## 技术栈

### 前端

- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 4
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **Markdown 渲染**：marked + DOMPurify
- **语音输入**：RecordRTC + Whisper
- **HTTP 客户端**：axios
- **测试**：Vitest + Playwright

### 后端

- **框架**：FastAPI
- **ORM**：SQLAlchemy 2.0 + PyMySQL
- **服务器**：Uvicorn
- **IP 定位**：ip2region + IP2Location
- **分词**：jieba

## 项目结构

```
├── src/                          # 前端源码
│   ├── api/                      # API 接口层
│   ├── components/               # Vue 组件
│   │   └── icons/                # SVG 图标组件
│   ├── composables/              # 组合式函数
│   ├── router/                   # 路由配置
│   ├── stores/                   # Pinia 状态管理
│   ├── styles/                   # 全局样式
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   ├── views/                    # 页面视图
│   └── __tests__/                # 测试文件
├── backend-python/               # Python 后端
│   ├── main.py                   # 应用入口
│   ├── database.py               # 数据库模块
│   ├── dashboard.py              # 数据大屏
│   ├── statistic.py              # 数据统计
│   ├── ip2location.py            # IP 定位
│   ├── email_sender.py           # 邮件发送
│   └── requirements.txt          # Python 依赖
├── public/                       # 静态资源
├── index.html                    # HTML 入口
├── vite.config.ts                # Vite 配置
└── package.json                  # 前端依赖
```

## 快速开始

### 环境要求

- **Node.js** >= 18
- **pnpm** >= 8
- **Python** >= 3.10
- **uv**（Python 包管理器）

### 前端

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 运行测试
pnpm test
```

### 后端

```bash
cd backend-python

# 创建虚拟环境
uv venv

# 安装依赖
uv pip install -r requirements.txt

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

### 环境变量

参考 `.env.example` 配置环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | RAG API 基础地址 | 留空走代理 |
| `VITE_CHAT_BACKEND_URL` | 聊天后端地址 | `http://localhost:9000` |
| `VITE_WHISPER_URL` | Whisper 语音识别服务 | `http://localhost:7860` |
| `VITE_CHAT_TIMEOUT_MS` | 聊天请求超时（毫秒） | `15000` |
| `VITE_DEV_MOCK_RAG_CHAT` | Mock RAG 对话 | `false` |

## 功能特性

- AI 智能问答：基于 RAG 的智能对话，支持流式 SSE 响应
- 语音输入：浏览器录音 + Whisper 语音识别
- 数据大屏：实时统计数据展示，WebSocket 推送
- 深色模式：支持亮色/深色主题切换
- 响应式设计：适配桌面端和移动端
- Markdown 渲染：支持富文本消息展示
- 邮件通知：人工介入告警邮件提醒
- IP 定位：访问者地理位置识别

## License

Private
