const Activity = require('../models/Activity');

class ActivityController {
  // 获取有效活动列表
  static async listActiveActivities(req, res) {
    try {
      const activities = await Activity.findActive();
      res.json({ code: 200, data: activities });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 获取活动详情
  static async getActivityDetail(req, res) {
    try {
      const activity = await Activity.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({ code: 404, msg: '活动不存在' });
      }
      res.json({ code: 200, data: activity });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }
}



module.exports = ActivityController;
