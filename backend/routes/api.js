const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/GroupController');
const ActivityController = require('../controllers/ActivityController');
const PaymentController = require('../controllers/PaymentController');
const UserController = require('../controllers/UserController');

// 跨域支持（开发环境）
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  next();
});

// 活动相关接口
router.get('/activities', ActivityController.listActiveActivities); // 获取有效活动列表
router.get('/activities/:id', ActivityController.getActivityDetail); // 获取活动详情

router.post('/activities/viewcount/:id', ActivityController.viewCount); // 浏览计数
router.post('/activities/registercount/:id', ActivityController.registerCount); // 报名计数
router.post('/activities/sharecount/:id', ActivityController.shareCount); // 分享计数

// 拼团相关接口
router.post('/groups/:actid/:openid/create', GroupController.createGroup); // 创建新拼团
router.get('/groups', GroupController.listActiveGroups); // 获取可参与拼团列表
router.get('/groups/:id', GroupController.getGroupDetail); // 获取拼团详情
router.post('/groups/:creatoropenid/:openid/join', GroupController.joinGroup); // 加入拼团

router.get('/orders', GroupController.listOrders); // 获取所有订单
router.get('/orders/:openid', GroupController.getOrderByOpenId); // 获取个人订单

// 用户接口
router.get('/users', UserController.listUsers);
router.get('/users/:openid', UserController.getUserDetail);
router.post('/users/login', UserController.login);
router.post('/users/code2id', UserController.code2id);

// 支付相关接口
router.post('/payment/create', PaymentController.createPayment); // 创建支付订单
router.post('/payment/notify', PaymentController.handleNotify); // 支付回调


// 错误处理中间件
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    msg: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = router;
