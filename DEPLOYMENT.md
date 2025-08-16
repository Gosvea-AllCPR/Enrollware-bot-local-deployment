# Local Deployment Guide

## 🚀 Quick Local Setup

This project is designed for local deployment only. Follow these steps to get started:

### 1. Download and Extract
- Download the project zip file
- Extract to your local machine
- Navigate to the project directory

### 2. Prerequisites
- **Node.js**: 18.0.0 or higher
- **Chrome Browser**: Installed
- **Network Connection**: Stable internet access

### 3. Installation
```bash
# Navigate to the project directory
cd enrollware-bot/enrollware-bot

# Install dependencies
npm install
```

### 4. Configuration
Create a `.env` file in the `enrollware-bot/enrollware-bot/` directory:
```env
EW_USER=your_username@example.com
EW_PASS=your_password
```

### 5. Run the Application
```bash
# Start the bot
node login_and_export.js
```

## 📁 Project Structure
```
V2-enrollware-bot-local-deployment-Stable/
├── enrollware-bot/
│   ├── enrollware-bot/
│   │   ├── login_and_export.js    # Main application
│   │   ├── google-drive-upload.js # Google integration
│   │   ├── auth-helper.js         # Authorization helper
│   │   ├── package.json           # Dependencies
│   │   └── .env                   # Your credentials (create this)
│   └── downloads/                 # Export files directory
└── README.md                      # This documentation
```

## 🔧 Configuration Options
- **Execution Frequency**: Every 10 minutes
- **Data Range**: 6 months of registration data
- **Export Format**: Excel (.xlsx)
- **Auto-upload**: Google Drive + Sheets

## 🛠️ Troubleshooting
- Ensure `.env` file is properly configured
- Check Chrome browser installation
- Verify network connectivity
- Review console output for errors

## 📞 Support
For technical support or questions:
- **Email**: boyiwanglance@gmail.com
- **Phone**: +1 (314) 857-2744

---

**Note**: This is a local deployment tool. No cloud services or external servers are required.
