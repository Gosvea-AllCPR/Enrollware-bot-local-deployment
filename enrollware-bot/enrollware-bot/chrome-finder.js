// chrome-finder.js - Chrome路径自动检测工具
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * 自动检测Chrome浏览器安装路径
 * @returns {string} Chrome可执行文件路径
 */
export function findChromePath() {
  const possiblePaths = [
    // 64位系统常见路径
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    // 用户目录安装
    path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    // 其他可能路径
    'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe'
  ];

  // 检查每个可能的路径
  for (const chromePath of possiblePaths) {
    if (fs.existsSync(chromePath)) {
      console.log(`✅ 找到Chrome: ${chromePath}`);
      return chromePath;
    }
  }

  // 如果没找到，尝试通过注册表查找
  try {
    const result = execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve', { encoding: 'utf8' });
    const match = result.match(/REG_SZ\s+(.+)/);
    if (match && match[1]) {
      const regPath = match[1].trim();
      if (fs.existsSync(regPath)) {
        console.log(`✅ 通过注册表找到Chrome: ${regPath}`);
        return regPath;
      }
    }
  } catch (error) {
    console.log('⚠️ 无法通过注册表查找Chrome路径');
  }

  // 最后尝试通过where命令查找
  try {
    const result = execSync('where chrome', { encoding: 'utf8' });
    const chromePath = result.trim().split('\n')[0];
    if (chromePath && fs.existsSync(chromePath)) {
      console.log(`✅ 通过PATH找到Chrome: ${chromePath}`);
      return chromePath;
    }
  } catch (error) {
    console.log('⚠️ 无法通过PATH查找Chrome');
  }

  // 如果都找不到，返回默认路径
  console.log('⚠️ 未找到Chrome，使用默认路径');
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

/**
 * 检查Chrome版本
 * @param {string} chromePath Chrome路径
 * @returns {string} Chrome版本信息
 */
export function getChromeVersion(chromePath) {
  try {
    const result = execSync(`"${chromePath}" --version`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    return '无法获取版本信息';
  }
}

/**
 * 验证Chrome路径是否有效
 * @param {string} chromePath Chrome路径
 * @returns {boolean} 是否有效
 */
export function validateChromePath(chromePath) {
  if (!fs.existsSync(chromePath)) {
    console.log(`❌ Chrome路径不存在: ${chromePath}`);
    return false;
  }

  try {
    const version = getChromeVersion(chromePath);
    console.log(`✅ Chrome版本: ${version}`);
    return true;
  } catch (error) {
    console.log(`❌ Chrome路径无效: ${error.message}`);
    return false;
  }
}

// 如果直接运行此文件，则执行检测
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔍 正在检测Chrome安装路径...');
  const chromePath = findChromePath();
  console.log(`📍 检测到的Chrome路径: ${chromePath}`);
  
  if (validateChromePath(chromePath)) {
    console.log('✅ Chrome路径验证成功！');
  } else {
    console.log('❌ Chrome路径验证失败！');
  }
}
