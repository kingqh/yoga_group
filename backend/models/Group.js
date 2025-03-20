// backend/models/Group.js
const db = require('../config/db');

class Group {
  // 创建新拼团
  static async create(activityId, creatorOpenid, expireTime) {
    const [result] = await db.query(`
      INSERT INTO user_group SET 
        activity_id = ?,
        creator_openid = ?,
        members = JSON_ARRAY(?),
        expire_time = ?,
        status = 0
    `, [activityId, creatorOpenid, creatorOpenid, expireTime]);
    
    return result.insertId;
  }

  // 获取进行中的拼团列表
  static async findActive() {
    const [rows] = await db.query(`
      SELECT 
        ug.id, 
        ga.title,
        ga.price,
        ga.group_size AS groupSize,
        JSON_LENGTH(ug.members) AS joined,
        ug.expire_time AS expireTime
      FROM user_group ug
      JOIN group_activity ga ON ug.activity_id = ga.id
      WHERE ug.status = 0 
        AND ug.expire_time > NOW()
    `);
    return rows;
  }

  // 获取拼团详情
  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        ug.*,
        ga.title,
        ga.price,
        ga.group_size AS groupSize
      FROM user_group ug
      JOIN group_activity ga ON ug.activity_id = ga.id
      WHERE ug.id = ?
    `, [id]);
    return rows[0] || null;
  }

  // 添加成员
  static async addMember(id, openid) {
    const [result] = await db.query(`
      UPDATE user_group 
      SET members = JSON_ARRAY_APPEND(members, '$', ?)
      WHERE id = ? 
        AND JSON_SEARCH(members, 'one', ?) IS NULL
    `, [openid, id, openid]);
    
    return result.affectedRows > 0;
  }

  // 更新拼团状态
  static async updateStatus(id, status) {
    await db.query(
      'UPDATE user_group SET status = ? WHERE id = ?',
      [status, id]
    );
  }
}

module.exports = Group;
