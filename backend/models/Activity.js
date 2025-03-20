// backend/models/Activity.js
const db = require('../config/db');
const { formatDate } = require('../utils/helper');

class Activity {
  // 获取所有有效活动
  static async findActive() {
    const [rows] = await db.query(`
      SELECT * FROM group_activity 
      WHERE start_time <= NOW() 
        AND end_time >= NOW()
      ORDER BY start_time DESC
    `);
    return rows;
  }

  // 根据ID查询活动
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM group_activity WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // 减少库存
  static async decreaseStock(id) {
    const [result] = await db.query(`
      UPDATE group_activity 
      SET stock = stock - 1 
      WHERE id = ? AND stock > 0
    `, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Activity;
