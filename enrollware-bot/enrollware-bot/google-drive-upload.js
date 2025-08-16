// google-drive-upload.js
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import XLSX from 'xlsx';

// OAuth2配置
const CLIENT_ID = '717704127204-al7ph6am836eqt4e1u2nsc21btu2udfq.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

// Google Drive和Sheets配置
const DRIVE_FOLDER_ID = '16JNR_Fa8QbEFb7xHQ5bXxuu2yC_62kZl';
const SHEETS_DOCUMENT_ID = '1b384XhUDHZMSwp23-bhrxYP8NUELO5O2onL5M1c1yg8';
const SHEETS_SHEET_NAME = 'Students Export in 6 Months';

// 权限范围
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets'
];

class GoogleDriveUploader {
  constructor() {
    this.oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    this.drive = null;
    this.sheets = null;
    this.tokenPath = path.join(process.cwd(), 'token.json');
  }

  // 获取认证URL
  getAuthUrl() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  // 从授权码获取令牌
  async getTokenFromCode(code) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      await this.saveToken(tokens);
      this.oAuth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('获取令牌失败:', error.message);
      throw error;
    }
  }

  // 保存令牌到文件
  async saveToken(tokens) {
    try {
      await fs.writeFile(this.tokenPath, JSON.stringify(tokens));
      console.log('✅ 令牌已保存');
    } catch (error) {
      console.error('保存令牌失败:', error.message);
    }
  }

  // 从文件加载令牌
  async loadToken() {
    try {
      const token = await fs.readFile(this.tokenPath, 'utf8');
      const tokens = JSON.parse(token);
      this.oAuth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.log('⚠️ 未找到保存的令牌，需要重新授权');
      return null;
    }
  }

  // 初始化认证
  async authenticate() {
    try {
      // 尝试加载保存的令牌
      const tokens = await this.loadToken();
      if (tokens) {
        console.log('✅ 使用保存的令牌进行认证');
        return true;
      }

      // 如果没有保存的令牌，需要手动授权
      console.log('🔐 需要手动授权，请访问以下URL:');
      console.log(this.getAuthUrl());
      console.log('请复制授权码并输入:');
      
      // 这里需要手动输入授权码，实际使用时可以通过其他方式获取
      return false;
    } catch (error) {
      console.error('认证失败:', error.message);
      throw error;
    }
  }

  // 初始化API客户端
  async initialize() {
    try {
      this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
      this.sheets = google.sheets({ version: 'v4', auth: this.oAuth2Client });
      console.log('✅ Google API客户端初始化成功');
    } catch (error) {
      console.error('初始化API客户端失败:', error.message);
      throw error;
    }
  }

  // 上传文件到Google Drive
  async uploadFile(filePath, retryCount = 0) {
    try {
      console.log(`📤 正在上传文件: ${path.basename(filePath)}`);
      
      const fileMetadata = {
        name: path.basename(filePath),
        parents: [DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name'
      });

      console.log(`✅ 文件上传成功: ${response.data.name} (ID: ${response.data.id})`);
      return response.data.id;
    } catch (error) {
      console.error(`❌ 文件上传失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.uploadFile(filePath, retryCount + 1);
      } else {
        throw new Error(`文件上传失败，已重试3次: ${error.message}`);
      }
    }
  }

  // 读取Excel数据并保持原始日期格式
  async formatExcelDataWithOriginalDates(filePath) {
    try {
      console.log('📖 正在读取Excel文件并保持原始日期格式...');
      
      const fileContent = await fs.readFile(filePath);
      const workbook = XLSX.read(fileContent, { 
        type: 'buffer',
        cellDates: false, // 不自动转换日期
        cellNF: false,
        cellText: false,
        raw: true // 返回原始值
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // 获取工作表的范围
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const data = [];
      
      // 定义需要格式化为日期的列名
      const dateColumns = ['Reg. Date', 'Course Date'];
      let dateColumnIndexes = [];
      
      // 逐行读取数据，保持原始格式
      for (let row = range.s.r; row <= range.e.r; row++) {
        const rowData = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          
          if (row === range.s.r) {
            // 第一行是列名，记录日期列的索引
            if (cell && cell.v && dateColumns.includes(cell.v.toString())) {
              dateColumnIndexes.push(col);
              console.log(`📅 发现日期列: ${cell.v} (列索引: ${col})`);
            }
          }
          
          if (cell) {
            // 检查是否是日期列
            if (dateColumnIndexes.includes(col)) {
              // 这是日期列，需要特殊处理
              if (cell.t === 'd' && cell.v instanceof Date) {
                // 格式化日期为 M/D/YY HH:MM 格式
                const date = cell.v;
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const year = date.getFullYear().toString().slice(-2);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                rowData.push(`${month}/${day}/${year} ${hours}:${minutes}`);
              } else if (cell.t === 'n' && cell.v) {
                // 检查是否是Excel日期数字（1900年1月1日以来的天数）
                const excelDate = cell.v;
                if (excelDate > 1 && excelDate < 100000) {
                  // 可能是Excel日期，尝试转换
                  try {
                    // 使用XLSX的日期转换功能
                    const date = new Date((excelDate - 25569) * 86400 * 1000);
                    if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                      const month = date.getMonth() + 1;
                      const day = date.getDate();
                      const year = date.getFullYear().toString().slice(-2);
                      const hours = date.getHours().toString().padStart(2, '0');
                      const minutes = date.getMinutes().toString().padStart(2, '0');
                      rowData.push(`${month}/${day}/${year} ${hours}:${minutes}`);
                    } else {
                      rowData.push(cell.v);
                    }
                  } catch (e) {
                    rowData.push(cell.v);
                  }
                } else {
                  rowData.push(cell.v);
                }
              } else if (cell.t === 's' && cell.v) {
                // 字符串类型，检查是否已经是日期格式
                const value = cell.v.toString();
                // 检查是否是日期格式的字符串
                if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(value)) {
                  rowData.push(value);
                } else {
                  rowData.push(cell.v);
                }
              } else {
                // 其他类型的数据
                rowData.push(cell.v || '');
              }
            } else {
              // 非日期列，保持原始格式
              if (cell.t === 'n') {
                // 数字类型，保持原始数字格式
                rowData.push(cell.v);
              } else if (cell.t === 's') {
                // 字符串类型，保持原始字符串格式
                rowData.push(cell.v);
              } else if (cell.t === 'b') {
                // 布尔类型
                rowData.push(cell.v);
              } else {
                // 其他类型
                rowData.push(cell.v || '');
              }
            }
          } else {
            rowData.push('');
          }
        }
        data.push(rowData);
      }
      
      if (data.length === 0) {
        throw new Error('Excel文件为空');
      }
      
      console.log(`✅ 文件读取成功，列数: ${data[0].length}, 数据行数: ${data.length - 1}`);
      console.log('📋 列名:', data[0]);
      console.log(`📅 日期列索引: ${dateColumnIndexes}`);
      
      return data;
    } catch (error) {
      console.error('❌ 读取Excel文件失败:', error.message);
      throw error;
    }
  }

  // 更新Google Sheets
  async updateSheets(data, retryCount = 0) {
    try {
      console.log('📊 正在更新Google Sheets（保持数据格式）...');
      
      // 首先获取工作表信息
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: SHEETS_DOCUMENT_ID
      });
      
      // 显示所有可用的工作表
      const availableSheets = spreadsheet.data.sheets.map(sheet => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title
      }));
      console.log('📋 可用的工作表:', availableSheets.map(s => `${s.title} (ID: ${s.id})`));
      
      // 直接使用第一个工作表
      const firstSheet = spreadsheet.data.sheets[0];
      if (!firstSheet) {
        throw new Error('未找到任何工作表');
      }
      
      const sheetTitle = firstSheet.properties.title;
      console.log(`📋 使用工作表: ${sheetTitle}`);
      
      if (data.length > 0) {
        console.log(`📊 数据行数: ${data.length}, 开始更新...`);
        
        // 步骤1: 清空现有数据
        console.log('🧹 清空现有数据...');
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: SHEETS_DOCUMENT_ID,
          range: `${sheetTitle}!A:Z`
        });
        
        // 步骤2: 立即写入新数据（保持所有格式）
        console.log('✍️ 写入新数据（保持原始格式）...');
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: SHEETS_DOCUMENT_ID,
          range: `${sheetTitle}!A1`,
          valueInputOption: 'USER_ENTERED', // 关键：保持日期格式和数据类型
          resource: { values: data }
        });
      }

      console.log('✅ Google Sheets更新成功');
      console.log(`📊 更新了 ${data.length} 行数据，数据格式完全保持`);
      console.log('📅 日期格式已保持原样（如：8/5/25 14:30）');
    } catch (error) {
      console.error(`❌ 更新Google Sheets失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      // 添加详细的错误信息
      if (error.response) {
        console.error('详细错误信息:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.updateSheets(data, retryCount + 1);
      } else {
        throw new Error(`更新Google Sheets失败，已重试3次: ${error.message}`);
      }
    }
  }

  // 删除Drive中的文件
  async deleteDriveFile(fileId, retryCount = 0) {
    try {
      console.log('🗑️ 正在删除Drive中的文件...');
      
      await this.drive.files.delete({
        fileId: fileId
      });

      console.log('✅ Drive文件删除成功');
    } catch (error) {
      console.error(`❌ 删除Drive文件失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.deleteDriveFile(fileId, retryCount + 1);
      } else {
        console.log('⚠️ 删除Drive文件失败，但继续执行');
      }
    }
  }

  // 删除本地文件
  async deleteLocalFile(filePath, retryCount = 0) {
    try {
      console.log('🗑️ 正在删除本地文件...');
      
      await fs.unlink(filePath);
      console.log('✅ 本地文件删除成功');
    } catch (error) {
      console.error(`❌ 删除本地文件失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.deleteLocalFile(filePath, retryCount + 1);
      } else {
        console.log('⚠️ 删除本地文件失败，但继续执行');
      }
    }
  }

  // 将Excel文件转换为Google Sheets格式
  async convertExcelToGoogleSheet(filePath, retryCount = 0) {
    try {
      console.log('🔄 正在将Excel文件转换为Google Sheets格式...');
      
      // 读取文件内容
      const fileContent = await fs.readFile(filePath);
      
      // 创建新的Google Sheets文件
      const newSheet = await this.drive.files.create({
        requestBody: {
          name: `Enrollware-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: [DRIVE_FOLDER_ID]
        },
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          body: Readable.from(fileContent)
        }
      });
      
      console.log(`✅ Excel文件已转换为Google Sheets: ${newSheet.data.name} (ID: ${newSheet.data.id})`);
      return newSheet.data.id;
    } catch (error) {
      console.error(`❌ 转换Excel文件失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.convertExcelToGoogleSheet(filePath, retryCount + 1);
      } else {
        throw new Error(`转换Excel文件失败，已重试3次: ${error.message}`);
      }
    }
  }

  // 从Google Sheets复制数据到目标工作表
  async copyDataFromSheet(sourceSheetId, targetSheetId, retryCount = 0) {
    try {
      console.log('📋 正在从转换后的Google Sheets复制数据...');
      
      // 获取源工作表的数据
      const sourceData = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sourceSheetId,
        range: 'A:Z'
      });
      
      if (!sourceData.data.values || sourceData.data.values.length === 0) {
        throw new Error('源工作表为空');
      }
      
      // 获取目标工作表信息
      const targetSpreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: targetSheetId
      });
      
      const targetSheet = targetSpreadsheet.data.sheets[0];
      if (!targetSheet) {
        throw new Error('未找到目标工作表');
      }
      
      const targetSheetTitle = targetSheet.properties.title;
      console.log(`📋 目标工作表: ${targetSheetTitle}`);
      
      // 清空目标工作表
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: targetSheetId,
        range: `${targetSheetTitle}!A:Z`
      });
      
      // 复制数据到目标工作表
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: targetSheetId,
        range: `${targetSheetTitle}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: sourceData.data.values }
      });
      
      console.log('✅ 数据复制成功');
      
      // 删除临时转换的Google Sheets文件
      await this.deleteDriveFile(sourceSheetId);
      
    } catch (error) {
      console.error(`❌ 复制数据失败 (尝试 ${retryCount + 1}/3):`, error.message);
      
      if (retryCount < 2) {
        console.log(`🔄 ${2 - retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.copyDataFromSheet(sourceSheetId, targetSheetId, retryCount + 1);
      } else {
        throw new Error(`复制数据失败，已重试3次: ${error.message}`);
      }
    }
  }

  // 处理文件上传和Sheets更新
  async processFile(filePath) {
    try {
      console.log('🚀 开始处理文件...');
      
      // 1. 上传文件到Drive（保留原始文件用于转换）
      const fileId = await this.uploadFile(filePath);
      
      // 2. 读取Excel数据并保持原始日期格式
      const formattedData = await this.formatExcelDataWithOriginalDates(filePath);
      
      // 3. 直接更新Google Sheets，保持原始格式
      await this.updateSheets(formattedData);
      
      // 4. 删除Drive中的原始文件
      await this.deleteDriveFile(fileId);
      
      // 5. 删除本地文件
      await this.deleteLocalFile(filePath);
      
      console.log('🎉 文件处理完成！');
      return true;
    } catch (error) {
      console.error('❌ 文件处理失败:', error.message);
      throw error;
    }
  }
}

export default GoogleDriveUploader; 