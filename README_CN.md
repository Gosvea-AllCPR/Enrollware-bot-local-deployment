# Enrollware Bot - 自动化数据导出工具

> **🌐 多语言支持 / Multi-language Support**  
> [English](./README.md) | [中文](./README_CN.md)

## 📋 项目简介

这是一个自动化工具，用于从Enrollware系统导出学生数据，并自动上传到Google Drive和更新Google Sheets。该项目解决了AI Agent操作中访问Enrollware学生数据的挑战，通过使用Puppeteer自动化网页交互，成功绕过防火墙限制，实现自动数据提取和更新。

### 🎯 主要功能

- ✅ **自动登录Enrollware系统** - 绕过身份验证障碍
- ✅ **导出6个月前的Registration Dates数据** - 可配置的数据范围
- ✅ **自动上传到Google Drive** - 存储在"Enrollware自动化数据导出"文件夹中
- ✅ **自动更新Google Sheets** - 更新"Enrollware Students Data(use in n8n)"电子表格
- ✅ **每10分钟自动执行一次** - 持续数据同步
- ✅ **保持原始数据格式（日期格式）** - 保护数据完整性
- ✅ **支持优雅停止（Ctrl+C）** - 安全程序终止
- ✅ **基于Puppeteer的自动化** - 成功绕过防火墙限制
- ✅ **AI Agent集成就绪** - 数据可通过n8n工作流自动化访问

## 👨‍💻 作者信息

**作者**: Boyi Wang (王博一)  
**邮箱**: boyiwanglance@gmail.com  
**电话**: +1 (314) 857-2744  

## 🏗️ 技术架构

### 为什么采用这种方法？
该项目是为了解决特定的业务挑战而开发的：**为AI Agent操作访问Enrollware学生数据**。由于Enrollware数据不公开且受防火墙限制保护，传统的API方法不可行。

### 解决方案策略
- **Puppeteer自动化**: 使用Puppeteer模拟与Enrollware Web界面的真实用户交互
- **防火墙绕过**: 成功通过身份验证和访问限制
- **数据管道**: 自动提取、处理和上传数据到Google Drive
- **AI Agent集成**: 更新可通过n8n工作流访问的Google Sheets，用于AI Agent操作

### 数据流程
```
Enrollware系统 → Puppeteer机器人 → 数据导出 → Google Drive → Google Sheets → n8n工作流 → AI代理
```

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0.0 或更高版本
- **Chrome浏览器**: 已安装
- **Cursor编辑器**: 推荐使用
- **网络连接**: 稳定的互联网连接

### 1. 环境检查

首先检查Node.js版本：

```bash
node --version
# 应该显示 v18.0.0 或更高版本
```

### 2. 项目设置

1. **解压项目文件**到本地目录
2. **打开Cursor编辑器**
3. **打开项目文件夹**: `V2-enrollware-bot-local-deployment-Stable`

### 3. 安装依赖

在Cursor的终端中执行：

```bash
# 进入项目目录
cd enrollware-bot/enrollware-bot

# 安装依赖包
npm install
```

### 4. 环境配置

#### 4.1 创建环境变量文件

在 `enrollware-bot/enrollware-bot/` 目录下创建 `.env` 文件：

```env
EW_USER=your_username@example.com
EW_PASS=your_password
```

**注意**：
- 将 `your_username@example.com` 替换为您的Enrollware用户名
- 将 `your_password` 替换为您的Enrollware密码
- 文件名为 `.env`（注意前面的点）

#### 4.2 Google API配置

项目已预配置Google API，但首次运行需要授权：

1. **首次运行程序**：
   ```bash
   node login_and_export.js
   ```

2. **如果提示需要授权**：
   - 复制显示的授权URL到浏览器
   - 完成Google授权流程
   - 复制授权码
   - 运行：`node auth-helper.js [授权码]`

## 🎮 使用方法

### 快速开始（Windows）

1. **首次设置**：
   ```bash
   # 双击setup.bat配置环境
   setup.bat
   ```

2. **日常使用**：
   ```bash
   # 双击start.bat启动机器人
   start.bat
   ```

### 手动启动（替代方案）

```bash
# 进入项目目录
cd enrollware-bot/enrollware-bot

# 手动执行
node login_and_export.js
```

### 程序运行状态

程序启动后会显示：
```
🤖 Enrollware机器人启动 - 每10分钟执行一次
💡 按 Ctrl+C 停止程序

🚀 开始执行任务 - 2025/1/7 14:30:00
...
🎉 任务执行完成。
⏱️ 任务耗时: 45秒
⏳ 等待10分钟后执行下一次任务...
⏰ 下次执行时间: 2025/1/7 14:40:00
```

### 停止程序

- **推荐方式**：按 `Ctrl + C`
- **备用方式**：关闭终端窗口

## 📁 项目结构

```
V2-enrollware-bot-local-deployment-Stable/
├── enrollware-bot/
│   ├── enrollware-bot/
│   │   ├── login_and_export.js       # 主自动化程序
│   │   ├── google-drive-upload.js    # Google Drive和Sheets集成
│   │   ├── auth-helper.js            # Google API授权助手
│   │   ├── chrome-finder.js          # Chrome路径自动检测
│   │   ├── package.json              # Node.js依赖
│   │   ├── chromedriver.exe          # Chrome自动化驱动
│   │   └── .env                      # 环境变量（创建此文件）
│   ├── chrome-data/                  # Chrome用户数据目录
│   └── downloads/                     # 临时下载目录
├── chrome-data/                       # 根Chrome数据目录
├── downloads/                         # 根下载目录
├── setup.bat                         # 首次环境设置
├── start.bat                         # 日常程序启动
├── README.md                         # 英文版说明文档
├── README_CN.md                      # 中文版说明文档
├── DEPLOYMENT.md                     # 本地部署说明
├── .gitignore                        # Git忽略模式
└── LICENSE                           # ISC许可证
```

## 🔧 配置说明

### 环境变量 (.env)

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `EW_USER` | Enrollware用户名 | `user@example.com` |
| `EW_PASS` | Enrollware密码 | `your_password` |

### 程序配置

- **执行频率**：每10分钟一次
- **数据范围**：6个月前的数据
- **数据格式**：Registration Dates
- **下载路径**：`../downloads/`

### 数据存储与集成

- **Google Drive文件夹**："Enrollware自动化数据导出"
- **Google Sheets**："Enrollware Students Data(use in n8n)"
- **更新频率**：每10分钟更新新数据
- **数据格式**：Excel (.xlsx) 文件，保持日期格式
- **AI Agent访问**：通过n8n工作流自动化访问数据

## 🛠️ 故障排除

### 常见问题

#### 1. Node.js版本过低
```bash
# 检查版本
node --version

# 如果版本低于18.0.0，请升级Node.js
```

#### 2. 依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

#### 3. 登录失败
- 检查 `.env` 文件中的用户名和密码是否正确
- 确认网络连接正常
- 检查Enrollware网站是否可以正常访问

#### 4. Google API授权失败
```bash
# 重新授权
node auth-helper.js [新的授权码]
```

#### 5. 文件下载失败
- 检查下载目录权限
- 确认Chrome浏览器已安装
- 检查网络连接

### 错误日志

程序会显示详细的错误信息，常见错误：

- `❌ 认证失败`：需要重新进行Google授权
- `⚠️ 页面加载超时`：网络连接问题，程序会自动重试
- `❌ 文件处理失败`：检查文件权限和网络连接

## 🤖 AI Agent集成

### n8n工作流集成
此机器人专门设计用于与n8n工作流配合进行AI Agent操作：

1. **数据源**：每10分钟自动导出的Enrollware学生数据
2. **数据存储**：Google Sheets "Enrollware Students Data(use in n8n)"
3. **工作流触发**：n8n可以监控Google Sheets的变化
4. **AI Agent访问**：AI代理可以通过n8n工作流查询更新的数据
5. **实时更新**：持续数据同步确保信息新鲜

### 使用场景
- **邮件AI Agent**：自动学生数据处理用于邮件营销
- **数据分析**：实时学生注册分析
- **报告生成**：使用当前数据自动生成报告
- **系统集成**：与其他业务系统无缝连接

## 📞 技术支持

如果遇到问题，请检查：

1. **环境配置**是否正确
2. **网络连接**是否稳定
3. **权限设置**是否足够
4. **错误日志**中的具体信息

## 📄 许可证

本项目采用ISC许可证。

## 🤝 贡献

欢迎贡献！请随时提交Pull Request。

---

**注意**：请确保在安全的环境中运行此程序，并妥善保管您的登录凭据。

## 📧 联系方式

如有问题、支持或合作机会：

- **邮箱**: boyiwanglance@gmail.com
- **电话**: +1 (314) 857-2744

## 🎯 项目总结

这个Enrollware Bot代表了对复杂业务挑战的成熟解决方案：**为AI Agent操作自动化访问受保护的学生数据**。通过利用Puppeteer自动化，机器人成功绕过防火墙限制，并提供到Google Drive和Sheets的持续数据同步，实现与n8n工作流和AI Agent系统的无缝集成。

### 主要优势
- **🔄 持续数据同步**：每10分钟实时更新
- **🛡️ 安全访问**：安全绕过身份验证障碍
- **🤖 AI就绪**：直接集成n8n和AI Agent工作流
- **📊 数据完整性**：保持原始格式和数据结构
- **🚀 本地部署**：无云端依赖，完全在本地运行

---

*由Boyi Wang开发 ❤️*

