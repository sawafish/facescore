// miniprogram/pages/rankinglist/rankinglist.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toplistmale: [],
    toplistfemale: [],
    openid: "",
    malemark: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      toplistmale: app.globalData.toplistmale,
      toplistfemale: app.globalData.toplistfemale,
      openid: app.globalData.openid
    })

  },
  tab: function() {
    this.setData({
      malemark: !this.data.malemark
    })

  },
  onShareAppMessage: function() {
    return {
      title: '新功能人脸相似度上线！还有颜值排行榜，赶快来体验吧！',
      path: "/pages/index/index"
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})