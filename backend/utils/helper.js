// backend/utils/helper.js
// 辅助函数库
module.exports = {
  // 格式化日期为YYYY-MM-DD HH:mm:ss
  formatDate(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  },

  // 解析JSON字段
  parseJSONField(arr, fieldName) {
    return arr.map(item => ({
      ...item,
      [fieldName]: JSON.parse(item[fieldName])
    }));
  }
};
