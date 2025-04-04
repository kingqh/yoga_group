// pages/index/index.js
const app = getApp();

Page({
  canvas: null,
  ctx: null,
  pixelRatio: 1,
  onLoad() {
    this.refresh();
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
    //是否是通过好友团
    isFriendShared: false,
    //是否已开团
    isJoined: false,
    showPosterModal: false,
    posterPath: '',
    showLoginModal: false,
    countdown: 3,
    modalAnimation: {},
    activity: {},
    timeData: {},
    // 好友订单
    friendOrder: {},
    // 用户自己的订单
    myOrder: {},
    // 所有用户信息
    allUsers: [
    ],
    statsData: {
      viewCount: 235,
      joinCount: 48,
      shareCount: 32
    },
    participants: [
      { avatar: '/images/user.jpeg', nickname: '用户1' },
      { avatar: '/images/user2.jpeg', nickname: '用户2' },
      { avatar: '/images/user3.jpeg', nickname: '用户3' },
    ]
  },
  /* 调用后端逻辑代码 start */
  getActivity() {
    wx.request({
      url: 'https://kingqh.cn/api/activities/666',
      method: 'GET',
      success: (res) => {
        console.log('getActivity ', res.data.data);
        res.data.data.countdownTime = this.getSecondsDifference(res.data.data.end_time);
        console.log('countdownTime: ', res.data.data.countdownTime);
        this.setData({ activity: res.data.data});
        this.setData({ statsData: {viewCount: res.data.data.viewed_num, joinCount: res.data.data.registered_num, shareCount: res.data.data.shared_num}});
      },
      fail: (err) => {
        wx.showToast({ title: '获取活动失败,请联系活动负责人!', icon: 'none' })
      }
    });
  },
  getFriendOrder() {
    wx.request({
      url: 'https://kingqh.cn/api/orders/' + wx.getStorageSync('friendid'),
      method: 'GET',
      success: (res) => {
        console.log('getFriendOrder ', res.data.data);
        if (res.data && res.data.code == 200) {
          this.setData({ friendOrder: res.data.data, isFriendShared: true});
        }
      },
      fail: (err) => {
        wx.showToast({ title: '获取活动失败,请联系活动负责人!', icon: 'none' })
      }
    });
  },
  getMyOrder() {
    wx.request({
      url: 'https://kingqh.cn/api/orders/' + wx.getStorageSync('openid'),
      method: 'GET',
      success: (res) => {
        console.log('getMyOrder ', res.data.data);
        if (res.data && res.data.code == 200) {
          this.setData({ myOrder: res.data.data, isJoined: true});
        }
      },
      fail: (err) => {
        wx.showToast({ title: '获取活动失败,请联系活动负责人!', icon: 'none' })
      }
    });
  },
  getAllUsers() {
    wx.request({
      url: 'https://kingqh.cn/api/users',
      method: 'GET',
      success: (res) => {
        console.log('getAllUsers ', res.data.data);
        if (res.data && res.data.code == 200) {
          this.setData({ allUsers: res.data.data});
        }
      },
      fail: (err) => {
        wx.showToast({ title: '获取活动失败,请联系活动负责人!', icon: 'none' })
      }
    });
  },
  creatGroup(openId) {
    wx.request({
      url: 'https://kingqh.cn/api/groups/666/' + openId + '/create',
      method: 'POST', 
      success: (res) => {
        console.log('creatGroup res ', res);
        if (res.data && res.data.code == 200) {
          console.log('creatGroup success ', res);
          wx.showToast({ title: '开团成功,生成海报可转发好友一起拼团!', icon: 'none' })
          this.refresh();
        } else {
          console.log('creatGroup failed ', res.data.code);
          wx.showToast({ title: '拼团失败,请联系活动负责人!', icon: 'none' })
        }
      },
      fail: (err) => {
        wx.showToast({ title: '拼团失败,请联系活动负责人!', icon: 'none' })
      }
    })
  },
  joinGroup(friendId, openId) {
    wx.request({
      url: 'https://kingqh.cn/api/groups/' + friendId + '/'+ openId + '/join',
      method: 'POST', 
      success: (res) => {
        console.log('joinGroup res ', res);
        if (res.data && res.data.code == 200) {
          console.log('joinGroup success ', res);
          wx.showToast({ title: '加团成功!', icon: 'none' });
          this.refresh();
        } else {
          console.log('joinGroup failed ', res.data.code);
          wx.showToast({ title: '拼团失败,请联系活动负责人!', icon: 'none' })
        }
      },
      fail: (err) => {
        wx.showToast({ title: '拼团失败,请联系活动负责人!', icon: 'none' })
      }
    })
  },
  refresh() {
    this.getActivity();
    this.getAllUsers();
    this.getMyOrder();
    this.getFriendOrder();
  },
   /* 调用后端逻辑代码 end */
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

  /* 授权登陆弹窗相关 end */

  // 定时使用
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },

  // 处理开团事件
  onCreateGroup() {
    if (this.data.isJoined) {
      this.showGroupDialog();
      return 
    }
    wx.request({
      url: 'https://kingqh.cn/api/activities/registercount/666',
      method: 'POST'
    });
    wx.showModal({
      title: '确认开团',
      content: '确定要支付 ¥ ' + this.data.activity.price +  '开团吗',
      confirmText: '确认',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          console.log('onCreateGroup ');
          this.creatGroup(wx.getStorageSync('openid'));
        }
      }
    });
  },

  // 处理加团事件
  onJoinGroup() {
    if (this.data.isJoined) {
      this.showGroupDialog();
      return 
    }
    wx.request({
      url: 'https://kingqh.cn/api/activities/registercount/666',
      method: 'POST'
    });
    wx.showModal({
      title: '确认加入好友的团',
      content: '确定要支付 ¥ ' + this.data.activity.price +  '开团吗',
      confirmText: '确认',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          console.log('onJoinGroup ');
          this.joinGroup(wx.getStorageSync('friendid'), wx.getStorageSync('openid'));
        }
      }
    });
  },

  // 处理海报生成页面
  async handleGeneratePoster() {
    await this.showPosterModal();
  },

  // grou-sidebar 监听
  handleGroupSidebarTouchMove() {
    const component = this.selectComponent('#groupSidebar');
    if (component) {
      // 调用组件内的方法，传递滑动数据
      component.handleTouchMove();
    }
  },

  // 显示海报弹窗
  async showPosterModal() {
    this.setData({ showPosterModal: true }, async () => {
      wx.request({
        url: 'https://kingqh.cn/api/activities/sharecount/666',
        method: 'POST'
      });
      await this.initCanvas();
      await this.drawPoster();
    });
  },

  // 隐藏海报弹窗
  hidePosterModal() {
    this.setData({ showPosterModal: false });
  },

  // 初始化Canvas
  async initCanvas() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery()
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const pixelRatio = wx.getSystemInfoSync().pixelRatio
          
          // 设置高清画布尺寸
          canvas.width = 600 * pixelRatio
          canvas.height = 1000 * pixelRatio
          ctx.scale(pixelRatio, pixelRatio)
          
          this.canvas = canvas
          this.ctx = ctx
          resolve()
        })
    })
  },
  
  // 生成海报代码 
  async drawPoster() {
    const { ctx } = this
    ctx.clearRect(0, 0, 600, 1000)
    
    // 绘制背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 600, 1000)

    // 绘制商品图片
    await this.drawImage({
      url: '/images/curse01.jpeg',
      x: 30,
      y: 30,
      width: 540,
      height: 540
    })

    // 绘制价格文字
    this.drawText({
      text: '¥399 一起团',
      x: 300,
      y: 600,
      fontSize: 48,
      color: '#ff4444',
      fontWeight: 'bold'
    })

    const path = encodeURIComponent('pages/index/index?id=1'); // 输出: pages%2Findex%2Findex%3Fid%3D1
    const fullUrl = `weixin://dl/business/?appid=wxc97569396d0364c2&path=${path}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const qrPath = encodeURIComponent('pages/index/index?id=123');
    const qrUrl = `http://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodedUrl}`;
    console.log('qr code url is ', qrUrl);
    // 生成二维码
    await this.drawImage({
      url: qrUrl,
      x: 400,
      y: 800,
      width: 150,
      height: 150
    })

    // 缓存海报图片
    const tempPath = await this.canvasToTempPath()
    this.setData({ posterPath: tempPath })
  },

  // 保存海报到相册
  async handleSave() {
    if (!this.data.posterPath) {
      wx.showToast({ title: '海报生成中...', icon: 'loading' })
      return
    }

    try {
      await wx.saveImageToPhotosAlbum({
        filePath: this.data.posterPath
      })
      wx.showToast({ title: '保存成功' })
    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({ title: '请授权相册权限', icon: 'none' })
    }
  },

  // 分享海报
  handleShare() {
    if (!this.data.posterPath) {
      wx.showToast({ title: '海报生成中...', icon: 'loading' })
      return
    }

    wx.shareFileMessage({
      filePath: this.data.posterPath,
      success: () => {
        wx.showToast({ title: '分享成功' })
      }
    })
  },

  // 将Canvas转为临时路径
  canvasToTempPath() {
    return new Promise((resolve) => {
      wx.canvasToTempFilePath({
        canvas: this.canvas,
        success: res => resolve(res.tempFilePath)
      })
    })
  },

  // 图片绘制方法（示例）
  async drawImage(options) {
    const { ctx } = this
    const img = await this.loadImage(options.url)
    ctx.drawImage(img, options.x, options.y, options.width, options.height)
  },

  // 通用图片加载方法
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = this.canvas.createImage()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  },

  // 文字绘制方法
  drawText(options) {
    const { ctx } = this
    const {
      text,
      x,
      y,
      fontSize = 32,
      color = '#000',
      fontWeight = 'normal',
      textAlign = 'left'
    } = options

    ctx.save()
    ctx.font = `${fontWeight} ${fontSize}px sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = textAlign
    ctx.textBaseline = 'middle'
    
    // 自动换行处理
    const maxWidth = 650
    const lineHeight = fontSize * 1.4
    let currentY = y
    
    this.wrapText(text, x, currentY, maxWidth, lineHeight, (line, lineY) => {
      ctx.fillText(line, x, lineY)
      currentY += lineHeight
    })
    
    ctx.restore()
  },

  // 文字换行算法
  wrapText(text, x, y, maxWidth, lineHeight, callback) {
    const { ctx } = this
    const words = text.split('')
    let line = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && i > 0) {
        callback(line, y)
        line = words[i]
        y += lineHeight
      } else {
        line = testLine
      }
    }
    
    callback(line, y)
  }, 

  // group详情弹框
  showGroupDialog() {
    this.selectComponent('#groupDialog').show()
  },
  
  handleCloseDialog() {
    this.selectComponent('#groupDialog').hide()
  },

  getSecondsDifference(mysqlDateStr) {
   
    const dbDate = new Date(mysqlDateStr);
    
    // 验证日期有效性
    if (isNaN(dbDate.getTime())) {
        throw new Error('无效的日期格式');
    }

    const now = new Date(); // 当前时间

    console.log('dbDate: ', dbDate);
    console.log('now: ', now);
    const diffMs = dbDate - now; // 差值（毫秒）
    return Math.floor(diffMs); // 转换为秒
  },
  
})