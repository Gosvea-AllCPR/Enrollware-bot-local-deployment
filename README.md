# Enrollware Bot - Automated Data Export Tool

> **🌐 多语言支持 / Multi-language Support**  
> [English](./README.md) | [中文](./README_CN.md)

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

## 👨‍💻 Author Information

**Author**: Boyi Wang (王博一)  
**Email**: boyiwanglance@gmail.com  
**Phone**: +1 (314) 857-2744  

## 🏗️ Technical Architecture

### Why This Approach?
This project was developed to solve a specific business challenge: **accessing Enrollware student data for AI Agent operations**. Since Enrollware data is not publicly accessible and protected by firewall restrictions, traditional API methods were not viable.

### Solution Strategy
- **Puppeteer Automation**: Uses Puppeteer to simulate real user interactions with the Enrollware web interface
- **Firewall Bypass**: Successfully navigates through authentication and access restrictions
- **Data Pipeline**: Automatically extracts, processes, and uploads data to Google Drive
- **AI Agent Integration**: Updates Google Sheets that can be accessed by n8n workflows for AI Agent operations

### Data Flow
```
Enrollware System → Puppeteer Bot → Data Export → Google Drive → Google Sheets → n8n Workflows → AI Agents
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Chrome Browser**: Installed
- **Cursor Editor**: Recommended
- **Network Connection**: Stable internet connection

### 1. Environment Check

First, check your Node.js version:

```bash
node --version
# Should display v18.0.0 or higher
```

### 2. Project Setup

1. **Extract project files** to a local directory
2. **Open Cursor editor**
3. **Open project folder**: `enrollware-bot - V3`

### 3. Install Dependencies

Execute in Cursor's terminal:

```bash
# Navigate to project directory
cd enrollware-bot/enrollware-bot

# Install dependency packages
npm install
```

### 4. Environment Configuration

#### 4.1 Create Environment Variables File

Create a `.env` file in the `enrollware-bot/enrollware-bot/` directory:

```env
EW_USER=your_username@example.com
EW_PASS=your_password
```

**Note**:
- Replace `your_username@example.com` with your Enrollware username
- Replace `your_password` with your Enrollware password
- Filename should be `.env` (note the leading dot)

#### 4.2 Google API Configuration

The project comes pre-configured with Google API, but first-time run requires authorization:

1. **First run of the program**:
   ```bash
   node login_and_export.js
   ```

2. **If authorization is required**:
   - Copy the displayed authorization URL to your browser
   - Complete the Google authorization process
   - Copy the authorization code
   - Run: `node auth-helper.js [authorization_code]`

## 🎮 Usage

### Quick Start (Windows)

1. **First Time Setup**:
   ```bash
   # Double-click setup.bat to configure environment
   setup.bat
   ```

2. **Daily Usage**:
   ```bash
   # Double-click start.bat to run the bot
   start.bat
   ```

### Manual Start (Alternative)

```bash
# Navigate to project directory
cd enrollware-bot/enrollware-bot

# Execute manually
node login_and_export.js
```

### Program Running Status

After startup, the program will display:
```
🤖 Enrollware Bot Started - Executing every 10 minutes
💡 Press Ctrl+C to stop the program

🚀 Starting task execution - 2025/1/7 14:30:00
...
🎉 Task execution completed.
⏱️ Task duration: 45 seconds
⏳ Waiting 10 minutes for next task execution...
⏰ Next execution time: 2025/1/7 14:40:00
```

### Stopping the Program

- **Recommended method**: Press `Ctrl + C`
- **Alternative method**: Close the terminal window

## 📁 Project Structure

```
V2-enrollware-bot-local-deployment-Stable/
├── enrollware-bot/
│   ├── enrollware-bot/
│   │   ├── login_and_export.js       # Main automation program
│   │   ├── google-drive-upload.js    # Google Drive & Sheets integration
│   │   ├── auth-helper.js            # Google API authorization helper
│   │   ├── chrome-finder.js          # Chrome path auto-detection
│   │   ├── package.json              # Node.js dependencies
│   │   ├── chromedriver.exe          # Chrome automation driver
│   │   └── .env                      # Environment variables (create this)
│   ├── chrome-data/                  # Chrome user data directory
│   └── downloads/                     # Temporary download directory
├── chrome-data/                       # Root Chrome data directory
├── downloads/                         # Root download directory
├── setup.bat                         # First-time environment setup
├── start.bat                         # Daily program startup
├── README.md                         # This comprehensive guide
├── DEPLOYMENT.md                     # Local deployment instructions
├── .gitignore                        # Git ignore patterns
└── LICENSE                           # ISC License
```

## 🔧 Configuration

### Environment Variables (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `EW_USER` | Enrollware username | `user@example.com` |
| `EW_PASS` | Enrollware password | `your_password` |

### Program Configuration

- **Execution frequency**: Every 10 minutes
- **Data range**: Data from 6 months ago
- **Data format**: Registration Dates
- **Download path**: `../downloads/`

### Data Storage & Integration

- **Google Drive Folder**: "Enrollware自动化数据导出" (Enrollware Automated Data Export)
- **Google Sheets**: "Enrollware Students Data(use in n8n)"
- **Update Frequency**: Every 10 minutes with new data
- **Data Format**: Excel (.xlsx) files with preserved date formatting
- **AI Agent Access**: Data accessible through n8n workflow automation

## 🛠️ Troubleshooting

### Common Issues

#### 1. Node.js Version Too Low
```bash
# Check version
node --version

# If version is below 18.0.0, please upgrade Node.js
```

#### 2. Dependency Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. Login Failed
- Check if username and password in `.env` file are correct
- Confirm network connection is stable
- Check if Enrollware website is accessible

#### 4. Google API Authorization Failed
```bash
# Re-authorize
node auth-helper.js [new_authorization_code]
```

#### 5. File Download Failed
- Check download directory permissions
- Confirm Chrome browser is installed
- Check network connection

### Error Logs

The program displays detailed error information. Common errors:

- `❌ Authentication failed`: Need to re-authorize Google
- `⚠️ Page load timeout`: Network connection issue, program will retry automatically
- `❌ File processing failed`: Check file permissions and network connection

## 🤖 AI Agent Integration

### n8n Workflow Integration
This bot is specifically designed to work with n8n workflows for AI Agent operations:

1. **Data Source**: Enrollware student data automatically exported every 10 minutes
2. **Data Storage**: Google Sheets "Enrollware Students Data(use in n8n)" 
3. **Workflow Trigger**: n8n can monitor the Google Sheets for changes
4. **AI Agent Access**: AI Agents can query the updated data through n8n workflows
5. **Real-time Updates**: Continuous data synchronization ensures fresh information

### Use Cases
- **Email AI Agent**: Automated student data processing for email campaigns
- **Data Analytics**: Real-time student enrollment analytics
- **Reporting**: Automated report generation with current data
- **Integration**: Seamless connection with other business systems

## 📞 Technical Support

If you encounter issues, please check:

1. **Environment configuration** is correct
2. **Network connection** is stable
3. **Permission settings** are sufficient
4. **Error logs** for specific information

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: Please ensure you run this program in a secure environment and properly safeguard your login credentials.

## 📧 Contact

For questions, support, or collaboration opportunities:

- **Email**: boyiwanglance@gmail.com
- **Phone**: +1 (314) 857-2744

## 🎯 Project Summary

This Enrollware Bot represents a sophisticated solution to a complex business challenge: **automating access to protected student data for AI Agent operations**. By leveraging Puppeteer automation, the bot successfully bypasses firewall restrictions and provides continuous data synchronization to Google Drive and Sheets, enabling seamless integration with n8n workflows and AI Agent systems.

### Key Benefits
- **🔄 Continuous Data Sync**: Real-time updates every 10 minutes
- **🛡️ Secure Access**: Bypasses authentication barriers safely
- **🤖 AI Ready**: Direct integration with n8n and AI Agent workflows
- **📊 Data Integrity**: Preserves original formatting and data structure
- **🚀 Local Deployment**: No cloud dependencies, runs entirely on-premises

---

*Developed with ❤️ by Boyi Wang*
