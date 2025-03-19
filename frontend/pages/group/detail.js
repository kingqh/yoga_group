// pages/group/detail.js
Page({
  data: {
    activity: {},
    members: [],
    isFull: false
  },

  onLoad(options) {
    this.loadGroupDetail(options.id)
  },

  // 加载拼团详情
  async loadGroupDetail(id) {
    // 调用后端接口获取数据
    const res = await wx.request({
      url: `${getApp().globalData.baseUrl}/group/${id}`
    })
    
    this.setData({
      activity: res.data.activity,
      members: res.data.members,
      isFull: res.data.members.length >= res.data.groupSize
    })
  },

  // 参与拼团
  handleJoinGroup() {
    wx.navigateTo({
      url: '/pages/payment/index'
    })
  }
})