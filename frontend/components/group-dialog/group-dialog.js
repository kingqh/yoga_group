// group-dialog.js
Component({
  properties: {
    posterUrl: String,
    participants: Array,
    participantCount: Number,
    title: String,
    groupOriginalPrice: Number,
    groupPrice: Number
  },

  data: {
    visible: false,
  },

  methods: {
    // 阻止冒泡
    preventTouch() {},

    handleClose() {
      this.triggerEvent('close')
    },

    handleInnerPay() {
      this.triggerEvent('pay')
    },

    // 对外暴露的控制方法
    show() {
      this.setData({ visible: true })
    },

    hide() {
      this.setData({ visible: false })
    }
  }
})
