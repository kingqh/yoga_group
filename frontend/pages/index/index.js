// pages/index/index.js
const app = getApp();

Page({
  onLoad() {
    if (app.globalData.isAuth) {
      // 已授权：直接使用全局数据
      console.log('cache userinfo: ', app.globalData.userInfo);
      this.setData({ userInfo: app.globalData.userInfo });
    } else {
      // 未授权：显示授权按钮
      console.log('show auth modal ');
      this.showAuthModal();
    }
  },
  data: {
    showLoginModal: false,
    countdown: 3,
    modalAnimation: {},
    activityList: [
      {
        id: 1,
        cover: '/images/curse01.jpeg',
        title: '阴瑜伽深度放松课程',
        price: 99,
        originalPrice: 199,
        groupSize: 3,
        joined: 2,
        endTime: 30 * 60 * 60 * 1000,
      }
    ],
    timeData: {},
    statsData: {
      viewCount: 235,
      joinCount: 48,
      shareCount: 32
    },
    recentUsers: [
      { id: 1, avatarUrl: '/images/user.jpeg' },
      { id: 2, avatarUrl: '/images/user2.jpeg' },
      { id: 3, avatarUrl: '/images/user3.jpeg' },
      { id: 4, avatarUrl: '/images/user4.jpeg' },
      { id: 5, avatarUrl: '/images/user5.jpeg' },
      { id: 6, avatarUrl: '/images/user6.jpeg' },
      { id: 7, avatarUrl: '/images/user7.jpeg' },
      { id: 8, avatarUrl: '/images/user8.jpeg' },
      { id: 9, avatarUrl: '/images/user9.jpeg' }
    ],
  },
  /* 授权登陆弹窗相关 start */
  // 用户点击授权按钮
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于展示用户信息',
      success: (res) => {
        console.log('opid is ', wx.getStorageSync('openid'));
        console.log('sk is ', wx.getStorageSync('session_key'));
        wx.request({
          url: 'https://kingqh.cn/api/users/login',
          method: 'POST',
          data: { openid: wx.getStorageSync('openid'),  nickname: res.userInfo.nickName, avatar: res.userInfo.avatarUrl },
          success: (rr) => {
                    // 更新全局数据和缓存
                    app.globalData.userInfo = res.userInfo;
                    app.globalData.isAuth = true;
                    console.log('get userinfo ', res);
                    wx.setStorageSync('userInfo', res.userInfo);
                    this.setData({ userInfo: res.userInfo});
                    this.startCountdown();
          },
          fail: (err) => {
            wx.showToast({ title: '授权失败', icon: 'none' })
            this.closeModal()
          }
        });
      }
    });
  },
  // 显示授权弹窗
  showAuthModal() {
    this.createAnimation(true)
    this.setData({ showLoginModal: true })
  },

  // 创建动画效果
  createAnimation(show) {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    })
    
    if (show) {
      animation.translateY(0).opacity(1).step()
    } else {
      animation.translateY(100).opacity(0).step()
    }
    
    this.setData({ modalAnimation: animation.export() })
  },

  // 开始关闭倒计时
  startCountdown() {
    let count = 3
    const timer = setInterval(() => {
      if (count <= 0) {
        clearInterval(timer)
        this.closeModal()
        return
      }
      this.setData({ countdown: count })
      count--
    }, 1000)
  },

  // 关闭弹窗
  closeModal() {
    this.createAnimation(false)
    setTimeout(() => {
      this.setData({ 
        showLoginModal: false,
        countdown: 3
      })
    }, 300)
  },

  /* 授权登陆弹窗相关 start */

  // 显示/隐藏海报菜单
  showPosterMenu() {
    this.setData({ showPosterMenu: !this.data.showPosterMenu })
  },

  // 生成海报
  async handleGeneratePoster() {
    this.setData({ showPosterMenu: false })
    
    // 获取活动数据
    const activity = this.data.activityList[0] // 示例取第一个活动
    
    // 生成二维码
    const qrCode = await this.generateQRCode('/pages/group/detail?id=123')
    
    // 绘制海报
    const ctx = wx.createCanvasContext('posterCanvas')
    
    // 绘制背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)
    
    // 绘制头图
    await this.drawImage(ctx, activity.cover, 0, 0, POSTER_WIDTH, 400)
    
    // 绘制标题
    ctx.setFontSize(20)
    ctx.setFillStyle('#333333')
    ctx.fillText(activity.title, 30, 450)
    
    // 绘制价格
    ctx.setFontSize(32)
    ctx.setFillStyle('#FF6B6B')
    ctx.fillText(`拼团价: ¥${activity.price}`, 30, 500)
    
    // 绘制二维码
    await this.drawImage(ctx, qrCode, POSTER_WIDTH-150, POSTER_HEIGHT-200, 120, 120)
    
    // 绘制提示文字
    ctx.setFontSize(14)
    ctx.setFillStyle('#666666')
    ctx.fillText('长按识别二维码参与拼团', POSTER_WIDTH-180, POSTER_HEIGHT-60)
    
    ctx.draw(() => {
      this.setData({ showPoster: true })
    })
  },

  // 绘制图片（Promise封装）
  drawImage(ctx, src, x, y, w, h) {
    return new Promise((resolve) => {
      wx.getImageInfo({
        src,
        success: (res) => {
          ctx.drawImage(res.path, x, y, w, h)
          resolve()
        },
        fail: () => resolve()
      })
    })
  },

  // 生成小程序二维码
  async generateQRCode(path) {
    try {
      const { code } = await wx.cloud.callFunction({
        name: 'qrcode',
        data: { path }
      })
      return code
    } catch (err) {
      return '/images/default-qrcode.png'
    }
  },

  // 保存海报到相册
  savePoster() {
    wx.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '保存成功' }),
          fail: () => this.showAuthTips()
        })
      }
    })
  },

  // 显示权限提示
  showAuthTips() {
    wx.showModal({
      title: '权限申请',
      content: '需要您授权保存到相册',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting()
        }
      }
    })
  },

  // 关闭海报预览
  closePoster() {
    this.setData({ showPoster: false })
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
  },
  
  // 定时使用
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },

  // 处理开团事件
  onCreateGroup() {
    wx.showToast({
      title: '开团逻辑处理中...',
      icon: 'none'
    })
  },

  // 处理海报生成页面
  handleGeneratePoster() {
    wx.showToast({
      title: '生成海报页面开发中...',
      icon: 'none'
    })
  },

  // grou-sidebar 监听
  handleGroupSidebarTouchMove() {
    const component = this.selectComponent('#groupSidebar');
    if (component) {
      // 调用组件内的方法，传递滑动数据
      component.handleTouchMove();
    }
  },
      
  
})