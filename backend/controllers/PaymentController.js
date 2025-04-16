const PaymentService = require('../services/PaymentService');

class PaymentController {
  // 创建支付订单
  static async createPayment(req, res) {
    try {
      const { orderId, amount, openid, description } = req.body;
      
      const paymentParams = await PaymentService.createPayment(
        orderId,
        amount,
        openid,
        description
      );

      res.json({
        code: 200,
        data: paymentParams
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        msg: error.message
      });
    }
  }

  // 支付回调处理
  static async handleNotify(req, res) {
    try {
      const result = await PaymentService.handleNotification(req.rawBody);
      res.set('Content-Type', 'text/xml').send(result);
    } catch (error) {
      res.status(500).send(PaymentService.buildFailResponse(error.message));
    }
  }
}

module.exports = PaymentController;
