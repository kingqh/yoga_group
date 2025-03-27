// backend/models/User.js
const db = require('../config/db');

class User {

  // 根据openid获取用户信息
  static async getUserByOpenid(openid) {
    try {
      const sql = `
        SELECT 
          *
        FROM user 
        WHERE openid = ?
      `;
      const users = await db.query(sql, [openid]);
      return users[0] || null;
    } catch (err) {
      throw new Error('用户查询失败');
    }
  }

  // 根据openid获取用户信息
  static async getUserByOpenidWithConnection(openid, connection) {
    try {
      const sql = `
        SELECT 
          *
        FROM users 
        WHERE openid = ?
      `;
      const users = await connection.query(sql, [openid]);
      return users[0] || null;
    } catch (err) {
      throw new Error('用户查询失败');
    }
  }

  // 创建微信用户
  static async createUserWithConnection(openid, nickname, avatar, connection) {
    try {
      const [result] = await connection.query(`
      INSERT INTO users SET 
        openid = ?,
        unionid = ?,
        nickname = ?,
        avatar = ?,
        created_at = NOW(),
        updated_at = NOW(),
        login_number = 1
    `, [openid, '', nickname, avatar])
      return result.insertId;
    } catch (err) {
      throw new Error('用户创建失败');
    }
  }

  // 获取进行中的拼团列表
  static async findUsers() {
    const rows = await db.query(`
      SELECT 
        *
      FROM users 
    `);
    return rows;
  }

  // 记录登陆次数
  static async incrUserLoginNum(openid) {
    await db.query(`
      UPDATE users 
      SET login_number = login_number + 1 
      WHERE openid = ?
    `, [openid]);
  }  

}

module.exports = User;