// pages/index/index.js
const POSTER_WIDTH = 600 // 海报宽度
const POSTER_HEIGHT = 1000 // 海报高度
const app = getApp();

Page({
  onLoad() {
    if (app.globalData.isAuth) {
      // 已授权：直接使用全局数据
      this.setData({ userInfo: app.globalData.userInfo });
    } else {
      // 未授权：显示授权按钮
      this.setData({ showAuthButton: true });
    }
  },
  // 用户点击授权按钮
  handleAuth() {
    wx.getUserProfile({
      desc: '用于展示用户信息',
      success: (res) => {
        // 更新全局数据和缓存
        app.globalData.userInfo = res.userInfo;
        app.globalData.isAuth = true;
        wx.setStorageSync('userInfo', res.userInfo);
        this.setData({ userInfo: res.userInfo, showAuthButton: false });
      }
    });
  },
  data: {
    showPosterMenu: false,
    showPoster: false,
    canvasWidth: POSTER_WIDTH,
    canvasHeight: POSTER_HEIGHT,
    posterData: null, // 海报数据缓存
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
  },

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
  
})