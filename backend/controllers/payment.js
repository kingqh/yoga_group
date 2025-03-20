// controllers/payment.js
const crypto = require('crypto');

exports.createPayment = async (req, res) => {
  const { groupId, openid } = req.body;
  
  // 生成商户订单号
  const outTradeNo = crypto.randomBytes(16).toString('hex');
  
  const params = {
    mchid: '商户号',
    appid: '小程序APPID',
    description: '瑜伽课程拼团',
    out_trade_no: outTradeNo,
    notify_url: 'https://your-domain.com/api/payment/notify',
    amount: { total: activity.price * 100 },
    payer: { openid }
  };

  // 生成签名（需实现签名逻辑）
  const sign = generateSign(params);
  
  const { data } = await axios.post(
    'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
    params,
    { headers: { 'Authorization': `WECHATPAY2-SHA256-RSA2048 ${sign}` } }
  );

  res.json({
    code: 200,
    data: {
      timeStamp: Date.now().toString(),
      nonceStr: crypto.randomBytes(16).toString('hex'),
      package: `prepay_id=${data.prepay_id}`,
      signType: 'RSA'
    }
  });
}
