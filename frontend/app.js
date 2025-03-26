// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: ({ code }) => {
        wx.getUserProfile({
          desc: '用于完善会员信息',
          success: ({ encryptedData, iv }) => {
            // 发送code + encryptedData + iv到后端
            wx.request({
              url: 'https://kingqh.cn/api/users/login',
              method: 'POST',
              data: { code, encryptedData, iv }
            })
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
