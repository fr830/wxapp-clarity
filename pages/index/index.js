//index.js
// 引入腾讯地图SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.0/qqmap-wx-jssdk.js');
var qqmapsdk;
// const airApi = 'https://api.zkl2333.com/environment/air/cityair';
const airApi = 'https://api.dhteam.cn/air/cityair';
const pmApi = 'https://api.dhteam.cn/air/pm';
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
        "date": "2008-11-28 14:00",
        "lastMoniData": {},
        "lastTwoWeeks": {},
        "markers": [],
        "id": 1
    },
    //事件处理函数
    onLoad: function() {
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: mapKey
        });
        // 在加载时请求一次默认城市数据
        this.getapi(this.data.city);
    },
    getapi: function(weizhi) {
        //获取空气信息 
        let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
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
                res.data = JSON.parse(res.data.replace(/\./g, '_')); //用正则表达式将特殊字符'.'处理为'_',将json字符串解析为js对象
                let markers = [];
                for (let v in res.data.result[0].lastMoniData) {
                    markers.push({
                        callout: {
                            content: res.data.result[0].lastMoniData[v].city + '\nAQI: ' + res.data.result[0].lastMoniData[v].AQI + '\nPM2.5 : ' + res.data.result[0].lastMoniData[v].PM2_5Hour,
                            // display: 'ALWAYS',
                            padding: 10,
                            borderRadius: 5,
                            bgColor: '#999'
                        },
                        title: res.data.result[0].lastMoniData[v].city,
                        id: v,
                        latitude: res.data.result[0].lastMoniData[v].lat.replace(/_/g, '.'),
                        longitude: res.data.result[0].lastMoniData[v].lon.replace(/_/g, '.'),
                        label: {
                            content: res.data.result[0].lastMoniData[v].city,
                            color: '#fff',
                        },
                        width: 20,
                        height: 20
                    })
                }
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
                that.setData({
                    //that.setData方法将接口返回的数据存入当前页面实例的data对象，实现视图绑定
                    AQI: res.data.result[0].AQI.replace(/_/g, '.'),
                    CO: res.data.result[0].CO.replace(/_/g, '.'),
                    NO2: res.data.result[0].NO2.replace(/_/g, '.'),
                    O3: res.data.result[0].O3.replace(/_/g, '.'),
                    PM2_5: res.data.result[0].PM2_5.replace(/_/g, '.'),
                    PM10: res.data.result[0].PM10.replace(/_/g, '.'),
                    SO2: res.data.result[0].SO2.replace(/_/g, '.')
                })
            }
        })
    },
    onShow: function() {
        let that = this;
        wx.getStorage({
            key: 'jcdId',
            success(res) {
                that.setData({
                    id: res.data
                })
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