# 任務管理系統

一個使用 React.js 和 Node.js 建立的全端任務管理應用程式。

## 功能特色

- ✅ 任務管理（新增、編輯、刪除、標記完成）
- 👥 用戶管理（新增、查看用戶列表）
- 🎨 現代化 UI 設計（使用 Tailwind CSS）
- 📱 響應式設計
- 💾 SQLite 資料庫
- 🔄 即時更新

## 技術棧

### 前端
- React.js 18 (Function Components + Hooks)
- Tailwind CSS
- Fetch API

### 後端
- Node.js
- Express.js
- SQLite3
- CORS

## 安裝與執行

### 1. 安裝所有依賴
```bash
npm run install-all
```

### 2. 同時啟動前端和後端
```bash
npm run dev
```

或者分別啟動：

```bash
# 啟動後端 (port 5000)
npm run server

# 啟動前端 (port 3000)
npm run client
```

### 3. 訪問應用程式
- 前端: http://localhost:3000
- 後端 API: http://localhost:5000/api

## API 端點

### 任務管理
- `GET /api/tasks` - 取得所有任務
- `GET /api/tasks/:id` - 取得單一任務
- `POST /api/tasks` - 新增任務
- `PUT /api/tasks/:id` - 更新任務
- `DELETE /api/tasks/:id` - 刪除任務

### 用戶管理
- `GET /api/users` - 取得所有用戶
- `POST /api/users` - 新增用戶

### 系統
- `GET /api/health` - 健康檢查

## 專案結構

```
webreact/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/      # React 組件
│   │   │   ├── Header.js
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   ├── TaskItem.js
│   │   │   ├── UserForm.js
│   │   │   └── UserList.js
│   │   ├── App.js           # 主應用程式
│   │   ├── index.js         # 入口點
│   │   └── index.css        # 樣式
│   ├── public/
│   └── package.json
├── backend/                  # Node.js 後端
│   ├── server.js            # 主伺服器
│   ├── database.sqlite      # SQLite 資料庫
│   └── package.json
├── package.json             # 根目錄配置
└── README.md
```

## 開發規範

- 使用 Function Components 而非 Class Components
- 使用 React Hooks (useState, useEffect)
- 優先使用 Tailwind CSS 進行樣式設計
- 使用 fetch API 進行 HTTP 請求
- 遵循 RESTful API 設計原則

## 資料庫結構

### tasks 表
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `completed` (BOOLEAN, DEFAULT 0)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### users 表
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `createdAt` (DATETIME)

## 授權

MIT License

