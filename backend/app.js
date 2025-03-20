const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const app = express();

// 中间件
app.use(bodyParser.json());
app.use(jwt({ secret: process.env.JWT_SECRET }).unless({path: ['/api/login']}));

// 路由
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// 错误处理
app.use((err, req, res, next) => {
  res.status(401).json({ code: 401, msg: 'Token验证失败' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
