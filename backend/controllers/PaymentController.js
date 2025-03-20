const PaymentService = require('../services/PaymentService');

class PaymentController {
  // 创建预支付订单
  static async createPrepayOrder(req, res) {
    try {
      const { groupId } = req.body;
      const paymentParams = await PaymentService.createOrder({
        openid: req.user.openid,
        groupId
      });
      
      res.json({ code: 200, data: paymentParams });
    } catch (err) {
      res.status(500).json({ code: 500, msg: err.message });
    }
  }

  // 处理支付回调
  static async handlePaymentNotify(req, res) {
    try {
      const result = await PaymentService.handleNotify(req.body);
      if (result) {
        res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>');
      }
    } catch (err) {
      res.status(500).send('<xml><return_code><![CDATA[FAIL]]></return_code></xml>');
    }
  }
}

module.exports = PaymentController;
