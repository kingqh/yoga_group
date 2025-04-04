// components/sidebar/sidebar.js
Component({
  properties: {
    // 配置项
    config: {
      type: Object,
      value: {
        autoShowDelay: 2000,   // 自动展开延迟
        musicUrl: 'https://kingqh.cn/yoga_audio/yoga_group.mp3' 
      }
    },
  },

  data: {
    isSidebarOpen: true,
    isMusicPlaying: false,
    showContactModal: false,
    autoShowTimer: null,
    triggerIcon: '/images/menu-icon.png', // 触发按钮图标
    contactTitle: '商家信息', // 联系弹窗标题
    // 菜单项配置
    menuItems: [
      { 
        type: 'music', 
        icon: {
          on: '/images/music-on.png',
          off: '/images/music-off.png'
        },
        text: '音乐'
      },
      { 
        type: 'contact', 
        icon: '/images/contact-icon.png',
        text: '联系商家'
      },
      {
        type: 'poster',
        icon: '/images/poster-icon.png',
        text: '生成海报'
      }
    ],
    // 商家联系信息
    contacts: [
      { icon: '/images/phone.png', info: '联系电话：400-123-4567' },
      { icon: '/images/address.png', info: '地址：XX市XX区XX路XX号' },
      { icon: '/images/time.png', info: '营业时间：9:00-21:00' }
    ],
    innerAudioContext: null
  },

  lifetimes: {
    attached() {
      this.startAutoShowTimer();
      this.initInnerAudioContext();
      this.toggleMusic();
    },
    detached() {
      this.clearAllTimers();
      this.closeInnerAudioContext();
    }
  },

  methods: {
    initInnerAudioContext() {
      const audioContext = wx.createInnerAudioContext({
        useWebAudioImplement: false 
      })
      audioContext.src = this.properties.config.musicUrl;
      this.setData({ innerAudioContext: audioContext });
    },
    closeInnerAudioContext() {
      this.data.innerAudioContext.destroy();
    },
    // 定时器管理
    startAutoShowTimer() {
      console.log('startAutoShowTimer');
      this.clearTimer('autoShowTimer');
      const timer = setTimeout(() => {
        console.log('startAutoShowTimer end!');
        this.setData({ isSidebarOpen: true });
      }, this.properties.config.autoShowDelay);
      this.setData({ autoShowTimer: timer });
    },

    clearAllTimers() {
      this.clearTimer('autoShowTimer');
    },

    clearTimer(timerName) {
      if (this.data[timerName]) {
        clearTimeout(this.data[timerName]);
        this.setData({ [timerName]: null });
      }
    },

    // 事件处理
    handleTouchMove() {
      if (!this.data.isSidebarOpen) return;
      this.clearAllTimers();
      this.setData({ isSidebarOpen: false });
      this.startAutoShowTimer();
    },

    toggleSidebar() {
      this.clearAllTimers();
      this.setData({
        isSidebarOpen: !this.data.isSidebarOpen
      });
    },

    handleMenuItemTap(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.properties.menuItems[index];
      
      switch(item.type) {
        case 'music':
          this.toggleMusic();
          break;
        case 'contact':
          this.showContact();
          break;
        case 'poster':
          this.triggerEvent('generateposter');
          break;
      }
    },

    toggleMusic() {
      const isPlaying = !this.data.isMusicPlaying;
      if (isPlaying) {
        this.data.innerAudioContext.play(); // 播放
      } else {
        this.data.innerAudioContext.pause(); // 暂停
      }
      this.setData({ isMusicPlaying: isPlaying });
    },

    showContact() {
      this.setData({ 
        showContactModal: true,
        isSidebarOpen: false 
      });
    },

    hideContact() {
      this.setData({ 
        showContactModal: false,
        isSidebarOpen: true  
      });
    }
  }
})
