const db = require('../config/db');
const logger = require('../log/logger');
const { getWechatUserInfo } = require('../services/Wxapi');

class UserController {
  // 用户登陆
  static async login(req, res) {
    try {
      const { code, encryptedData, iv } = req.body;
      const userData = getWechatUserInfo(code, encryptedData, iv);
      logger.info('get user data: ', { userData })
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}

module.exports = UserController;