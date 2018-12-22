//index.js

import F2 from '@antv/wx-f2'; // 注：也可以不引入， initChart 方法已经将 F2 传入，如果需要引入，注意需要安装 @antv/wx-f2 依赖

const api = 'https://api.dhteam.cn/water/';

const info = {
    DO: {
        NameCH: "溶解氧",
        Unit: 'mg/l'
    },
    CODMn: {
        NameCH: "高锰酸盐指数",
        Unit: 'mg/l'
    },
    NH3N: {
        NameCH: "氨氮",
        Unit: 'mg/l'
    },
    TP: {
        NameCH: "总磷",
        Unit: 'mg/l'
    },
    ORP: {
        NameCH: "氧化还原电位",
        Unit: 'mv'
    },
    Transp: {
        NameCH: "透明度",
        Unit: 'mg/l'
    },
}

const app = getApp()
Page({
    data: {
        multiArray: [
            [],
            []
        ],
        multiIndex: [0, 0],
        opts: {
            lazyLoad: true
        },
        a: 'DO',
        riverId: 24,
    },
    getapi: function(riverId) {
        let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
        wx.request({
            url: api + 'oneriver', //接口地址
            data: {
                riverId
            },
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                console.log(res.data)
                let data = res.data.data
                data.riverLength = Number(data.riverLength).toFixed(2) + 'km'
                that.setData({
                    river: {
                        name: data.riverName,
                        districtName: data.districtName,
                        riverSerialNum: data.riverSerialNum,
                        startingPoint: data.startingPoint,
                        endingPoint: data.endingPoint,
                        riverLength: data.riverLength,
                        picPath: data.picPath,
                        target: data.target,
                        responsibility: data.responsibility,
                    }
                })
            }
        })
        wx.request({
            url: api + 'riverquality', //接口地址
            data: {
                riverId
            },
            success(res) {
                console.log(res.data)
                if (res.data.status == 'ok') {
                    let now = {};
                    for (let i = 0; i < 6; i++) {
                        let k = res.data.data[i].NameEN
                        let v = res.data.data[i].Value
                        now[k] = v
                    }
                    that.setData({
                        now,
                        q: {
                            ...res.data.data
                        }
                    })
                    const data = [];
                    for (let i in res.data.data) {
                        let uploadTime = Number(res.data.data[i].uploadTime)
                        let Value = res.data.data[i].Value
                        let NameCH = res.data.data[i].NameCH
                        let NameEN = res.data.data[i].NameEN
                        let Unit = res.data.data[i].Unit
                        if (res.data.data[i].NameEN == "TP") {
                            data.push({
                                uploadTime,
                                Value,
                            })
                        }
                    }
                    that.chartComponent = that.selectComponent('#waterQ-chart');
                    that.chartComponent.init((canvas, width, height) => {
                        // 获取组件的 canvas、width、height 后的回调函数
                        // 开始初始化图表
                        const chart = new F2.Chart({
                            el: canvas,
                            width,
                            height
                        });
                        chart.source(data, {
                            uploadTime: {
                                type: 'timeCat',
                                mask: "YY/MM",
                                range: [0, 1]
                            },
                            Value: {
                                min: 0,
                            }
                        });
                        chart.tooltip({
                            // showTitle: true, // 展示  tooltip 的标题
                            showCrosshairs: true,
                            // custom: true, // 自定义 tooltip 内容框
                            onShow: function(ev) {
                                var items = ev.items;
                                items[0].name = info[that.data.a].NameCH;
                                items[0].value = items[0].value + info[that.data.a].Unit
                            },
                        });
                        chart.line().position('uploadTime*Value').shape('smooth').color('#fff');
                        chart.area().position('uploadTime*Value').shape('smooth').color("#fff");
                        chart.render();
                        that.chart = chart;
                        return chart;
                    });
                }
            }
        })
    },
    getDistrict: function getDistrict() {
        let that = this;
        wx.request({
            url: api + 'reverLists', //接口地址
            success(res) {
                let multiArray = that.data.multiArray
                let multiIndex = that.data.multiIndex
                for (let i in res.data.data) {
                    multiArray[0].push(res.data.data[i].districtName)
                }
                for (let i in res.data.data[0].rivers) {
                    multiArray[1].push(res.data.data[0].rivers[i].riverName)
                }
                let riverId = res.data.data[multiIndex[0]].rivers[multiIndex[1]].riverId
                that.getapi(riverId)
                that.setData({
                    Riverlist: res.data.data,
                    multiArray
                })
            }
        })
    },
    bindMultiPickerColumnChange: function(e) {
        let that = this;
        if (e.detail.column == 0) {
            let multiArray = that.data.multiArray
            let Riverlist = that.data.Riverlist
            let riverList = []
            for (let i in Riverlist[e.detail.value].rivers) {
                riverList.push(Riverlist[e.detail.value].rivers[i].riverName)
            }
            multiArray[1] = riverList
            that.setData({
                multiArray
            })
        }
    },
    bindMultiPickerChange: function(e) {
        let Riverlist = this.data.Riverlist
        let riverId = Riverlist[e.detail.value[0]].rivers[e.detail.value[1]].riverId
        this.setData({
            multiIndex: e.detail.value,
            riverId
        })
        this.getapi(riverId)
    },
    onLoad: function() {
        this.getDistrict()
    },
    onShow: function() {},
    // 点击事件
    addwz: function() {
        // 选择位置
        let that = this; //将当前作用域this保留到变量that，以便在闭包中还原
    },
    gotoAir: function() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    change: function(e) {
        let that = this
        this.setData({
            a: e.currentTarget.id
        })
        let data = [];
        for (let i in this.data.q) {
            let uploadTime = Number(this.data.q[i].uploadTime)
            let Value = this.data.q[i].Value
            if (this.data.q[i].NameEN == this.data.a) {
                data.push({
                    uploadTime,
                    Value
                })
            }
        }
        this.chart.tooltip({
            showCrosshairs: true,
            onShow: function(ev) {
                var items = ev.items;
                items[0].name = info[that.data.a].NameCH;
                items[0].value = items[0].value + info[that.data.a].Unit
            },
        });
        this.chart.changeData(data)
    }
})