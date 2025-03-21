// backend/models/Activity.js
const db = require('../config/db');
const logger = require('../log/logger');
const { formatDate } = require('../utils/helper');

class Activity {
  // 获取所有有效活动
  static async findActive() {
    const rows = await db.query(`
      SELECT * FROM group_activity 
      WHERE start_time <= NOW() 
        AND end_time >= NOW()
      ORDER BY start_time DESC
    `);
    logger.info('[Activity] all active activities: ', { rows });
    return rows;
  }

  // 根据ID查询活动
  static async findById(id) {
    logger.info('[Activity] findById ', { id });
    const rows = await db.query(
      'SELECT * FROM group_activity WHERE id = ?',
      [id]
    );
    logger.info('[Activity] find activity ', { rows });
    return rows[0] || null;
  }

  /**
   * 扣减库存（事务安全版本）
   * @param {number} id - 活动ID
   * @param {object} connection - 数据库连接对象
   * @returns {Promise<boolean>} 是否扣减成功
   */
   static async decreaseStock(id, connection) {
    try {
      const [result] = await connection.query(
        `UPDATE group_activity 
         SET stock = stock - 1 
         WHERE id = ? AND stock > 0
         AND start_time <= NOW() 
         AND end_time >= NOW()`,
        [id]
      );
      
      // affectedRows > 0 表示成功扣减
      return result.affectedRows > 0;
      
    } catch (err) {
      console.error('库存扣减失败:', err);
      throw new Error('STOCK_UPDATE_FAILED');
    }
  }
}

module.exports = Activity;
