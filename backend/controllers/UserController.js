const db = require('../config/db');
const logger = require('../log/logger');
const { getWechatUserInfo, code2Session } = require('../services/Wxapi');

class UserController {
  // 解密用户详细信息
  static async login(req, res) {
    try {
      const { openid, session_key, encryptedData, iv } = req.body;
      logger.info('get user input openid: ', { openid });
      logger.info('get user input encryptedData: ', { encryptedData });
      const userData = await getWechatUserInfo(openid, session_key, encryptedData, iv);
      logger.info('get user data: ', { userData });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // code to openid
  static async code2id(req, res) {
    try {
      const { code } = req.body;
      const { openid, session_key } = await code2Session(code);
      logger.info('code2id openid: ', { openid });
      logger.info('code2id session_key: ', { session_key });
      res.json({ code: 200, data:  { openid, session_key } });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}

module.exports = UserController;