// pages/flower-detail/flower-detail.js
Page({
  data: {
    flower: {},
    quantity: 1
  },

  onLoad: function(options) {
    const flowerId = parseInt(options.id);
    const app = getApp();
    
    const flower = app.globalData.flowers.find(f => f.id === flowerId);
    
    if (flower) {
      // Add some additional properties for demo purposes
      const detailedFlower = {
        ...flower,
        reviewCount: Math.floor(Math.random() * 50) + 10, // Random review count between 10-60
        features: "Premium quality flowers, carefully selected and arranged by our expert florists"
      };
      
      this.setData({
        flower: detailedFlower
      });
    }
  },

  increaseQuantity: function() {
    this.setData({
      quantity: this.data.quantity + 1
    });
  },

  decreaseQuantity: function() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  addToCart: function() {
    if (this.data.flower.stock <= 0) {
      wx.showToast({
        title: 'This item is out of stock',
        icon: 'none'
      });
      return;
    }
    
    const app = getApp();
    app.addToCart(this.data.flower, this.data.quantity);
    
    wx.showToast({
      title: 'Added to cart!',
      icon: 'success'
    });
    
    // Update cart badge in tab bar
    const cartCount = app.globalData.cart.reduce((total, item) => total + item.quantity, 0);
    wx.setTabBarBadge({
      index: 2,
      text: cartCount.toString()
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
})