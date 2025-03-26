const db = require('../config/db');
const logger = require('../log/logger');
const { getWechatUserInfo, code2Session } = require('../services/Wxapi');

class UserController {
  // 解密用户详细信息
  static async login(req, res) {
    try {
      const { openid, encryptedData, iv } = req.body;
      const userData = await getWechatUserInfo(openid, encryptedData, iv);
      logger.info('get user data: ', { userData })
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // code to openid
  static async code2id(req, res) {
    try {
      const { code } = req.body;
      const res = await code2Session(code);
      res.json({ code: 200, data: res });
      logger.info('get open id data: ', { res });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}

module.exports = UserController;