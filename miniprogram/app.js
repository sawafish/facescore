//app.js
App({
  onLaunch: function() {
    wx.cloud.init({
      traceUser: true
    });
    var that = this;
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=fuilOgbE9PTFDMy1u8mXsvEG&client_secret=cEOS1TLDxVRbwFpTHBB9nfa2yIWtqFlR',
      success(res) {
        that.globalData.token = res.data.access_token;
      }
    });
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        that.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)

      }
    });

  }
})