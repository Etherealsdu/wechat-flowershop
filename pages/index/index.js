// pages/index/index.js
Page({
  data: {
    featuredFlowers: []
  },

  onLoad: function(options) {
    this.loadFeaturedFlowers();
  },

  onShow: function() {
    // Refresh data when page is shown
    this.loadFeaturedFlowers();
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
  }
})