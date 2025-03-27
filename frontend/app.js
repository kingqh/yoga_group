// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查本地缓存是否存在用户信息
    const cachedUserInfo = wx.getStorageSync('userInfo');
    if (cachedUserInfo) {
      this.globalData.userInfo = cachedUserInfo;
      this.globalData.isAuth = true;
    }

    // 登录获取 openid（不依赖用户授权）
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送 code 到后端换取 openid/session_key
          console.log('res code is ', res.code)
          wx.request({
            url: 'https://kingqh.cn/api/users/code2id',
            method: 'POST',
            data: { code: res.code },
            success: (res) => {
              // 存储 openid，用于后续业务逻辑
              wx.setStorageSync('openid', res.data.data.openid);
              wx.setStorageSync('session_key', res.data.data.session_key);
            }
          });
        }
      }
    });
  },
  globalData: {
    userInfo: null, // 全局存储用户信息
    isAuth: false   // 是否已授权
  }
})
