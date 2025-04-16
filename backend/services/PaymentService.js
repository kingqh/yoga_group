// 在services/PaymentService.js中
const db = require('../config/db');
const Order = require('../models/Order');
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

class PaymentService {
  // 创建支付订单
  static async createPayment(orderId, amount, openid, description) {
    try {
      const nonceStr = crypto.randomBytes(16).toString('hex');
      const timestamp = Math.floor(Date.now() / 1000);
      
      const payParams = {
        mchid: process.env.WX_MCHID,
        appid: process.env.WX_APPID,
        description,
        out_trade_no: orderId,
        notify_url: `${process.env.API_BASE}/payment/notify`,
        amount: {
          total: Math.round(amount * 100), // 转换为分
          currency: 'CNY'
        },
        payer: {
          openid
        }
      };

      // 生成签名
      const signature = this.generateSignature(
        'POST',
        '/v3/pay/transactions/jsapi',
        timestamp,
        nonceStr,
        payParams
      );

      // 调用微信支付接口
      const response = await axios.post(
        'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
        payParams,
        {
          headers: {
            'Authorization': `WECHATPAY2-SHA256-RSA2048 ${signature}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.buildClientParams(response.data.prepay_id);

    } catch (error) {
      console.error('支付创建失败:', error.response?.data || error.message);
      throw new Error('支付创建失败');
    }
  }

  // 处理支付回调
  static async handleNotification(body) {
    try {
      const result = await xml2js.parseStringPromise(body);
      const data = result.xml;
      
      // 验证签名
      if (!this.verifySignature(data)) {
        throw new Error('签名验证失败');
      }

      // 处理支付结果
      if (data.result_code[0] === 'SUCCESS') {
        await db.transaction(async (connection) => {
          await Order.updateStatus(data.out_trade_no[0], 1, connection);
          // 其他业务逻辑（拼团处理等）
        });
      }

      return this.buildSuccessResponse();
    } catch (error) {
      console.error('回调处理失败:', error);
      return this.buildFailResponse(error.message);
    }
  }

  // 生成客户端支付参数
  static buildClientParams(prepayId) {
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);
    const package = `prepay_id=${prepayId}`;

    const signStr = [
      process.env.WX_APPID,
      timestamp.toString(),
      nonceStr,
      package
    ].join('\n') + '\n';

    const paySign = crypto.createSign('RSA-SHA256')
      .update(signStr)
      .sign(process.env.WX_PRIVATE_KEY, 'base64');

    return {
      timeStamp: timestamp.toString(),
      nonceStr,
      package,
      signType: 'RSA',
      paySign
    };
  }

  // 生成API请求签名
  static generateSignature(method, path, timestamp, nonce, body) {
    const signStr = [
      method,
      path,
      timestamp.toString(),
      nonce,
      JSON.stringify(body)
    ].join('\n') + '\n';

    return crypto.createSign('RSA-SHA256')
      .update(signStr)
      .sign(process.env.WX_PRIVATE_KEY, 'base64');
  }

  // 验证回调签名
  static verifySignature(data) {
    const sign = data.sign[0];
    const generatedSign = crypto.createHash('sha256')
      .update(this.buildSignString(data))
      .digest('hex').toUpperCase();
    
    return sign === generatedSign;
  }

  static buildSignString(data) {
    const sortedKeys = Object.keys(data)
      .filter(k => k !== 'sign')
      .sort();

    return sortedKeys
      .map(k => `${k}=${data[k][0]}`)
      .join('&') + `&key=${process.env.WX_API_KEY}`;
  }

  static buildSuccessResponse() {
    return `<xml>
      <return_code><![CDATA[SUCCESS]]></return_code>
      <return_msg><![CDATA[OK]]></return_msg>
    </xml>`;
  }

  static buildFailResponse(msg) {
    return `<xml>
      <return_code><![CDATA[FAIL]]></return_code>
      <return_msg><![CDATA[${msg}]]></return_msg>
    </xml>`;
  }
}

module.exports = PaymentService;

