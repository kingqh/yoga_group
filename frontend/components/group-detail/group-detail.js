// group-detail.js
Component({
  properties: {
    // 商品数据
    posterUrl: String,
    // 参团用户数据
    participants: {
      type: Array,
      value: []
    },
    participantCount: Number,
    title: String,
    groupOriginalPrice: Number,
    groupPrice: Number,
    isJoined: Boolean
  },

  methods: {
    handlePay() {
      this.triggerEvent('pay')
    }
  }
})
