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
    participantCount: Number
  },

  methods: {
    handlePay() {
      this.triggerEvent('pay')
    }
  }
})
