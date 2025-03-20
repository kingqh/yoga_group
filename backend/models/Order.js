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
}

module.exports = Order;
