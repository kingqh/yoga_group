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

    // 登录
    wx.login({
      success: ({ code }) => {
        console.log('AAA')
        wx.getUserProfile({
          desc: '用于完善会员信息',
          success: ({ encryptedData, iv }) => {
            // 发送code + encryptedData + iv到后端
            wx.request({
              url: '/api/users/login',
              method: 'POST',
              data: { code, encryptedData, iv }
            })
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null, // 全局存储用户信息
    isAuth: false   // 是否已授权
  }
})
