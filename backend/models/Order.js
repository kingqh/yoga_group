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
    const rows = await db.query(
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

    // 获取所有订单
  static async findAllOrders() {
    const rows = await db.query(
      'SELECT * FROM orders'
    );
    return rows || null;
  }

  // 根据openid获取订单
  static async findOrderByOpenId(openid) {
    const rows = await db.query(`
      SELECT 
        od.*,
        ga.id AS activity_id,
        ga.title AS activity_title,
        ga.group_size,
        ug.id AS group_id,
        ug.creator_openid AS group_creator_openid,
        ug.members AS group_expire_time,
        ug.expire_time AS group_expire_time,
        ug.created_at AS group_created_at
      FROM orders od
      JOIN user_group ug ON ug.id = od.group_id
      JOIN group_activity ga ON ug.activity_id = ga.id
      WHERE openid = ?
    `, [openid]);
    return rows[0] || null;
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
