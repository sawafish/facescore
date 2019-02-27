// pages/storageConsole/storageConsole.js

const app = getApp()

Page({

  data: {
    truelymark: false,
    fileID: '',
    cloudPath: '',
    imagePath: '',
    avatarUrl: '',
    userInfo: {},
    nickName: "",
    logged: false,
    requestResult: '',
    imagePaths: '',
    score: {},
    scoreFake: 0,
    top: 999,
    toppercent: 0,
    topid: "",
    emotion: "心情平静",
    isShowCav: false,
    canvasUrl: "",
    gender: ""
  },
  truelyscore() {
    let that = this;
    that.setData({
      truelymark: !that.data.truelymark
    })
  },
  bindGetUserInfo(e) {
    let that = this;
    if (!this.logged && e.detail.userInfo) {
      that.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        nickName: e.detail.userInfo.nickName
      })
    }
  },
  onLoad: function(options) {
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              that.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                nickName: res.userInfo.nickName
              })
            }
          })
        }
      }
    })

    // 数据库操作
    const db = wx.cloud.database();
    const list = db.collection('rankinglist');


    wx.showLoading({
      title: '颜值分析中...',
    });

    wx.cloud.downloadFile({
      fileID: app.globalData.fileID,
      success: res => {
        // get temp file path
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: res => { //成功的回调
            app.globalData.base64 = res.data;

            wx.request({
              url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + app.globalData.token,
              data: {
                image: app.globalData.base64,
                image_type: 'BASE64',
                face_field: "age,beauty,expression,face_shape,gender,glasses,landmark,landmark72,landmark150,race,quality,eye_status,emotion,face_type"
              },
              method: "POST",
              header: {
                'content-type': 'application/json' // 默认值
              },
              success(res) {
                if (res.data.error_msg == 'SUCCESS') {
                  let list = res.data.result.face_list[0];
                  console.log(list)
                  console.log("******下面是百度人脸检测返回的真是测试结果分数******")
                  console.log(list.beauty)
                  console.log("******真实的分数可能有点低，但是它绝对反应不出你真实的颜值水平，******")
                  console.log("******不是因为明星们的真实得分也不高，而是因为******")
                  console.log("******真正使你美丽的是你的自信和善良^_^******")
                  if (list.face_type.type == "cartoon" && list.face_type.probability > 0.85) {
                    wx.hideLoading();
                    wx.showModal({
                      title: '提示',
                      content: '检测到您正在使用卡通类图片进行测试，考虑到公平严谨性，请选取真实人脸进行测试',
                      showCancel: false,
                      success(res) {
                        wx.redirectTo({
                          url: '../index/index'
                        })
                      }
                    })
                  } else {
                    that.setData({
                      score: list,
                      gender: list.gender.type,
                      imagePath: app.globalData.imagePath,
                      imagePaths: app.globalData.imagePaths
                    })
                    if (list.emotion.type == "neutral") {
                      that.setData({
                        emotion: "心情平静"
                      })
                    } else if (list.emotion.type == "angry") {
                      that.setData({
                        emotion: "我很生气"
                      })
                    } else if (list.emotion.type == "disgust") {
                      that.setData({
                        emotion: "我不开心"
                      })
                    } else if (list.emotion.type == "fear") {
                      that.setData({
                        emotion: "有点害怕"
                      })
                    } else if (list.emotion.type == "happy") {
                      that.setData({
                        emotion: "灰常开心"
                      })
                    } else if (list.emotion.type == "sad") {
                      that.setData({
                        emotion: "有点伤心"
                      })
                    } else {
                      that.setData({
                        emotion: "很惊讶"
                      })
                    }
                    if (list.beauty <= 60) {
                      that.setData({
                        scoreFake: (76 + Math.floor(list.beauty * 10) / 100).toFixed(2)
                      })
                    } else if (list.beauty > 60 && list.beauty <= 70) {
                      that.setData({
                        scoreFake: (list.beauty + 22).toFixed(2)
                      })
                    } else if (list.beauty > 70 && list.beauty <= 80) {
                      that.setData({
                        scoreFake: (list.beauty + 13).toFixed(2)
                      })
                    } else if (list.beauty > 80 && list.beauty <= 85) {
                      that.setData({
                        scoreFake: (list.beauty + 10).toFixed(2)
                      })
                    } else if (list.beauty > 85 && list.beauty <= 90) {
                      that.setData({
                        scoreFake: (list.beauty + 7).toFixed(2)
                      })
                    } else if (list.beauty > 90 && list.beauty <= 95) {
                      that.setData({
                        scoreFake: (list.beauty + 4).toFixed(2)
                      })
                    } else {
                      that.setData({
                        scoreFake: (list.beauty).toFixed(2)
                      })

                    }
                    // 添加至数据库
                    if (that.data.scoreFake) {
                      db.collection('rankinglist').add({
                        // data 字段表示需新增的 JSON 数据
                        data: {
                          score: that.data.scoreFake,
                          gender: that.data.score.gender.type,
                          race: that.data.score.race.type,
                        },
                        success(res) {
                          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                          that.setData({
                            topid: res._id
                          })
                        }
                      });
                      wx.cloud.callFunction({
                        // 需调用的云函数名
                        name: 'list',
                        // 成功回调
                        success(res) {
                          let array = res.result.data.concat();
                          let temp = [];
                          let l = array.length;
                          for (let i = 0; i < l; i++) {
                            for (let j = i + 1; j < l; j++) {
                              if (array[i]._openid == array[j]._openid && array[i].score == array[j].score) {
                                db.collection('rankinglist').doc(array[j]._id).remove({
                                  success: console.log,
                                  fail: console.error
                                })
                                i++;
                                j = i;
                              }
                            }
                            temp.push(array[i]);
                          };
                          let orlist = temp.concat(),
                            toplistmale = [],
                            toplistfemale = [];
                          for (let i = 0; i < orlist.length; i++) {
                            if (orlist[i].gender == "male") {
                              toplistmale.push(orlist[i])
                            } else {
                              toplistfemale.push(orlist[i])
                            }
                          };
                          if (that.data.gender == "male") {
                            let mark = true;
                            for (let i = 0; i < toplistmale.length; i++) {
                              if (that.data.topid == toplistmale[i]._id && mark) {
                                let num = i + 1,
                                  percent = Math.floor((1 - num / l) * 10000) / 100 + "%";
                                that.setData({
                                  top: num,
                                  toppercent: percent
                                });
                                mark = false;
                              }
                            }
                          } else {
                            let mark = true;
                            for (let i = 0; i < toplistfemale.length; i++) {
                              if (that.data.topid == toplistfemale[i]._id && mark) {
                                let num = i + 1,
                                  percent = Math.floor((1 - num / l) * 10000) / 100 + "%";
                                that.setData({
                                  top: num,
                                  toppercent: percent
                                });
                                mark = false;
                              }
                            }
                          };
                          app.globalData.toplistmale = toplistmale;
                          app.globalData.toplistfemale = toplistfemale;
                        },
                      })
                      // 数据库操作
                    }
                    wx.hideLoading()
                  }

                } else {
                  wx.hideLoading();
                  wx.showModal({
                    title: '提示',
                    content: '请返回并上传jpg,png格式的真实人脸图片，图片大小低于2MB',
                    showCancel: false,
                    success(res) {
                      wx.redirectTo({
                        url: '../index/index'
                      })
                    }
                  })
                }
              },
              fail: e => {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '请返回并上传jpg,png格式的真实人脸图片，图片大小低于2MB',
                  showCancel: false,
                  success(res) {
                    wx.redirectTo({
                      url: '../index/index'
                    })
                  }
                })
              }
            });
          }
        })
      },
      fail: err => {
        // handle error
      }
    })



  },

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
    ctx.fillText("这个小程序竟然可以测试颜值！", 59, 60);
    ctx.fillText("我的颜值得到了", 63, 84);
    ctx.setFontSize(18);
    ctx.setFillStyle("#f47983");
    ctx.fillText(_this.data.scoreFake, 167, 84);
    ctx.setFontSize(14);
    ctx.setFillStyle("#666");
    ctx.fillText("分，", 220, 84);
    ctx.fillText("超过了", 77, 108);
    ctx.setFontSize(18);
    ctx.setFillStyle("#f47983");
    ctx.fillText(_this.data.toppercent, 127, 108);
    ctx.setFontSize(14);
    ctx.setFillStyle("#666");
    ctx.fillText("的人", 197, 108);
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
  score: function() {
    wx.navigateTo({
      url: '../rankinglist/rankinglist'
    })
  },
  onUnload() {
    // wx.cloud.deleteFile({
    //   fileList: [app.globalData.fileID],
    //   success: res => {
    //     console.log(res.fileList)
    //   },
    //   fail: err => {}
    // })
  }
})