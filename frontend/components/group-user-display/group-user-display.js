// components/group-user-display/group-user-display.js
Component({
  properties: {
    stats: {  // 汇总数据
      type: Object,
      value: { viewCount: 0, joinCount: 0, shareCount: 0 }
    },
    users: {
      type: Array,
      value: []
    }
  },

  data: {
    firstRowAvatars: [],
    carouselList: [],
    offset: 0,
    itemWidth: 120, // 头像宽度+间距
    timer: null
  },

  observers: {
    'users'(val) {
      if (val.length < 7) return
      
      const firstRow = val.slice(0, 6)
      const carouselData = val.slice(0)
      
      this.setData({
        firstRowAvatars: firstRow,
        carouselList: carouselData
      }, () => {
        this.startCarousel()
      })
    }
  },

  methods: {
    startCarousel() {
      clearInterval(this.data.timer)
      
      const timer = setInterval(() => {
        const newOffset = this.data.offset - this.data.itemWidth
        
        this.setData({
          offset: newOffset
        }, () => {
          setTimeout(() => {
            const rotatedList = [...this.data.carouselList]
            rotatedList.push(rotatedList.shift())
            
            this.setData({
              carouselList: rotatedList,
              offset: 0
            })
          }, 500) // 匹配动画时间
        })
      }, 3000)

      this.setData({ timer })
    }
  }
})
