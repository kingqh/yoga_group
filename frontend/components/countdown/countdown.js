// components/countdown/countdown.js
Component({
  properties: {
    endTime: {  // 传入的结束时间（时间戳或日期字符串）
      type: null,
      observer: '_initTimer'
    }
  },

  data: {
    timeData: {
      days: 0,
      hours: '00',
      minutes: '00',
      seconds: '00'
    }
  },

  methods: {
    _initTimer(endTime) {
      if (!endTime) return
      
      // 清除旧定时器
      if (this.timer) clearInterval(this.timer)
      
      // 转换为时间戳
      const endStamp = new Date(endTime).getTime()
      
      this.timer = setInterval(() => {
        const now = Date.now()
        const diff = endStamp - now
        
        if (diff <= 0) {
          clearInterval(this.timer)
          this.triggerEvent('timeup')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        this.setData({
          timeData: {
            days,
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0')
          }
        })
      }, 1000)
    }
  },

  detached() {
    clearInterval(this.timer)
  }
})
