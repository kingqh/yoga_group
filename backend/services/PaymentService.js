// 在services/PaymentService.js中
const db = require('../config/db');
const Order = require('../models/Order');
const Group = require('../models/Group');

class PaymentService {
  static async handlePayment(orderId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. 更新订单状态
      await Order.updateStatus(orderId, 1);

      // 2. 添加拼团成员
      const order = await Order.findByOrderId(orderId);
      const success = await Group.addMember(order.group_id, order.openid);

      if (!success) {
        throw new Error('添加成员失败');
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}
