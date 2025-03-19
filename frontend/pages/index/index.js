// pages/index/index.js
Page({
  data: {
    showShareMenu: false,
    activityList: [
      {
        id: 1,
        cover: '/images/course1.jpg',
        title: '阴瑜伽深度放松课程',
        price: 99,
        originalPrice: 199,
        groupSize: 3,
        joined: 2,
        endTime: '2023-12-31'
      }
    ]
  },

   // 切换分享菜单
   toggleShareMenu() {
    this.setData({ showShareMenu: !this.data.showShareMenu });
  },

  // 处理微信分享
  handleShareWechat() {
    this.toggleShareMenu();
    this.onShareAppMessage();
  },

  // 处理朋友圈分享
  handleShareMoment() {
    this.toggleShareMenu();
    wx.showToast({
      title: '请使用右上角菜单分享到朋友圈',
      icon: 'none'
    });
  },

  // 参团处理
  handleJoinGroup(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/group/list?id=${id}`
    });
  },

  // 发起拼团
  handleCreateGroup(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/group/create?id=${id}`
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '瑜伽爱好者必看！超值拼团课程等你来',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})