// components/group-buy/group-buy.js
Component({
  properties: {
    // 商品数据
    title: String,
    groupPrice: Number,
    isJoined: Boolean,
  },
  methods: {
    handleCreateGroup() {
      // 处理开团逻辑
      this.triggerEvent('createGroup')
    }
  }
})
