// pages/index/index.js
const i18nUtil = require('../../utils/i18n-util.js');

Page({
  data: {
    featuredFlowers: [],
    i18n: {}, // 存储国际化文本
    i18nLocale: 'zh' // 当前语言
  },

  onLoad: function(options) {
    this.updateI18nData();
    this.updateLanguageDisplay();
    this.loadFeaturedFlowers();
  },

  onShow: function() {
    // Refresh data when page is shown
    this.updateI18nData();
    this.updateLanguageDisplay();
    this.loadFeaturedFlowers();
  },

  // 更新国际化数据
  updateI18nData: function() {
    const i18nData = {
      welcomeTitle: i18nUtil.t('index.welcomeTitle'),
      featuredFlowers: i18nUtil.t('index.featuredFlowers'),
      categories: i18nUtil.t('index.categories'),
      specialOffers: i18nUtil.t('index.specialOffers'),
      freeDelivery: i18nUtil.t('index.freeDelivery'),
      limitedTime: i18nUtil.t('index.limitedTime'),
      roses: i18nUtil.t('index.roses'),
      sunflowers: i18nUtil.t('index.sunflowers'),
      arrangements: i18nUtil.t('index.arrangements'),
      plants: i18nUtil.t('index.plants'),
      seeAll: i18nUtil.t('common.seeAll')
    };
    
    this.setData({
      i18n: i18nData
    });
  },
  
  // 更新语言显示
  updateLanguageDisplay: function() {
    const currentLocale = i18nUtil.getCurrentLocale();
    this.setData({
      i18nLocale: currentLocale
    });
  },

  loadFeaturedFlowers: function() {
    const app = getApp();
    // Get top 4 highest rated flowers as featured
    const allFlowers = app.globalData.flowers;
    const sortedFlowers = [...allFlowers].sort((a, b) => b.rating - a.rating);
    this.setData({
      featuredFlowers: sortedFlowers.slice(0, 4)
    });
  },

  goToShop: function() {
    wx.switchTab({
      url: '/pages/shop/shop'
    });
  },

  viewFlowerDetail: function(e) {
    const flower = e.currentTarget.dataset.flower;
    wx.navigateTo({
      url: `/pages/flower-detail/flower-detail?id=${flower.id}`
    });
  },

  goToCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    wx.navigateTo({
      url: `/pages/shop/shop?category=${category}`
    });
  },
  
  // 切换语言的方法
  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    const app = getApp();
    
    if (lang && app.switchLanguage(lang)) {
      // 重新加载页面以更新语言
      this.updateI18nData();
      this.updateLanguageDisplay();
      this.loadFeaturedFlowers();
    }
  }
})