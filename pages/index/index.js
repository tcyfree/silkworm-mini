//index.js
//获取应用实例
const app = getApp();
// 页面声明全局变量var that
var that;
Page({
  data: {
    reupload: false,
    imgList: [],
    imgMaxNumber: 1,
    imageUrl: '',
    tableHeader: [{
        prop: 'category',
        width: 150,
        label: '目标类别',
      },
      {
        prop: 'result',
        width: 152,
        label: '结果'
      },
      {
        prop: 'measure',
        width: 152,
        label: '措施'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    row: '',
    msg: '暂无数据'
  },
  //事件处理函数
  bindViewTap: function () {

  },
  onLoad: function () {
    that = this;
  },

  ChooseImage() {
    wx.chooseImage({
      count: this.data.imgMaxNumber, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths,
            imageUrl: res.tempFilePaths
          })
        }
      }
    });
  },

  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  DelImg(e) {
    wx.showModal({
      title: '确定删除这张图片吗？',
      cancelText: '再看看',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList,
            row:''
          })
        }
      }
    })
  },

  uploadPhoto(filePath) {
    return wx.cloud.uploadFile({
      cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000000)}.png`,
      filePath
    })
  },

  reuploadImgs() {
    wx.chooseImage({
      count: this.data.imgMaxNumber, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: res.tempFilePaths,
            reupload: false,
            row:''
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths,
            imageUrl: res.tempFilePaths
          })
        }
      }
    });
  },

  uploadImgs() {
    wx.showLoading({
      title: 'AI预测中',
      mask: true
    })
    wx.uploadFile({
      filePath: this.data.imageUrl[0],
      name: 'file',
      url: 'https://cxy.ssdlab.cn/upload',
      success: function (res) {
        console.log('[上传文件] 成功：', res)
        // json字符串转json对象
        let data = JSON.parse(res.data)
        wx.showToast({
          title: "预测成功",
        })
        console.log(data)
        var details = []
        var i = 0
        var j = 0
        for (var key in data.image_info) {
          j = 0
          details[i] = {}
          details[i]['category'] = key
          var items = data.image_info[key]
          for (var k in items) {
            j++;
            if (j == 1) {
              details[i]['result'] = items[k]
            } else {
              details[i]['measure'] = items[k]
            }
          }
          i++;
        }
        that.setData({
          imgList: [data.draw_url],
          row: details,
          reupload: true
        })
        console.log('[上传文件] 成功：', that.data.imgList[0])
      },
      fail: function (res) {
        console.log(res);
        wx.showToast({
          title: '请求超时，请重新尝试' + res.errMsg,
        })
      }
    })
  }
})