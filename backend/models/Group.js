// backend/models/Group.js
const db = require('../config/db');
const logger = require('../log/logger');

class Group {
  // 创建新拼团
  static async create(activityId, creatorOpenid, expireTime) {
    const [result] = await db.query(`
      INSERT INTO user_group SET 
        activity_id = ?,
        creator_openid = ?,
        members = JSON_ARRAY(?),
        expire_time = ?,
        status = 0,
        created_at = NOW()
    `, [activityId, creatorOpenid, creatorOpenid, expireTime]);
    
    return result.insertId;
  }

  static async createWithConnection(activityId, creatorOpenid, expireTime, connection) {
    try {
      const [result] = await connection.query(`
      INSERT INTO user_group SET 
        activity_id = ?,
        creator_openid = ?,
        members = JSON_ARRAY(?),
        expire_time = ?,
        status = 0,
        created_at = NOW()
    `, [activityId, creatorOpenid, creatorOpenid, expireTime]);
      logger.info('[GROUP] create res: ', { result });
      return result.insertId;
    } catch (err) {
      console.error('创建新拼团失败:', err);
      logger.error('[GROUP] create error: ', { err });
      throw new Error('GROUP_CREATE_FAILED');
    }
  }

  // 获取进行中的拼团列表
  static async findActive() {
    const rows = await db.query(`
      SELECT 
        ug.*, 
        ga.title,
        ga.price,
        ga.group_size AS groupSize,
        JSON_LENGTH(ug.members) AS joined
      FROM user_group ug
      JOIN group_activity ga ON ug.activity_id = ga.id
    `);
    return rows;
  }

  // 获取拼团详情
  static async findById(id) {
    const rows = await db.query(`
      SELECT 
        ug.*,
        ga.title,
        ga.price,
        ga.group_size
      FROM user_group ug
      JOIN group_activity ga ON ug.activity_id = ga.id
      WHERE ug.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByIdWithConnection(id, connection) {
    try {
        const rows = await connection.query(`
        SELECT 
          ug.*,
          ga.title,
          ga.price,
          ga.group_size
        FROM user_group ug
        JOIN group_activity ga ON ug.activity_id = ga.id
        WHERE ug.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (err) {
      console.error('添加成员失败:', err);
      throw new Error('FIND_GROUP_FAILED');
    }
  
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

   /**
   * 添加成员（事务安全版本）
   * @param {number} id - 拼团ID
   * @param {string} openid - 用户openid
   * @param {object} connection - 数据库连接对象
   * @returns {Promise<boolean>} 是否添加成功
   */
  static async addMemberWithConnection(id, openid, connection) {
    try {
      // 使用JSON_SEARCH防止重复添加
      const [result] = await connection.query(
        `UPDATE user_group 
          SET 
            members = JSON_ARRAY_APPEND(
              members,
              '$',
              ?)
          WHERE id = ?
            AND JSON_SEARCH(members, 'one', ?) IS NULL
          `,
        [openid, id, openid]
      );

      if (result.affectedRows === 0) {
        throw new Error('ADD_MEMBER_FAILED');
      }
      return true;

    } catch (err) {
      console.error('添加成员失败:', err);
      throw new Error('MEMBER_UPDATE_FAILED');
    }
  }
}

module.exports = Group;
