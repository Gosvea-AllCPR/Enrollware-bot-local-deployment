---
layout: default
title: Enrollware Bot - Automated Data Export Tool
---

# Enrollware Bot - Automated Data Export Tool

## 📋 Project Description

This is an automation tool designed to export student data from the Enrollware system and automatically upload it to Google Drive while updating Google Sheets. The project addresses the challenge of accessing Enrollware student data for AI Agent operations by using Puppeteer to automate web interactions, successfully bypassing firewall restrictions and enabling automatic data extraction and updates.

### 🎯 Key Features

- ✅ **Automatic login to Enrollware system** - Bypasses authentication barriers
- ✅ **Export data from 6 months ago based on Registration Dates** - Configurable data range
- ✅ **Automatic upload to Google Drive** - Stores data in "Enrollware自动化数据导出" folder
- ✅ **Automatic Google Sheets updates** - Updates "Enrollware Students Data(use in n8n)" spreadsheet
- ✅ **Executes every 10 minutes automatically** - Continuous data synchronization
- ✅ **Maintains original data format (date format)** - Preserves data integrity
- ✅ **Supports graceful shutdown (Ctrl+C)** - Safe program termination
- ✅ **Puppeteer-based automation** - Successfully bypasses firewall restrictions
- ✅ **AI Agent integration ready** - Data accessible for n8n workflow automation

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Chrome Browser**: Installed
- **Network Connection**: Stable internet connection

### Quick Start (Windows)

1. **First Time Setup**: Double-click `setup.bat` to configure environment
2. **Daily Usage**: Double-click `start.bat` to run the bot

### Manual Start

```bash
cd enrollware-bot/enrollware-bot
node login_and_export.js
```

## 📁 Project Structure

```
V2-enrollware-bot-local-deployment-Stable/
├── enrollware-bot/          # Main program directory
├── setup.bat               # Environment setup script
├── start.bat               # Program startup script
├── README.md               # English documentation
├── README_CN.md            # Chinese documentation
└── DEPLOYMENT.md           # Deployment guide
```

## 🤖 AI Agent Integration

This bot is specifically designed to work with n8n workflows for AI Agent operations:

- **Data Source**: Enrollware student data automatically exported every 10 minutes
- **Data Storage**: Google Sheets "Enrollware Students Data(use in n8n)" 
- **AI Agent Access**: Data accessible through n8n workflow automation

## 📧 Contact

- **Email**: boyiwanglance@gmail.com
- **Phone**: +1 (314) 857-2744
- **GitHub**: [@Boyi-Wang-washu](https://github.com/Boyi-Wang-washu)

---

**For detailed documentation, see [README.md](./README.md) or [README_CN.md](./README_CN.md)**

*Developed with ❤️ by Boyi Wang*
