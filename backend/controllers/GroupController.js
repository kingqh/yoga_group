const Group = require('../models/Group');
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

  // 获取可参与拼团列表
  static async listActiveGroups(req, res) {
    try {
      const groups = await Group.findActive();
      res.json({ code: 200, data: groups });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}

module.exports = GroupController;
