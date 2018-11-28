// pages/jcd.js
const airApi = 'https://api.zkl2333.com/environment/air/cityair';
const pmApi = 'https://api.zkl2333.com/environment/air/pm';
const apiKey = '9182edec05af05f68b4a36018182c73c';
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var queryData = JSON.parse(options.queryData);
    this.setData(
      queryData
    )
  },
})