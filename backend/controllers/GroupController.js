const Group = require('../models/Group');
const Order = require('../models/Order');
const Activity = require('../models/Activity');

class GroupController {
  // 创建新拼团
  static async createGroup(req, res) {
    try {
      const { activityId } = req.body;
      const activity = await Activity.findById(activityId);
      
      if (!activity || activity.stock <= 0) {
        return res.status(400).json({ code: 400, msg: '活动不可用' });
      }

      const group = await Group.create({
        activityId,
        creator: req.user.openid,
        expireTime: new Date(Date.now() + activity.duration * 3600 * 1000)
      });

      res.json({ code: 200, data: group });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 加入拼团
  static async joinGroup(req, res) {
    try {
      const { id: groupId } = req.params;
      const { openid } = req.user;
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ code: 404, msg: '拼团不存在' });
      }

      const members = JSON.parse(group.members);
      if (members.includes(openid)) {
        return res.status(400).json({ code: 400, msg: '已经参团了' });
      }
      if (members.length >= group.groupSize) {
        return res.status(400).json({ code: 400, msg: '团已满了' });
      }

      // 事务操作
      await transaction(async (connection) => {
        // 扣减库存
        const stockUpdated = await Activity.decreaseStock(
          group.activityId, 
          connection
        );
        if (!stockUpdated) throw new Error('STOCK_NOT_ENOUGH');

        // 添加成员
        await Group.addMemberWithConnection(
          groupId, 
          openid, 
          connection
        );

        // 创建订单记录
        await Order.createWithConnection(
          Order.generateOrderId(),
          openid,
          groupId,
          group.price,
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
}

module.exports = GroupController;
