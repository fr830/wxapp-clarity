//index.js
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.0/qqmap-wx-jssdk.js');
var qqmapsdk;
//获取应用实例
const app = getApp()

Page({
  data: {
    city: '杭州',
    aqi: '',
    quality: '优',
    date: '',
    lastMoniData: {},
    lastTwoWeeks: {}
  },
  //事件处理函数
  onLoad: function() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'XR6BZ-S3FKX-VUY4O-THTUZ-OWMA2-M7FWB'
    });
    this.getapi('hangzhou');
  },
  getapi: function(weizhi) {
    //获取空气信息 
    let that = this;
    wx.request({
      url: 'http://web.juhe.cn:8080/environment/air/cityair', //接口地址
      data: {
        city: weizhi,
        key: '9182edec05af05f68b4a36018182c73c' //apikey
      },
      dataType: 'text',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        res.data = res.data.replace(/\./g, '_');
        console.log(res.data);
        res.data = JSON.parse(res.data);
        that.setData({
          quality: res.data.result[0].citynow.quality,
          date: res.data.result[0].citynow.date,
          lastMoniData: res.data.result[0].lastMoniData,
          lastTwoWeeks: res.data.result[0].lastTwoWeeks
        })
        console.log(res.data.result[0])
      }
    })
  },
  addwz: function() {
    // 选择位置
    let that = this;
    wx.chooseLocation({
      success: function(res) {
        // console.log(res, "location")
        // console.log(res.name)
        // 解析坐标
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            that.setData({
              city: res.result.address_component.city.slice(0, -1)
            })
            console.log(res.result.address_component.city.slice(0, -1));
          },
          fail: function(res) {
            console.log('坐标解析失败');
            console.log(res);
          },
          complete: function(res) {
            console.log('坐标解析结束');
          }
        });
      },
      fail: function() {
        // fail
        console.log('选择位置失败');
        console.log(res);
      },
      complete: function() {
        console.log('选择位置结束');
      }
    })
  }
})