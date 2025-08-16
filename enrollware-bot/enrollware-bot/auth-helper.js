// auth-helper.js
import GoogleDriveUploader from './google-drive-upload.js';

async function main() {
  const authCode = process.argv[2];
  
  if (!authCode) {
    console.log('❌ 请提供授权码');
    console.log('');
    console.log('使用方法:');
    console.log('1. 运行主程序: node login_and_export.js');
    console.log('2. 复制显示的授权URL到浏览器');
    console.log('3. 完成授权后复制授权码');
    console.log('4. 运行: node auth-helper.js [授权码]');
    console.log('');
    process.exit(1);
  }
  
  try {
    console.log('🔐 正在使用授权码获取令牌...');
    
    const uploader = new GoogleDriveUploader();
    await uploader.getTokenFromCode(authCode);
    
    console.log('✅ 授权成功！令牌已保存');
    console.log('现在可以运行主程序了: node login_and_export.js');
  } catch (error) {
    console.error('❌ 授权失败:', error.message);
    console.log('');
    console.log('可能的原因:');
    console.log('1. 授权码已过期（请重新获取）');
    console.log('2. 授权码格式错误');
    console.log('3. 网络连接问题');
    process.exit(1);
  }
}

main(); 