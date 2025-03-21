const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/GroupController');
const ActivityController = require('../controllers/ActivityController');
const PaymentController = require('../controllers/PaymentController');

// 跨域支持（开发环境）
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  next();
});

// 活动相关接口
router.get('/activities', ActivityController.listActiveActivities); // 获取有效活动列表
router.get('/activities/:id', ActivityController.getActivityDetail); // 获取活动详情

// 拼团相关接口
router.post('/groups/:actid/:openid/create', GroupController.createGroup); // 创建新拼团
router.get('/groups', GroupController.listActiveGroups); // 获取可参与拼团列表
router.get('/groups/:id', GroupController.getGroupDetail); // 获取拼团详情
router.post('/groups/:id/:openid/join', GroupController.joinGroup); // 加入拼团

// 支付相关接口
router.post('/payment/prepay', PaymentController.createPrepayOrder); // 创建支付订单
router.post('/payment/notify', PaymentController.handlePaymentNotify); // 支付回调


// 错误处理中间件
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    msg: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = router;
