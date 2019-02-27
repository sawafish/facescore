//index.js
const app = getApp()
Page({
  data: {
    takephoto: false,
    imgpath: false
  },

  onLoad: function() {

  },
  onShow: function() {
    let that = this;
    if (app.globalData.imagePath) {
      that.setData({
        imgpath: true
      })
    } else {
      that.setData({
        imgpath: false
      })
    }
  },
  list: function() {
    wx.navigateTo({
      url: '../report_score/report_score',
    })
  },
  compare: function() {
    wx.navigateTo({
      url: '../report_vs/report_vs',
    })
  },
  onShareAppMessage: function() {
    return {
      title: '新功能人脸相似度上线！还有颜值排行榜，赶快来体验吧！',
      path: "/pages/index/index"
    }
  },
  uploadCancle: function() {
    this.setData({
      takephoto: false
    })
  },
  takephotopop: function() {
    wx.getSetting({
      success(res) {
        console.log()
        if (!res.authSetting['scope.camera']) {
          wx.showModal({
            title: '提示',
            content: '禁用拍照权限将影响小程序核心功能，请前往设置开启权限',
            showCancel: false,
            success(res) {
              wx.openSetting({
                success(res) {

                }
              })
            }
          })
        }
      }
    })
    this.setData({
      takephoto: true
    })
  },
  takephoto: function() {

    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          takephoto: false
        })
        wx.showLoading({
          title: '上传中',
        })
        let filePath = res.tempImagePath
        // 上传图片
        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        let cloudPath = "faceimg/" + timestamp + Math.floor(Math.random() * 1000) + filePath.match(/\.[^.]+?$/)[0];
        let fileList = []
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            fileList = [app.globalData.fileID]
            wx.cloud.getTempFileURL({
              fileList,
              success: res => {
                app.globalData.imagePaths = res.fileList[0].tempFileURL;
                wx.navigateTo({
                  url: '../report_score/report_score'
                })
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
      }
    })
  },
  error(e) {
    wx.showModal({
      title: '提示',
      content: '禁用拍照权限将影响小程序核心功能，请前往设置开启权限',
      showCancel: false,
      success(res) {
        wx.openSetting({
          success(res) {

          }
        })
      }
    })
  },
  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        })

        let filePath = res.tempFilePaths[0]
        // 上传图片
        let timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        let cloudPath = "faceimg/" + timestamp + Math.floor(Math.random() * 1000) + filePath.match(/\.[^.]+?$/)[0];
        let fileList = []
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            fileList = [app.globalData.fileID]
            wx.cloud.getTempFileURL({
              fileList,
              success: res => {
                app.globalData.imagePaths = res.fileList[0].tempFileURL
                wx.navigateTo({
                  url: '../report_score/report_score'
                })
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

})