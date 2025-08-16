@echo off
echo ========================================
echo    Enrollware Bot - 启动脚本
echo ========================================
echo.

REM 进入项目目录
cd /d "%~dp0enrollware-bot\enrollware-bot"

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请先安装Node.js 18.0.0或更高版本
    pause
    exit /b 1
)

REM 检查.env文件
if not exist ".env" (
    echo ❌ 未找到.env文件
    echo 请创建.env文件并配置用户名和密码
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo 🚀 启动Enrollware Bot...
echo.
echo 💡 按 Ctrl+C 停止程序
echo.

REM 启动程序
node login_and_export.js

pause 