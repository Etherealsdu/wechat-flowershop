// pages/cart/cart.js
import { t } from '../../utils/i18n-util.js';

Page({
  data: {
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50,
    total: 0,
    // 国际化文本
    cartTitle: '',
    removeBtnText: '',
    subTotalText: '',
    deliveryFeeText: '',
    freeShippingText: '',
    totalText: '',
    freeDeliveryMessage: '',
    deliveryMessage: '',
    checkoutBtnText: '',
    emptyCartText: '',
    continueShoppingText: ''
  },

  onLoad: function() {
    this.initI18n(); // 初始化国际化文本
    this.loadCart();
  },

  onShow: function() {
    this.loadCart();
  },

  // 初始化国际化文本
  initI18n: function() {
    this.setData({
      cartTitle: t('cart.title'),
      removeBtnText: t('common.remove'),
      subTotalText: t('cart.subTotal'),
      deliveryFeeText: t('cart.shipping'),
      freeShippingText: t('cart.freeShipping'),
      totalText: t('common.total'),
      freeDeliveryMessage: t('messages.congratulationsFreeDelivery'),
      checkoutBtnText: t('cart.goToCheckout'),
      emptyCartText: t('cart.emptyCart'),
      continueShoppingText: t('cart.continueShopping')
    });
  },

  // 更新国际化文本
  updateI18n: function() {
    this.setData({
      cartTitle: t('cart.title'),
      removeBtnText: t('common.remove'),
      subTotalText: t('cart.subTotal'),
      deliveryFeeText: t('cart.shipping'),
      freeShippingText: t('cart.freeShipping'),
      totalText: t('common.total'),
      freeDeliveryMessage: t('messages.congratulationsFreeDelivery'),
      checkoutBtnText: t('cart.goToCheckout'),
      emptyCartText: t('cart.emptyCart'),
      continueShoppingText: t('cart.continueShopping')
    });
  },

  // 更新配送消息文本
  updateDeliveryMessage: function() {
    const amountNeeded = this.data.freeDeliveryThreshold - this.data.subtotal;
    const deliveryMessage = this.data.deliveryFee === 0
      ? ''
      : t('messages.addMoreForFreeDelivery', { amount: amountNeeded.toFixed(2) });

    this.setData({
      deliveryMessage: deliveryMessage
    });
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
    
    this.updateDeliveryMessage();
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
        title: t('cart.emptyCart'),
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

  // 全局监听语言变化
  onLocaleChange: function() {
    this.updateI18n();
    this.updateDeliveryMessage();
  },

  // 辅助函数：格式化数字
  toFixed: function(num, digits) {
    return parseFloat(num.toFixed(digits));
  }
})