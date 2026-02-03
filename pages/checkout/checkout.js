// pages/checkout/checkout.js
Page({
  data: {
    address: null,
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    discount: 0,
    total: 0,
    selectedDeliveryTime: 'standard',
    deliveryOptions: [
      { value: 'standard', label: 'Standard Delivery', time: 'Within 24 hours', price: 0 },
      { value: 'express', label: 'Express Delivery', time: 'Within 2-4 hours', price: 9.99 },
      { value: 'scheduled', label: 'Scheduled Delivery', time: 'Choose time slot', price: 0 }
    ],
    specialInstructions: ''
  },

  onLoad: function() {
    this.loadCartAndCalculate();
    this.loadAddress();
  },

  loadCartAndCalculate: function() {
    const app = getApp();
    const cart = app.globalData.cart;
    
    this.setData({
      cartItems: cart
    });
    
    this.calculateTotals();
  },

  loadAddress: function() {
    const address = wx.getStorageSync('deliveryAddress') || null;
    this.setData({
      address: address
    });
  },

  calculateTotals: function() {
    const subtotal = this.data.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 50 ? 0 : this.data.deliveryFee;
    const total = subtotal + deliveryFee - this.data.discount;
    
    this.setData({
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total
    });
  },

  onDeliveryTimeChange: function(e) {
    this.setData({
      selectedDeliveryTime: e.detail.value
    });
  },

  onInstructionsInput: function(e) {
    this.setData({
      specialInstructions: e.detail.value
    });
  },

  addAddress: function() {
    wx.navigateTo({
      url: '/pages/profile/profile?mode=addAddress'
    });
  },

  editAddress: function() {
    wx.navigateTo({
      url: '/pages/profile/profile?mode=editAddress'
    });
  },

  placeOrder: function() {
    if (!this.data.address) {
      wx.showToast({
        title: 'Please add a delivery address',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: 'Processing...'
    });

    setTimeout(() => {
      wx.hideLoading();
      
      const app = getApp();
      const orderDetails = {
        deliveryAddress: this.data.address,
        deliveryTime: this.data.selectedDeliveryTime,
        specialInstructions: this.data.specialInstructions,
        paymentMethod: 'credit_card' // Simplified for demo
      };

      const order = app.placeOrder(orderDetails);

      wx.showToast({
        title: 'Order placed successfully!',
        icon: 'success'
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/orders/orders'
        });
      }, 1500);
    }, 2000);
  },

  goBack: function() {
    wx.navigateBack();
  },

  toFixed: function(num, digits) {
    return parseFloat(num.toFixed(digits));
  }
})