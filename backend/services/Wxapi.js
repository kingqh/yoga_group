// services/wxapi.js
const axios = require('axios');
const crypto = require('crypto');

/**
 * 获取微信用户信息（openid + 解密用户数据）
 */
async function getWechatUserInfo(code, encryptedData, iv) {
  try {
    // 1. 获取session_key和openid
    const sessionInfo = await code2Session(code);
    
    // 2. 解密用户信息（如果有加密数据）
    let userInfo = { openid: sessionInfo.openid };
    
    if (encryptedData && iv) {
      const decryptedData = decryptWxData(
        encryptedData,
        iv,
        sessionInfo.session_key
      );
      userInfo = { ...userInfo, ...decryptedData };
    }

    return userInfo;
  } catch (err) {
    throw new Error(`微信信息获取失败: ${err.message}`);
  }
}

/**
 * 微信登录凭证校验（code2Session）
 */
async function code2Session(code) {
  const params = {
    appid: process.env.WX_APPID,
    secret: process.env.WX_SECRET,
    js_code: code,
    grant_type: 'authorization_code'
  };

  const { data } = await axios.get(
    'https://api.weixin.qq.com/sns/jscode2session',
    { params }
  );

  if (data.errcode) {
    throw handleWxError(data.errcode);
  }

  return {
    openid: data.openid,
    unionid: data.unionid,
    session_key: data.session_key
  };
}

/**
 * 解密微信加密数据
 */
function decryptWxData(encryptedData, iv, sessionKey) {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(sessionKey, 'base64'),
      Buffer.from(iv, 'base64')
    );
    
    let decoded = decipher.update(
      Buffer.from(encryptedData, 'base64'),
      'binary',
      'utf8'
    );
    decoded += decipher.final('utf8');
    
    return JSON.parse(decoded);
  } catch (err) {
    throw new Error('数据解密失败');
  }
}

/**
 * 处理微信错误码
 */
function handleWxError(errcode) {
  const errors = {
    40029: '无效的code',
    45011: 'API调用太频繁',
    40226: '高风险用户',
    '-1': '系统繁忙'
  };
  return new Error(errors[errcode] || `微信接口错误: ${errcode}`);
}

module.exports = {
  getWechatUserInfo
};