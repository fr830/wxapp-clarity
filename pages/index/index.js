//index.js
// 引入腾讯地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.0/qqmap-wx-jssdk.js');
var qqmapsdk;
const airApi = 'http://web.juhe.cn:8080/environment/air/cityair';
const pmApi = 'http://web.juhe.cn:8080/environment/air/pm';
const apiKey = '9182edec05af05f68b4a36018182c73c';
const mapKey = 'NGCBZ-GTC33-37E3V-YBJ4M-OYAWK-6CB24'
//获取应用实例
const app = getApp()

Page({
  data: {
    "city": "杭州",
    "PM2_5": "73",
    /*PM2.5指数(ug/m3)*/
    "aqi": "98",
    /*空气质量指数*/
    "quality": "良",
    /*空气质量*/
    "PM10": "50",
    /*PM10(ug/m3)*/
    "CO": "0.79",
    /*一氧化碳(mg/m3)*/
    "NO2": "65",
    /*二氧化氮(ug/m3)*/
    "O3": "28",
    /*臭氧(ug/m3)*/
    "SO2": "41",
    /*二氧化硫(ug/m3)*/
    "location": {
      "lat": 30.274085,
      "lng": 120.15507
    },
    "date": "2018-11-28 14:00",
    "lastMoniData": {
      "1": {
        "city": "滨江",
        "AQI": "85",
        "America_AQI": "146",
        "quality": "良",
        "PM2_5Hour": "63",
        "PM2_5Day": "63",
        "PM10Hour": "96",
        "lat": "30_21",
        "lon": "120_210833"
      },
      "2": {
        "city": "西溪",
        "AQI": "88",
        "America_AQI": "146",
        "quality": "良",
        "PM2_5Hour": "63",
        "PM2_5Day": "63",
        "PM10Hour": "125",
        "lat": "30_27472222",
        "lon": "120_0633333"
      }
    },
    "lastTwoWeeks": {
      "1": {
        "city": "杭州",
        "AQI": "49",
        "quality": "优",
        "date": "2018-10-31"
      },
      "2": {
        "city": "杭州",
        "AQI": "43",
        "quality": "优",
        "date": "2018-11-01"
      }
    },
    "markers": [{
      "iconPath": "/img/air2.png",
      "title": "云栖",
      "id": "11",
      "latitude": "30.18083333",
      "longitude": "120.0883333",
      "label": {
        "content": "云栖",
        "color": "#fff",
        "anchorX": "10",
        "anchorY": "-20"
      },
      "width": 20,
      "height": 20
    }],
  },
  //事件处理函数
  onLoad: function () {
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: mapKey
    });
    // 在加载时请求一次默认城市数据
    // this.getapi('hangzhou');
  },
  getapi: function (weizhi) {
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
      url: airApi, //接口地址
      data: {
        city: weizhi, //位置
        key: apiKey //apikey
      },
      dataType: 'text', //因为带有'PM2.5'等特殊符号，不能使用默认'json'格式接受
      header: {
        'content-type': 'application/json' // 默认值
      },
      // 但请求成功返回
      success(res) { //对象属性名与key名相同可以简写，回调函数，会形成闭包
        let Ores = JSON.parse(res.data); //将json字符串解析为js对象
        let markers = [];
        for (let v in Ores.result[0].lastMoniData) {
          markers.push({
            iconPath: "/img/air2.png",
            title: Ores.result[0].lastMoniData[v].city,
            id: v,
            latitude: Ores.result[0].lastMoniData[v].lat,
            longitude: Ores.result[0].lastMoniData[v].lon,
            label: {
              content: Ores.result[0].lastMoniData[v].city,
              color: '#fff',
              anchorX: '10',
              anchorY: '-20',
            },
            width: 20,
            height: 20
          })
        }
        res.data = JSON.parse(res.data.replace(/\./g, '_')); //用正则表达式将特殊字符'.'处理为'_',将json字符串解析为js对象
        // let quality = res.data.result[0].citynow.AQI
        // 标记点
        that.setData({
          //that.setData方法将接口返回的数据存入当前页面实例的data对象，实现视图绑定
          aqi: res.data.result[0].citynow.AQI,
          quality: res.data.result[0].citynow.quality,
          date: res.data.result[0].citynow.date,
          lastMoniData: res.data.result[0].lastMoniData,
          lastTwoWeeks: res.data.result[0].lastTwoWeeks,
          markers: markers
        })
        // 调试数据
        // console.log(res.data.result[0])
      }
    })
    wx.request({
      url: pmApi, //接口地址
      data: {
        city: weizhi, //位置
        key: apiKey //apikey
      },
      dataType: 'text', //因为带有'PM2.5'等特殊符号，不能使用默认'json'格式接受
      header: {
        'content-type': 'application/json'
      },
      // 但请求成功返回
      success(res) {
        res.data = JSON.parse(res.data.replace(/\./g, '_'));

      }
    })
  },
  // 点击事件
  addwz: function () {
    // 选择位置
    let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
    // 
    wx.chooseLocation({
      success: function (res) {
        // 使用腾讯地图sdk解析坐标
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            console.log(res)
            that.setData({
              location: {
                lat: res.result.location.lat,
                lng: res.result.location.lng
              },
              city: res.result.address_component.city.slice(0, -1)
            })
            that.getapi(res.result.address_component.city.slice(0, -1));
          },
          fail: function (res) {
            console.log('坐标解析失败');
            console.log(res);
          },
          complete: function (res) {
            console.log('坐标解析结束');
          }
        });
      },
      fail: function () {
        console.log('选择位置失败');
        console.log(res);
      },
      complete: function () {
        console.log('选择位置结束');
      }
    })
  }
})