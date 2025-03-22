const db = require('../config/db');
const Group = require('../models/Group');
const Order = require('../models/Order');
const Activity = require('../models/Activity');

class GroupController {
  // 创建新拼团
  static async createGroup(req, res) {
    try {
      const { actid: activityId, openid: creatorOpenId } = req.params;
      const activity = await Activity.findById(activityId);
      
      if (!activity || activity.stock <= 0) {
        return res.status(400).json({ code: 400, msg: '活动不可用' });
      }

      const order = await Order.findOrderByOpenId(creatorOpenId);
      if (order) {
        return res.status(409).json({ code: 409, msg: '用户已创建过订单' });
      }

      // 事务操作
      await db.transaction(async (connection) => {
        // 扣减库存
        const stockUpdated = await Activity.decreaseStock(
          activityId, 
          connection
        );
        if (!stockUpdated) throw new Error('STOCK_NOT_ENOUGH');

        // 建团
        const groupId = await Group.createWithConnection(
          activityId,
          creatorOpenId,
          new Date(Date.now() + activity.duration * 3600 * 1000),
          connection
        );

        console.log('groupId is', groupId);

        // 创建订单记录
        await Order.createWithConnection(
          Order.generateOrderId(),
          creatorOpenId,
          groupId,
          activity.price,
          connection
        );
      });

      console.log('create group success');
      res.json({ code: 200, msg: '建团成功' });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 加入拼团
  static async joinGroup(req, res) {
    try {
      const { creatoropenid: creatorId, openid: userOpenId } = req.params;
      const creatorOrder = await Order.findOrderByOpenId(creatorId);
      if (!creatorOrder) {
        return res.status(404).json({ code: 404, msg: '拼团不存在' });
      }

      const order = await Order.findOrderByOpenId(userOpenId);
      if (order) {
        return res.status(409).json({ code: 409, msg: '已经参团了' });
      }

      // 事务操作
      await db.transaction(async (connection) => {
        // 扣减库存
        const stockUpdated = await Activity.decreaseStock(
          creatorOrder.activity_id, 
          connection
        );
        if (!stockUpdated) throw new Error('STOCK_NOT_ENOUGH');

        // 添加成员
        await Group.addMemberWithConnection(
          creatorOrder.group_id, 
          userOpenId, 
          connection
        );

        // 创建订单记录
        await Order.createWithConnection(
          Order.generateOrderId(),
          userOpenId,
          creatorOrder.group_id, 
          amount, 
          connection
        );
      });

      res.json({ code: 200, msg: '参团成功' });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取可参与拼团列表
  static async listActiveGroups(req, res) {
    try {
      const groups = await Group.findActive();
      res.json({ code: 200, data: groups });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取拼团详情
  static async getGroupDetail(req, res) {
    try {
      const group = await Group.findById(req.params.id);
      if (!group) {
        return res.status(404).json({ code: 404, msg: '拼团不存在' });
      }
      res.json({ code: 200, data: group });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取所有订单
  static async listOrders(req, res) {
    try {
      const orders = await Order.findAllOrders();
      res.json({ code: 200, data: orders });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取个人订单
  static async getOrderByOpenId(req, res) {
    try {
      const order = await Order.findOrderByOpenId(req.params.openid);
      if (!order) {
        return res.status(404).json({ code: 404, msg: '用户未创建订单' });
      }
      res.json({ code: 200, data: order });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}





module.exports = GroupController;
