// pages/shop/shop.js
const i18nUtil = require('../../utils/i18n-util.js');

Page({
  data: {
    flowers: [],
    displayedFlowers: [],
    searchQuery: '',
    selectedCategory: '',
    sortIndex: 0,
    sortOptions: [], // 将在 updateI18nData 中设置
    cartItemCount: 0,
    i18n: {} // 国际化文本
  },

  onLoad: function(options) {
    this.updateI18nData();
    const app = getApp();
    this.setData({
      flowers: app.globalData.flowers,
      displayedFlowers: app.globalData.flowers
    });
    
    this.updateCartCount();
    
    // Apply category filter if passed from another page
    if (options.category) {
      this.selectCategory({ currentTarget: { dataset: { category: options.category } } });
    }
  },

  onShow: function() {
    this.updateI18nData();
    this.updateCartCount();
  },
  
  // 更新国际化数据
  updateI18nData: function() {
    const i18nData = {
      title: i18nUtil.t('shop.title'),
      all: i18nUtil.t('shop.all'),
      sortBy: i18nUtil.t('shop.sortBy'),
      sortByPriceLow: i18nUtil.t('shop.sortByPriceLow'),
      sortByPriceHigh: i18nUtil.t('shop.sortByPriceHigh'),
      sortByRating: i18nUtil.t('shop.sortByRating'),
      filter: i18nUtil.t('shop.filter'),
      resetFilters: i18nUtil.t('shop.resetFilters'),
      addToCart: i18nUtil.t('common.addToCart'),
      buyNow: i18nUtil.t('common.buyNow'),
      price: i18nUtil.t('common.price'),
      originalPrice: i18nUtil.t('common.originalPrice'),
      quantity: i18nUtil.t('common.quantity'),
      total: i18nUtil.t('common.total'),
      confirm: i18nUtil.t('common.confirm'),
      cancel: i18nUtil.t('common.cancel'),
      back: i18nUtil.t('common.back'),
      more: i18nUtil.t('common.more'),
      loading: i18nUtil.t('common.loading'),
      noData: i18nUtil.t('common.noData'),
      refresh: i18nUtil.t('common.refresh'),
      settings: i18nUtil.t('common.settings'),
      language: i18nUtil.t('common.language'),
      chinese: i18nUtil.t('common.chinese'),
      english: i18nUtil.t('common.english')
    };
    
    // 更新排序选项
    const sortOptions = [
      i18nUtil.t('shop.sortByPriceLow'),
      i18nUtil.t('shop.sortByPriceHigh'),
      i18nUtil.t('shop.sortByRating'),
      i18nData.newest || 'Newest' // 如果没有定义"最新"则使用默认值
    ];
    
    this.setData({
      i18n: i18nData,
      sortOptions: sortOptions
    });
  },

  onSearchInput: function(e) {
    this.setData({
      searchQuery: e.detail.value
    });
    this.performSearch();
  },

  performSearch: function() {
    let filteredFlowers = [...this.data.flowers];
    
    // Apply search filter
    if (this.data.searchQuery) {
      const query = this.data.searchQuery.toLowerCase();
      filteredFlowers = filteredFlowers.filter(flower => 
        flower.name.toLowerCase().includes(query) || 
        flower.description.toLowerCase().includes(query) ||
        flower.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (this.data.selectedCategory) {
      filteredFlowers = filteredFlowers.filter(flower => 
        flower.category === this.data.selectedCategory
      );
    }
    
    // Apply sorting
    filteredFlowers = this.applySorting(filteredFlowers);
    
    this.setData({
      displayedFlowers: filteredFlowers
    });
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
    this.performSearch();
  },

  onSortChange: function(e) {
    this.setData({
      sortIndex: parseInt(e.detail.value)
    });
    this.performSearch();
  },

  applySorting: function(flowers) {
    const sortedFlowers = [...flowers];
    
    switch(this.data.sortIndex) {
      case 0: // Price: Low to High
        return sortedFlowers.sort((a, b) => a.price - b.price);
      case 1: // Price: High to Low
        return sortedFlowers.sort((a, b) => b.price - a.price);
      case 2: // Rating
        return sortedFlowers.sort((a, b) => b.rating - a.rating);
      case 3: // Newest (by ID)
        return sortedFlowers.sort((a, b) => b.id - a.id);
      default:
        return sortedFlowers;
    }
  },

  viewFlowerDetail: function(e) {
    const flower = e.currentTarget.dataset.flower;
    wx.navigateTo({
      url: `/pages/flower-detail/flower-detail?id=${flower.id}`
    });
  },

  goToCart: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  updateCartCount: function() {
    const app = getApp();
    const count = app.globalData.cart.reduce((total, item) => total + item.quantity, 0);
    this.setData({
      cartItemCount: count
    });
  }
})