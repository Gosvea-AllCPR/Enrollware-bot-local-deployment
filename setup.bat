@echo off
echo ========================================
echo    Enrollware Bot - 环境配置脚本
echo ========================================
echo.

REM 检查Node.js是否安装
echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装或未添加到PATH
    echo 请先安装Node.js 18.0.0或更高版本
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js已安装
    node --version
)

REM 检查npm是否可用
echo.
echo [2/5] 检查npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm不可用
    pause
    exit /b 1
) else (
    echo ✅ npm可用
)

REM 进入项目目录
echo.
echo [3/5] 进入项目目录...
cd /d "%~dp0enrollware-bot\enrollware-bot"
if %errorlevel% neq 0 (
    echo ❌ 无法进入项目目录
    pause
    exit /b 1
) else (
    echo ✅ 已进入项目目录: %CD%
)

REM 安装依赖
echo.
echo [4/5] 安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
) else (
    echo ✅ 依赖安装完成
)

REM 检查.env文件
echo.
echo [5/5] 检查环境配置...
if not exist ".env" (
    echo ⚠️ 未找到.env文件，需要手动创建
    echo.
    echo 请在 %CD% 目录下创建 .env 文件，内容如下：
    echo.
    echo EW_USER=your_username@example.com
    echo EW_PASS=your_password
    echo.
    echo 请将 your_username@example.com 和 your_password 替换为实际值
    echo.
) else (
    echo ✅ 找到.env文件
)

echo.
echo ========================================
echo           配置完成！
echo ========================================
echo.
echo 下一步操作：
echo 1. 如果提示需要创建.env文件，请按照上述说明创建
echo 2. 运行程序: node login_and_export.js
echo 3. 如果首次运行需要Google授权，请按照提示操作
echo.
echo 详细说明请查看 README.md 文件
echo.
pause 