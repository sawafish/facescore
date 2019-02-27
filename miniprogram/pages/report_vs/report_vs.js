// miniprogram/pages/report_vs/report_vs.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagePath: "",
    imagePathTwo: "",
    compareList: [],
    score: 0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 返回主页重新测试
  restart: function() {
    wx.redirectTo({
      url: '../index/index'
    })
  },
  onShareAppMessage: function() {
    return {
      title: '新功能人脸相似度上线！还有颜值排行榜，赶快来体验吧！',
      path: "/pages/index/index"
    }
  },
  // 分享功能
  share: function() {
    let _this = this;
    _this.setData({
      isShowCav: true
    })
    const ctx = wx.createCanvasContext('mycanvas');

    const grd = ctx.createLinearGradient(60, 0, 150, 200)
    grd.addColorStop(0, '#177cb0')
    grd.addColorStop(0.45, '#ffb3a7')
    grd.addColorStop(1, '#fff')
    ctx.setFillStyle(grd)
    ctx.fillRect(0, 0, 300, 350);
    ctx.setFontSize(14);
    ctx.setFillStyle("#666");
    ctx.fillText("这个小程序不仅可以测试颜值，", 59, 60);
    ctx.fillText("竟然还可以测试'夫妻相'！", 59, 84);
    ctx.fillText("我和某个人的相似度有", 59, 108);
    ctx.setFontSize(18);
    ctx.setFillStyle("#f47983");
    ctx.fillText(_this.data.score + "%", 200, 108);
    ctx.setFontSize(14);
    ctx.setFillStyle("#666");
    ctx.fillText("你也赶紧测下你的颜值吧 ^_^", 59, 132);
    ctx.drawImage("../../images/qrcode.png", 75, 168, 150, 150);
    ctx.draw();
    setTimeout(function() {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function(res) {
          var tempFilePath = res.tempFilePath;
          _this.setData({
            canvasUrl: tempFilePath
          })
          if (tempFilePath !== '') {
            _this.setData({
              isShowCav: false
            });
            wx.previewImage({
              current: _this.data.canvasUrl, // 当前显示图片的http链接  
              urls: [_this.data.canvasUrl], // 需要预览的图片http链接列表  
            })
          }
        },
        fail: function(res) {}
      });
    }, 500);
  },


  // 上传图片
  doUpload: function() {
    const that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        });
        let filePath = res.tempFilePaths[0]
        // 上传图片
        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        let cloudPath = "faceimg/" + timestamp + Math.floor(Math.random() * 1000) + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            wx.getFileSystemManager().readFile({
              filePath: filePath, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                that.setData({
                  imagePath: filePath,
                  "compareList[0]": res.data
                });
                app.globalData.compareImgUrl = filePath;
                app.globalData.compareImgList = that.data.compareList;
                if (that.data.compareList.length == 2) {
                  wx.request({
                    url: 'https://aip.baidubce.com/rest/2.0/face/v3/match?access_token=' + app.globalData.token,
                    data: [{
                      "image": that.data.compareList[0],
                      "image_type": "BASE64"
                    }, {
                      "image": that.data.compareList[1],
                      "image_type": "BASE64"
                    }],
                    method: "POST",
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                      if (res.data.error_msg == 'SUCCESS') {
                        that.setData({
                          score: ((Math.floor(res.data.result.score * 100)) / 100).toString()
                        });
                        app.globalData.compareScore = that.data.score;
                      } else {
                        wx.hideLoading();
                        wx.showModal({
                          title: '提示',
                          content: '请上传jpg,png格式的两张真实人脸图片,并确保图像中人像清晰无遮挡，图片大小低于2MB',
                          showCancel: false,
                          success(res) {

                          }
                        })
                      }
                    },
                    fail: e => {
                      wx.hideLoading();
                      wx.showModal({
                        title: '提示',
                        content: '请上传jpg,png格式的两张真实人脸图片，图片大小低于2MB',
                        showCancel: false,
                        success(res) {

                        }
                      })
                    }
                  });
                }
              }
            })
          },
          fail: e => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '未选取图片',
        })
      }
    })
  },
  doUploadTwo: function() {
    const that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        });
        let filePath = res.tempFilePaths[0]
        // 上传图片
        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        let cloudPath = "faceimg/" + timestamp + Math.floor(Math.random() * 1000) + filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            wx.getFileSystemManager().readFile({
              filePath: filePath, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                that.setData({
                  imagePathTwo: filePath,
                  "compareList[1]": res.data
                });
                app.globalData.compareImgUrlTwo = filePath;
                app.globalData.compareImgList = that.data.compareList;
                if (that.data.compareList.length == 2) {
                  wx.request({
                    url: 'https://aip.baidubce.com/rest/2.0/face/v3/match?access_token=' + app.globalData.token,
                    data: [{
                      "image": that.data.compareList[0],
                      "image_type": "BASE64"
                    }, {
                      "image": that.data.compareList[1],
                      "image_type": "BASE64"
                    }],
                    method: "POST",
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                      console.log(res,that.data.score)
                      if (res.data.error_msg == 'SUCCESS') {
                        that.setData({
                          score: ((Math.floor(res.data.result.score * 100)) / 100).toString()
                        });
                        app.globalData.compareScore = that.data.score;
                      } else {
                        wx.hideLoading();
                        wx.showModal({
                          title: '提示',
                          content: '请上传jpg,png格式的两张真实人脸图片，图片大小低于2MB',
                          showCancel: false,
                          success(res) {

                          }
                        })
                      }
                    },
                    fail: e => {
                      wx.hideLoading();
                      wx.showModal({
                        title: '提示',
                        content: '请上传jpg,png格式的两张真实人脸图片，图片大小低于2MB',
                        showCancel: false,
                        success(res) {

                        }
                      })
                    }
                  });
                }
              }
            })
          },
          fail: e => {
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        wx.showToast({
          icon: 'none',
          title: '未选取图片',
        })
      }
    })
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

    if (app.globalData.compareImgUrl && app.globalData.compareImgUrlTwo && app.globalData.compareScore) {
      this.setData({
        imagePath: app.globalData.compareImgUrl,
        imagePathTwo: app.globalData.compareImgUrlTwo,
        score: app.globalData.compareScore,
        compareList: app.globalData.compareImgList
      })


    }
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