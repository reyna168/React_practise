@echo off
echo 正在安裝依賴套件...
call npm run install-all

echo.
echo 依賴套件安裝完成！
echo 正在啟動應用程式...
echo.
echo 前端將在 http://localhost:3000 啟動
echo 後端將在 http://localhost:5000 啟動
echo.
echo 按 Ctrl+C 停止應用程式
echo.

call npm run dev

