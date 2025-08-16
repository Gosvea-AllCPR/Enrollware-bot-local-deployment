// login_and_export.js
import fs from 'node:fs/promises';
import fssync from 'fs';
import path from 'node:path';
import { connect } from 'puppeteer-real-browser';
import dotenv from 'dotenv';
import GoogleDriveUploader from './google-drive-upload.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { findChromePath, validateChromePath } from './chrome-finder.js';

dotenv.config();

// 监控工具函数
const execAsync = promisify(exec);

// 系统监控类
class SystemMonitor {
  constructor() {
    this.startTime = new Date();
    this.lastCheckTime = new Date();
    this.checkInterval = 30000; // 30秒检查一次
    this.monitoring = false;
  }

  // 获取内存使用情况
  async getMemoryUsage() {
    try {
      const { stdout } = await execAsync('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /Value');
      const lines = stdout.split('\n');
      const total = parseInt(lines.find(line => line.includes('TotalVisibleMemorySize='))?.split('=')[1] || 0);
      const free = parseInt(lines.find(line => line.includes('FreePhysicalMemory='))?.split('=')[1] || 0);
      const used = total - free;
      const usagePercent = ((used / total) * 100).toFixed(1);
      return { total, free, used, usagePercent };
    } catch (error) {
      return { error: error.message };
    }
  }

  // 获取Chrome进程状态
  async getChromeProcesses() {
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV');
      const lines = stdout.split('\n').filter(line => line.includes('chrome.exe'));
      return lines.length;
    } catch (error) {
      return 0;
    }
  }

  // 获取Node.js进程状态
  async getNodeProcesses() {
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
      return lines.length;
    } catch (error) {
      return 0;
    }
  }

  // 检查磁盘空间
  async getDiskSpace() {
    try {
      const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption /Value');
      const lines = stdout.split('\n');
      const cDrive = lines.find(line => line.includes('Caption=C:'));
      const size = parseInt(lines.find(line => line.includes('Size='))?.split('=')[1] || 0);
      const free = parseInt(lines.find(line => line.includes('FreeSpace='))?.split('=')[1] || 0);
      const used = size - free;
      const usagePercent = ((used / size) * 100).toFixed(1);
      return { size, free, used, usagePercent };
    } catch (error) {
      return { error: error.message };
    }
  }

  // 记录系统状态
  async logSystemStatus() {
    const memory = await this.getMemoryUsage();
    const chromeCount = await this.getChromeProcesses();
    const nodeCount = await this.getNodeProcesses();
    const disk = await this.getDiskSpace();
    
    console.log('📊 系统状态监控:');
    console.log(`   💾 内存使用: ${memory.usagePercent}% (${Math.round(memory.used/1024)}MB / ${Math.round(memory.total/1024)}MB)`);
    console.log(`   🌐 Chrome进程: ${chromeCount}个`);
    console.log(`   📦 Node.js进程: ${nodeCount}个`);
    console.log(`   💿 磁盘使用: ${disk.usagePercent}%`);
    
    // 检查异常情况
    if (memory.usagePercent > 90) {
      console.log('⚠️ 警告: 内存使用率过高!');
    }
    if (chromeCount === 0) {
      console.log('⚠️ 警告: 未检测到Chrome进程!');
    }
    if (nodeCount === 0) {
      console.log('⚠️ 警告: 未检测到Node.js进程!');
    }
    if (disk.usagePercent > 95) {
      console.log('⚠️ 警告: 磁盘空间不足!');
    }
  }

  // 开始监控
  startMonitoring() {
    if (this.monitoring) return;
    this.monitoring = true;
    console.log('🔍 启动系统监控...');
    
    this.monitorInterval = setInterval(async () => {
      await this.logSystemStatus();
    }, this.checkInterval);
  }

  // 停止监控
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitoring = false;
      console.log('🔍 停止系统监控');
    }
  }
}

// 创建监控实例
const systemMonitor = new SystemMonitor();

console.log('USER:', process.env.EW_USER);
console.log('PASS:', process.env.EW_PASS);

// 自动检测Chrome路径
const chromePath = findChromePath();
console.log(`🔍 使用Chrome路径: ${chromePath}`);
// Chrome driver路径
const chromeDriverPath = path.join(process.cwd(), '..', 'chromedriver.exe');
const DOWNLOAD_DIR = path.join(process.cwd(), '..', '..', 'downloads');

const CREDS = {
  user: process.env.EW_USER,
  pass: process.env.EW_PASS,
};

// 运行状态
let isRunning = false;
let shouldStop = false;

// 主要任务函数
async function mainTask() {
  if (isRunning) {
    console.log('⚠️ 上一次任务还在运行中，跳过本次执行');
    return;
  }
  
  isRunning = true;
  const startTime = new Date();
  console.log(`\n🚀 开始执行任务 - ${startTime.toLocaleString()}`);
  
  let browser = null;
  let page = null;
  
  try {
    const { browser: connectedBrowser, page: connectedPage } = await connect({
      headless: false,
      turnstile: true,
      customConfig: {
        chromePath,
        userDataDir: path.join(process.cwd(), 'chrome-data'),
        executablePath: chromeDriverPath,
      },
      connectOption: {
        defaultViewport: null,
      },
    });
    
    browser = connectedBrowser;
    page = connectedPage;

    // 设置Chrome下载路径
    try {
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: DOWNLOAD_DIR
      });
      console.log('📁 设置下载路径:', DOWNLOAD_DIR);
    } catch (error) {
      console.log('⚠️ 设置下载路径失败:', error.message);
    }

    // 先访问 class-list.aspx
    console.log('🧭 正在前往 class-list.aspx...');
    try {
      await page.goto('https://www.enrollware.com/admin/class-list.aspx', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 // 增加到60秒
      });
    } catch (error) {
      console.log('⚠️ 页面加载超时，尝试继续执行...');
    }

    // 判断是否需要登录
    const needLogin = await page.$('input[name="username"]') !== null;
    if (needLogin) {
      console.log('⌨️ 需要登录，输入用户名和密码...');
      // 优先模拟粘贴输入用户名
      await page.click('input[name="username"]');
      await page.evaluate((val) => {
        const input = document.querySelector('input[name="username"]');
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('click'));
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, CREDS.user);
      // 检查粘贴后内容是否正确，否则用逐字符输入兜底
      let usernameValue = await page.$eval('input[name="username"]', el => el.value);
      if (usernameValue !== CREDS.user) {
        await page.click('input[name="username"]');
        await page.evaluate(() => { document.querySelector('input[name="username"]').value = ''; });
        for (let i = 0; i < CREDS.user.length; i++) {
          await page.keyboard.type(CREDS.user[i], { delay: 120 });
          await new Promise(r => setTimeout(r, 150));
        }
      }
      // 优先模拟粘贴输入密码
      await page.click('input[name="password"]');
      await page.evaluate((val) => {
        const input = document.querySelector('input[name="password"]');
        input.value = '';
        input.focus();
        input.dispatchEvent(new Event('focus'));
        input.dispatchEvent(new Event('click'));
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, CREDS.pass);
      // 检查粘贴后内容是否正确，否则用逐字符输入兜底
      let passwordValue = await page.$eval('input[name="password"]', el => el.value);
      if (passwordValue !== CREDS.pass) {
        await page.click('input[name="password"]');
        await page.evaluate(() => { document.querySelector('input[name="password"]').value = ''; });
        for (let i = 0; i < CREDS.pass.length; i++) {
          await page.keyboard.type(CREDS.pass[i], { delay: 150 });
          await new Promise(r => setTimeout(r, 180));
        }
      }
      // 输入完后点击页面空白处，触发失焦
      await page.mouse.click(10, 10);
      console.log('⏳ 等待一下再点击登录...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔘 点击登录按钮...');
      await page.realClick('input[type="submit"]');
      console.log('🛡️ 等待跳转页面...');
      await page.waitForNavigation({ timeout: 60_000, waitUntil: 'domcontentloaded' });
      const currentURL = page.url();
      console.log('📍 当前页面URL:', currentURL);
      if (!currentURL.includes('class-list.aspx')) {
        console.log('❌ 登录失败，停止执行');
        return;
      }
      console.log('✅ 登录成功!');
    } else {
      console.log('✅ 已登录，无需再次登录!');
    }

    console.log('📄 正在跳转到导出页面...');
    try {
      await page.goto('https://www.enrollware.com/admin/student-export.aspx', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 // 增加到60秒
      });
    } catch (error) {
      console.log('⚠️ 导出页面加载超时，尝试继续执行...');
    }
    
    // 等待页面完全加载
    console.log('⏳ 等待页面完全加载...');
    await new Promise(r => setTimeout(r, 3000));

    // 等待页面关键元素渲染出来
    await page.waitForSelector('select[name="ctl00$mainContent$regdateType"]', { visible: true, timeout: 15000 });
    await page.waitForSelector('select[name="ctl00$mainContent$dateType"]', { visible: true, timeout: 15000 });

    // 自动选择下拉框和填写日期
    // 日期变量只声明一次
    const today = new Date();
    const endDate = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
    const startObj = new Date();
    startObj.setDate(today.getDate() - 180); // 改为6个月前（180天）
    const startDate = `${startObj.getMonth()+1}/${startObj.getDate()}/${startObj.getFullYear()}`;

    // 1. 选择第一个下拉框为 Registration Dates
    await page.select('select[name="ctl00$mainContent$regdateType"]', 'regDate');
    try {
      await page.evaluate(() => {
        document.querySelector('select[name="ctl00$mainContent$regdateType"]').dispatchEvent(new Event('change', { bubbles: true }));
      });
    } catch (error) {
      console.log('⚠️ 触发第一个下拉框change事件失败，继续执行...');
    }
    await new Promise(r => setTimeout(r, 800));

    // 2. 选择第二个下拉框为 Custom Range
    await page.select('select[name="ctl00$mainContent$dateType"]', 'Custom Range');
    try {
      await page.evaluate(() => {
        document.querySelector('select[name="ctl00$mainContent$dateType"]').dispatchEvent(new Event('change', { bubbles: true }));
      });
    } catch (error) {
      console.log('⚠️ 触发第二个下拉框change事件失败，继续执行...');
    }
    await new Promise(r => setTimeout(r, 1200));

    // 打印所有input的name，便于调试
    try {
      const allInputs = await page.$$eval('input', xs => xs.map(x => x.getAttribute('name')));
      console.log('所有input的name:', allInputs);
    } catch (error) {
      console.log('⚠️ 获取input元素时出错，继续执行...');
    }

    // 再等待日期输入框出现
    await page.waitForSelector('input[name="ctl00$mainContent$sdate"]', { visible: true, timeout: 10000 });
    await page.waitForSelector('input[name="ctl00$mainContent$edate"]', { visible: true, timeout: 10000 });
    // 3. 填写日期
    try {
      await page.$eval('input[name="ctl00$mainContent$sdate"]', (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, startDate);
      await page.$eval('input[name="ctl00$mainContent$edate"]', (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, endDate);
    } catch (error) {
      console.log('⚠️ 填写日期失败，继续执行...');
    }
    // 4. 点击 Go 按钮
    await page.click('input[name="ctl00$mainContent$srchButton2"]');

    try {
      const options = await page.$$eval('select option', (opts) =>
        opts.map((opt) => ({ value: opt.value, text: opt.textContent }))
      );
      console.log('📌 下拉框选项:', options);
    } catch (error) {
      console.log('⚠️ 获取下拉框选项时出错，继续执行...');
    }

    console.log('📆 选择 "custom range"...');
    await page.select('select', 'custom range');

    // 清理旧下载文件记录
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
    const beforeFiles = new Set(fssync.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.xlsx')));
    console.log('📁 下载目录中的现有Excel文件:', Array.from(beforeFiles));

    // 如果已经有Excel文件，直接处理
    if (beforeFiles.size > 0) {
      const existingFile = Array.from(beforeFiles)[0];
      console.log('✅ 发现现有文件：', existingFile);
      
      // 处理现有文件
      const downloadedFile = path.join(DOWNLOAD_DIR, existingFile);
      console.log('📄 文件路径:', downloadedFile);
      
      try {
        // 初始化Google Drive上传器
        console.log('🚀 初始化Google Drive上传器...');
        const uploader = new GoogleDriveUploader();
        
        // 认证
        const isAuthenticated = await uploader.authenticate();
        if (!isAuthenticated) {
          console.log('❌ 认证失败，请手动完成授权流程');
          console.log('请访问以下URL进行授权:');
          console.log(uploader.getAuthUrl());
          console.log('然后运行以下命令完成授权:');
          console.log('node auth-helper.js [授权码]');
        } else {
          // 初始化API客户端
          await uploader.initialize();
          
          // 处理文件（上传到Drive，更新Sheets，删除文件）
          await uploader.processFile(downloadedFile);
          
          console.log('🎉 文件处理完成！');
        }
      } catch (error) {
        console.error('❌ 文件处理失败:', error.message);
        console.log('程序将停止执行');
        return;
      }
    } else {
      // 如果没有现有文件，等待新文件下载
      console.log('⏳ 等待文件下载...');
      const maxWait = 300000; // 增加到5分钟 (300秒)
      const interval = 1000; // 1秒检查一次
      const start = Date.now();

      while (Date.now() - start < maxWait) {
        const nowFiles = new Set(fssync.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.xlsx')));
        const newFiles = [...nowFiles].filter((f) => !beforeFiles.has(f));
        
        if (newFiles.length > 0) {
          console.log('✅ 下载成功：', newFiles[0]);
          
          // 处理下载的文件
          const downloadedFile = path.join(DOWNLOAD_DIR, newFiles[0]);
          console.log('📄 文件路径:', downloadedFile);
          
          try {
            // 初始化Google Drive上传器
            console.log('🚀 初始化Google Drive上传器...');
            const uploader = new GoogleDriveUploader();
            
            // 认证
            const isAuthenticated = await uploader.authenticate();
            if (!isAuthenticated) {
              console.log('❌ 认证失败，请手动完成授权流程');
              console.log('请访问以下URL进行授权:');
              console.log(uploader.getAuthUrl());
              console.log('然后运行以下命令完成授权:');
              console.log('node auth-helper.js [授权码]');
              break;
            }
            
            // 初始化API客户端
            await uploader.initialize();
            
            // 处理文件（上传到Drive，更新Sheets，删除文件）
            await uploader.processFile(downloadedFile);
            
            console.log('🎉 文件处理完成！');
          } catch (error) {
            console.error('❌ 文件处理失败:', error.message);
            console.log('程序将停止执行');
            return;
          }
          
          break;
        }
        
        // 显示等待进度
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const totalSeconds = Math.floor(maxWait / 1000);
        const elapsedMinutes = Math.floor(elapsed / 60);
        const elapsedSeconds = elapsed % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalSecondsRemaining = totalSeconds % 60;
        console.log(`⏳ 等待文件下载... (${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}/${totalMinutes}:${totalSecondsRemaining.toString().padStart(2, '0')})`);
        
        await new Promise((r) => setTimeout(r, interval));
      }

      // 如果没有检测到新文件，但目录中有文件，尝试处理现有文件
      if (Date.now() - start >= maxWait) {
        const currentFiles = fssync.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.xlsx'));
        if (currentFiles.length > 0) {
          console.log('⚠️ 未检测到新文件，但目录中有Excel文件，尝试处理现有文件...');
          const existingFile = path.join(DOWNLOAD_DIR, currentFiles[0]);
          console.log('📄 文件路径:', existingFile);
          
          try {
            // 初始化Google Drive上传器
            console.log('🚀 初始化Google Drive上传器...');
            const uploader = new GoogleDriveUploader();
            
            // 认证
            const isAuthenticated = await uploader.authenticate();
            if (!isAuthenticated) {
              console.log('❌ 认证失败，请手动完成授权流程');
              console.log('请访问以下URL进行授权:');
              console.log(uploader.getAuthUrl());
              console.log('然后运行以下命令完成授权:');
              console.log('node auth-helper.js [授权码]');
            } else {
              // 初始化API客户端
              await uploader.initialize();
              
              // 处理文件（上传到Drive，更新Sheets，删除文件）
              await uploader.processFile(existingFile);
              
              console.log('🎉 文件处理完成！');
            }
          } catch (error) {
            console.error('❌ 文件处理失败:', error.message);
            console.log('程序将停止执行');
            return;
          }
        } else {
          console.log('❌ 等待超时，未检测到任何Excel文件');
        }
      }
    }

    console.log('🎉 任务执行完成。');
  } catch (error) {
    console.error('❌ 任务执行失败:', error.message);
  } finally {
    // 关闭浏览器
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.log('⚠️ 关闭浏览器时出错:', error.message);
      }
    }
    
    isRunning = false;
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`⏱️ 任务耗时: ${duration}秒`);
  }
}

// 主循环函数
async function runLoop() {
  console.log('🤖 Enrollware机器人启动 - 每10分钟执行一次');
  console.log('💡 按 Ctrl+C 停止程序');
  
  // 启动系统监控
  systemMonitor.startMonitoring();
  
  // 进程保护：定期发送心跳信号
  let heartbeatCount = 0;
  const heartbeatInterval = setInterval(() => {
    heartbeatCount++;
    console.log(`💓 进程心跳信号 #${heartbeatCount} - ${new Date().toLocaleString()}`);
  }, 60000); // 每分钟发送一次心跳
  
  while (!shouldStop) {
    try {
      console.log('\n🔍 执行前系统状态检查...');
      await systemMonitor.logSystemStatus();
      
      await mainTask();
      
      if (shouldStop) {
        console.log('🛑 收到停止信号，程序退出');
        break;
      }
      
      console.log('⏳ 等待10分钟后执行下一次任务...');
      console.log('⏰ 下次执行时间:', new Date(Date.now() + 10 * 60 * 1000).toLocaleString());
      
      // 等待10分钟，但每30秒检查一次是否需要停止和系统状态
      for (let i = 0; i < 20; i++) {
        if (shouldStop) break;
        
        // 每30秒检查一次系统状态
        if (i % 2 === 0) { // 每60秒检查一次
          console.log(`\n🔍 等待期间系统状态检查 (${i/2 + 1}/10)...`);
          await systemMonitor.logSystemStatus();
          
          // 检查Chrome进程状态
          const chromeCount = await systemMonitor.getChromeProcesses();
          if (chromeCount === 0) {
            console.log('⚠️ 警告: Chrome进程丢失，尝试重新启动...');
            // 这里可以添加重新启动Chrome的逻辑
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30秒
      }
      
    } catch (error) {
      console.error('❌ 循环执行出错:', error.message);
      console.error('📋 错误堆栈:', error.stack);
      
      // 记录错误时的系统状态
      console.log('🔍 错误发生时的系统状态:');
      await systemMonitor.logSystemStatus();
      
      console.log('⏳ 5分钟后重试...');
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }
  
  // 清理资源
  clearInterval(heartbeatInterval);
  systemMonitor.stopMonitoring();
}

// 信号监听
process.on('SIGINT', () => {
  console.log('\n🛑 收到SIGINT停止信号，正在优雅退出...');
  console.log('📋 信号来源: Ctrl+C 或 kill -2');
  shouldStop = true;
  systemMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到SIGTERM终止信号，正在优雅退出...');
  console.log('📋 信号来源: kill 命令或系统终止');
  shouldStop = true;
  systemMonitor.stopMonitoring();
  process.exit(0);
});

process.on('SIGBREAK', () => {
  console.log('\n🛑 收到SIGBREAK中断信号，正在优雅退出...');
  console.log('📋 信号来源: Ctrl+Break 或系统中断');
  shouldStop = true;
  systemMonitor.stopMonitoring();
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.log('\n💥 捕获到未处理的异常:');
  console.error('❌ 错误信息:', error.message);
  console.error('📋 错误堆栈:', error.stack);
  console.log('🔍 异常发生时的系统状态:');
  systemMonitor.logSystemStatus().then(() => {
    console.log('🛑 程序因异常退出');
    systemMonitor.stopMonitoring();
    process.exit(1);
  });
});

// 未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.log('\n💥 捕获到未处理的Promise拒绝:');
  console.error('❌ 拒绝原因:', reason);
  console.error('📋 Promise对象:', promise);
  console.log('🔍 拒绝发生时的系统状态:');
  systemMonitor.logSystemStatus().then(() => {
    console.log('🛑 程序因Promise拒绝退出');
    systemMonitor.stopMonitoring();
    process.exit(1);
  });
});

// 启动程序
runLoop().catch(error => {
  console.error('❌ 程序启动失败:', error.message);
  process.exit(1);
});
