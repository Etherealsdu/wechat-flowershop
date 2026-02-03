// pages/cart/cart.js
Page({
  data: {
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50,
    total: 0
  },

  onLoad: function() {
    this.loadCart();
  },

  onShow: function() {
    this.loadCart();
  },

  loadCart: function() {
    const app = getApp();
    const cart = app.globalData.cart;
    
    this.setData({
      cartItems: cart
    });
    
    this.calculateTotals();
  },

  calculateTotals: function() {
    const subtotal = this.data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= this.data.freeDeliveryThreshold ? 0 : this.data.deliveryFee;
    const total = subtotal + deliveryFee;
    
    this.setData({
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total
    });
  },

  increaseQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    app.updateCartQuantity(id, this.getQuantityById(id) + 1);
    this.loadCart();
  },

  decreaseQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    app.updateCartQuantity(id, Math.max(1, this.getQuantityById(id) - 1));
    this.loadCart();
  },

  getQuantityById: function(id) {
    const item = this.data.cartItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  },

  removeFromCart: function(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    app.removeFromCart(id);
    this.loadCart();
  },

  proceedToCheckout: function() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: 'Your cart is empty',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  goToShop: function() {
    wx.switchTab({
      url: '/pages/shop/shop'
    });
  },

  toFixed: function(num, digits) {
    return parseFloat(num.toFixed(digits));
  }
})