// pages/shop/shop.js
Page({
  data: {
    flowers: [],
    displayedFlowers: [],
    searchQuery: '',
    selectedCategory: '',
    sortIndex: 0,
    sortOptions: ['Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'],
    cartItemCount: 0
  },

  onLoad: function(options) {
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
    this.updateCartCount();
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