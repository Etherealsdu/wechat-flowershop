// pages/index/index.js
const i18nUtil = require('../../utils/i18n-util.js');
const productService = require('../../services/product.js');
const categoryService = require('../../services/category.js');

Page({
  data: {
    featuredFlowers: [],
    categories: [],
    loading: false,
    i18n: {},
    i18nLocale: 'zh'
  },

  onLoad: function(options) {
    this.updateI18nData();
    this.updateLanguageDisplay();
    this.loadFeaturedFlowers();
    this.loadCategories();
  },

  onShow: function() {
    this.updateI18nData();
    this.updateLanguageDisplay();
    this.loadFeaturedFlowers();
  },

  onPullDownRefresh: function() {
    this.loadFeaturedFlowers();
    this.loadCategories();
    wx.stopPullDownRefresh();
  },

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
      seeAll: i18nUtil.t('common.seeAll'),
      loading: i18nUtil.t('common.loading') || 'Loading...',
      noData: i18nUtil.t('common.noData') || 'No data'
    };

    this.setData({
      i18n: i18nData
    });
  },

  updateLanguageDisplay: function() {
    const currentLocale = i18nUtil.getCurrentLocale();
    this.setData({
      i18nLocale: currentLocale
    });
  },

  loadFeaturedFlowers: function() {
    const app = getApp();
    this.setData({ loading: true });

    // 首先尝试从后端获取精选商品
    productService.getFeaturedProducts(4)
      .then(products => {
        const transformedProducts = productService.transformProducts(
          Array.isArray(products) ? products : [products]
        );

        // 根据当前语言更新显示
        const currentLocale = i18nUtil.getCurrentLocale();
        transformedProducts.forEach(flower => {
          flower.name = currentLocale === 'zh' ? flower.name_zh : flower.name_en;
          flower.description = currentLocale === 'zh' ? flower.description_zh : flower.description_en;
        });

        this.setData({
          featuredFlowers: transformedProducts.slice(0, 4),
          loading: false
        });
      })
      .catch(err => {
        console.log('Using local data for featured flowers:', err);
        // 如果后端请求失败，使用本地数据
        const allFlowers = app.globalData.flowers;
        const sortedFlowers = [...allFlowers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        this.setData({
          featuredFlowers: sortedFlowers.slice(0, 4),
          loading: false
        });
      });
  },

  loadCategories: function() {
    const app = getApp();

    // 尝试从后端获取分类
    categoryService.getCategoryList({ isActive: true })
      .then(res => {
        const categories = res.data || res;
        const transformedCategories = categoryService.transformCategories(
          Array.isArray(categories) ? categories : [categories]
        );

        // 根据当前语言更新显示
        const currentLocale = i18nUtil.getCurrentLocale();
        transformedCategories.forEach(cat => {
          if (cat.name_zh && cat.name_en) {
            cat.name = currentLocale === 'zh' ? cat.name_zh : cat.name_en;
          }
        });

        this.setData({
          categories: transformedCategories
        });

        // 同时更新全局数据
        app.globalData.categories = transformedCategories;
      })
      .catch(err => {
        console.log('Using local categories:', err);
        // 使用本地分类数据
        this.setData({
          categories: app.globalData.categories || []
        });
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
    const categoryId = e.currentTarget.dataset.categoryid;
    wx.navigateTo({
      url: `/pages/shop/shop?category=${category}&categoryId=${categoryId || ''}`
    });
  },

  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    const app = getApp();

    if (lang && app.switchLanguage(lang)) {
      this.updateI18nData();
      this.updateLanguageDisplay();
      this.loadFeaturedFlowers();
      this.loadCategories();
    }
  }
});
