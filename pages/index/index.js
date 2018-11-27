//index.js
// 引入腾讯地图SDK核心类
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
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: 'XR6BZ-S3FKX-VUY4O-THTUZ-OWMA2-M7FWB'
    });
    // 在加载时请求一次默认城市数据
    this.getapi('hangzhou');
  },
  getapi: function(weizhi) {
    //获取空气信息 
    let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
    /* wx.request方法发起网络请求 
    * 参数列表
    * 属性          类型                       	默认值	必填	说明	
    * url	          string	                  	        是	  开发者服务器接口地址
    * data	        string/object/ArrayBuffer	        	否  	请求的参数
    * header	      Object	                          	否  	设置请求的 header，header 中不能设置 Referer。
    *                                                         content-type  默认为 application/json
    * dataType	    string	                    json	  否  	返回的数据格式
    * success	      function                      	  	否  	接口调用成功的回调函数
    */
    wx.request({
      url: 'http://web.juhe.cn:8080/environment/air/cityair', //接口地址
      data: {
        city: weizhi, //形参
        key: '9182edec05af05f68b4a36018182c73c' //apikey
      },
      dataType: 'text', //因为带有'PM2.5'等特殊符号，不能使用默认'json'格式接受
      header: {
        'content-type': 'application/json' // 默认值
      },
      // 但请求成功返回
      success(res) { //对象属性名与key名相同可以简写，回调函数，会形成闭包
        res.data = res.data.replace(/\./g, '_'); //用正则表达式将特殊字符'.'处理为'_'
        res.data = JSON.parse(res.data); //将json字符串解析为js对象
        that.setData({ 
          //that.setData方法将接口返回的数据存入当前页面实例的data对象，实现视图绑定
          aqi: res.data.result[0].citynow.AQI,
          quality: res.data.result[0].citynow.quality,
          date: res.data.result[0].citynow.date,
          lastMoniData: res.data.result[0].lastMoniData,
          lastTwoWeeks: res.data.result[0].lastTwoWeeks
        })
        // 调试数据
        // console.log(res.data.result[0])
      }
    })
  },
  // 点击事件
  addwz: function() {
    // 选择位置
    let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
    // 
    wx.chooseLocation({
      success: function(res) {
        // 使用腾讯地图sdk解析坐标
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            that.setData({
              city: res.result.address_component.city.slice(0, -1)
            })
            that.getapi(res.result.address_component.city.slice(0, -1));
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
        console.log('选择位置失败');
        console.log(res);
      },
      complete: function() {
        console.log('选择位置结束');
      }
    })
  }
})