// pages/checkout/checkout.js
import { t } from '../../utils/i18n-util.js';

Page({
  data: {
    address: null,
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50,
    discount: 0,
    total: 0,
    selectedDeliveryTime: 'standard',
    deliveryOptions: [],
    specialInstructions: '',
    // 国际化文本
    i18n: {}
  },

  onLoad: function() {
    this.initI18n();
    this.loadCartAndCalculate();
    this.loadAddress();
  },

  onShow: function() {
    this.loadAddress();
  },

  // 初始化国际化文本
  initI18n: function() {
    const i18nData = {
      title: t('checkout.title'),
      deliveryAddress: t('checkout.deliveryAddress'),
      addAddress: t('checkout.addAddress'),
      editAddress: t('checkout.editAddress'),
      noAddress: t('checkout.noAddress'),
      deliveryTime: t('checkout.deliveryTime'),
      specialInstructions: t('checkout.specialInstructions'),
      specialInstructionsPlaceholder: t('checkout.specialInstructionsPlaceholder'),
      orderSummary: t('checkout.orderSummary'),
      subtotal: t('checkout.subtotal'),
      deliveryFee: t('checkout.deliveryFee'),
      freeDelivery: t('checkout.freeDelivery'),
      discount: t('checkout.discount'),
      total: t('common.total'),
      placeOrder: t('checkout.placeOrder'),
      back: t('common.back'),
      processing: t('common.processing'),
      addAddressRequired: t('messages.addAddressRequired'),
      orderPlacedSuccess: t('messages.orderPlacedSuccess')
    };

    // 配送选项国际化
    const deliveryOptions = [
      {
        value: 'standard',
        label: t('checkout.standardDelivery'),
        time: t('checkout.within24Hours'),
        price: 0
      },
      {
        value: 'express',
        label: t('checkout.expressDelivery'),
        time: t('checkout.within2to4Hours'),
        price: 9.99
      },
      {
        value: 'scheduled',
        label: t('checkout.scheduledDelivery'),
        time: t('checkout.chooseTimeSlot'),
        price: 0
      }
    ];

    this.setData({
      i18n: i18nData,
      deliveryOptions: deliveryOptions
    });
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
    const deliveryFee = subtotal >= this.data.freeDeliveryThreshold ? 0 : this.data.deliveryFee;
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
        title: this.data.i18n.addAddressRequired,
        icon: 'none'
      });
      return;
    }

    // 验证购物车不为空
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: t('cart.emptyCart'),
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.i18n.processing
    });

    setTimeout(() => {
      wx.hideLoading();

      const app = getApp();
      const orderDetails = {
        deliveryAddress: this.data.address,
        deliveryTime: this.data.selectedDeliveryTime,
        specialInstructions: this.data.specialInstructions,
        paymentMethod: 'credit_card'
      };

      const order = app.placeOrder(orderDetails);

      wx.showToast({
        title: this.data.i18n.orderPlacedSuccess,
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/profile/profile'
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
