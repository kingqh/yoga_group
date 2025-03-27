const db = require('../config/db');
const logger = require('../log/logger');
const User = require('../models/User');
const { getWechatUserInfo, code2Session } = require('../services/Wxapi');

class UserController {
  // 解密用户详细信息
  static async login(req, res) {
    try {
      const { openid, nickname, avatar } = req.body;
      logger.info('login user input openid: ', { openid });
      logger.info('login user input nickname: ', { nickname });
      logger.info('login user input avatar: ', { avatar });
      // 事务操作
      await db.transaction(async (connection) => {
        const user = await User.getUserByOpenidWithConnection(openid, connection);
        if (!user) {
          await User.createUserWithConnection(
            openid, 
            nickname, 
            avatar, 
            connection
          );
        } else {
          await User.incrUserLoginNum(openid);
        }
      });
      res.json({ code: 200, msg: '登陆成功' });
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

  // 获取所有用户
  static async listUsers(req, res) {
    try {
      const users = await User.findUsers();
      res.json({ code: 200, data: users });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取用户详情
  static async getUserDetail(req, res) {
    try {
      const user = await User.getUserByOpenid(req.params.openid);
      if (!user) {
        return res.status(404).json({ code: 404, msg: '拼团不存在' });
      }
      res.json({ code: 200, data: user });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }  

}

module.exports = UserController;