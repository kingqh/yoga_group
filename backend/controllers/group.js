const db = require('../config/db');

// 创建拼团
exports.createGroup = async (req, res) => {
  try {
    const { activityId, openid } = req.body;
    
    // 获取活动信息
    const [activity] = await db.query(`
      SELECT * FROM group_activity 
      WHERE id=? AND stock>0 
      AND NOW() BETWEEN start_time AND end_time
    `, [activityId]);

    if(!activity) return res.status(400).json({code:400, msg:'活动不可用'});

    // 创建拼团记录
    const expireTime = new Date(Date.now() + activity.duration * 3600 * 1000);
    const [result] = await db.query(`
      INSERT INTO user_group SET 
      activity_id=?, creator_openid=?, 
      members=?, expire_time=?
    `, [
      activityId,
      openid,
      JSON.stringify([openid]),
      expireTime
    ]);

    res.json({
      code: 200,
      data: { groupId: result.insertId }
    });
    
  } catch (err) {
    res.status(500).json({code:500, msg:err.message});
  }
}
