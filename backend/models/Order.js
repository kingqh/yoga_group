// backend/models/Order.js
const db = require('../config/db');

class Order {
  // 创建订单
  static async create(orderId, openid, groupId, amount) {
    await db.query(`
      INSERT INTO orders SET 
        order_id = ?,
        openid = ?,
        group_id = ?,
        amount = ?,
        status = 0
    `, [orderId, openid, groupId, amount]);
  }

  // 根据订单号查询
  static async findByOrderId(orderId) {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );
    return rows[0] || null;
  }

  // 更新订单状态
  static async updateStatus(orderId, status) {
    await db.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );
  }

    /**
   * 创建订单（事务安全版本）
   * @param {string} orderId - 订单号
   * @param {string} openid - 用户openid
   * @param {number} groupId - 拼团ID
   * @param {number} amount - 支付金额
   * @param {object} connection - 数据库连接对象
   * @returns {Promise<void>}
   */
  static async createWithConnection(orderId, openid, groupId, amount, connection) {
    try {
      await connection.query(`
      INSERT INTO orders SET 
        order_id = ?,
        openid = ?,
        group_id = ?,
        amount = ?,
        status = 1,
        created_at = NOW()
    `, [orderId, openid, groupId, amount])

    } catch (err) {
      console.error('订单创建失败:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('ORDER_DUPLICATE');
      }
      throw new Error('ORDER_CREATE_FAILED');
    }
  }

  /**
   * 生成唯一订单号（示例实现）
   * @returns {string}
   */
  static generateOrderId() {
    const date = new Date();
    const timePart = [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
      date.getHours().toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
      date.getSeconds().toString().padStart(2, '0')
    ].join('');
    
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `G${timePart}${randomPart}`;
  }
}

module.exports = Order;
