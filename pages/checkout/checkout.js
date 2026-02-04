// pages/checkout/checkout.js
const i18nUtil = require('../../utils/i18n-util.js');
const cartService = require('../../services/cart.js');
const orderService = require('../../services/order.js');
const userService = require('../../services/user.js');

Page({
  data: {
    address: null,
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 99,
    discount: 0,
    total: 0,
    selectedDeliveryTime: 'standard',
    deliveryOptions: [],
    specialInstructions: '',
    loading: false,
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

  initI18n: function() {
    const currentLocale = i18nUtil.getCurrentLocale();

    const i18nData = {
      title: i18nUtil.t('checkout.title') || 'Checkout',
      deliveryAddress: i18nUtil.t('checkout.deliveryAddress') || 'Delivery Address',
      addAddress: i18nUtil.t('checkout.addAddress') || 'Add Address',
      editAddress: i18nUtil.t('checkout.editAddress') || 'Edit',
      orderSummary: i18nUtil.t('checkout.orderSummary') || 'Order Summary',
      deliveryTime: i18nUtil.t('checkout.deliveryTime') || 'Delivery Time',
      specialInstructions: i18nUtil.t('checkout.specialInstructions') || 'Special Instructions',
      instructionsPlaceholder: i18nUtil.t('checkout.instructionsPlaceholder') || 'Add any special instructions...',
      subTotal: i18nUtil.t('cart.subTotal') || 'Subtotal',
      shipping: i18nUtil.t('cart.shipping') || 'Shipping',
      freeShipping: i18nUtil.t('cart.freeShipping') || 'Free Shipping',
      discount: i18nUtil.t('checkout.discount') || 'Discount',
      total: i18nUtil.t('common.total') || 'Total',
      placeOrder: i18nUtil.t('checkout.placeOrder') || 'Place Order',
      processing: currentLocale === 'zh' ? '处理中...' : 'Processing...',
      orderSuccess: currentLocale === 'zh' ? '下单成功！' : 'Order placed successfully!',
      addAddressFirst: currentLocale === 'zh' ? '请先添加收货地址' : 'Please add a delivery address',
      orderFailed: currentLocale === 'zh' ? '下单失败，请重试' : 'Order failed, please try again'
    };

    // 配送选项
    const deliveryOptions = [
      {
        value: 'standard',
        label: currentLocale === 'zh' ? '标准配送' : 'Standard Delivery',
        time: currentLocale === 'zh' ? '24小时内' : 'Within 24 hours',
        price: 0
      },
      {
        value: 'express',
        label: currentLocale === 'zh' ? '加急配送' : 'Express Delivery',
        time: currentLocale === 'zh' ? '2-4小时内' : 'Within 2-4 hours',
        price: 9.99
      },
      {
        value: 'scheduled',
        label: currentLocale === 'zh' ? '预约配送' : 'Scheduled Delivery',
        time: currentLocale === 'zh' ? '选择时间段' : 'Choose time slot',
        price: 0
      }
    ];

    this.setData({
      i18n: i18nData,
      deliveryOptions: deliveryOptions
    });
  },

  loadCartAndCalculate: function() {
    // 获取选中的购物车商品
    const selectedItems = cartService.getSelectedItems();
    const currentLocale = i18nUtil.getCurrentLocale();

    // 更新商品名称
    selectedItems.forEach(item => {
      if (item.name_zh && item.name_en) {
        item.name = currentLocale === 'zh' ? item.name_zh : item.name_en;
      }
    });

    this.setData({
      cartItems: selectedItems
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

    // 运费计算
    let deliveryFee = this.data.deliveryFee;
    if (subtotal >= this.data.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    // 加急配送额外费用
    const selectedOption = this.data.deliveryOptions.find(opt => opt.value === this.data.selectedDeliveryTime);
    if (selectedOption && selectedOption.price > 0) {
      deliveryFee += selectedOption.price;
    }

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
    this.calculateTotals();
  },

  onInstructionsInput: function(e) {
    this.setData({
      specialInstructions: e.detail.value
    });
  },

  addAddress: function() {
    // 调用微信地址选择
    wx.chooseAddress({
      success: (res) => {
        const address = {
          name: res.userName,
          phone: res.telNumber,
          province: res.provinceName,
          city: res.cityName,
          district: res.countyName,
          detail: res.detailInfo,
          fullAddress: `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`
        };

        wx.setStorageSync('deliveryAddress', address);
        this.setData({
          address: address
        });
      },
      fail: (err) => {
        console.log('Choose address failed:', err);
      }
    });
  },

  editAddress: function() {
    this.addAddress();
  },

  placeOrder: function() {
    if (!this.data.address) {
      wx.showToast({
        title: this.data.i18n.addAddressFirst,
        icon: 'none'
      });
      return;
    }

    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: 'Cart is empty',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    wx.showLoading({
      title: this.data.i18n.processing,
      mask: true
    });

    const app = getApp();

    // 准备订单数据
    const orderDetails = {
      consignee: this.data.address.name,
      phone: this.data.address.phone,
      address: this.data.address.fullAddress,
      deliveryType: this.data.selectedDeliveryTime,
      remark: this.data.specialInstructions,
      items: this.data.cartItems,
      totalAmount: this.data.total
    };

    // 调用后端创建订单
    orderService.createOrder(orderDetails)
      .then(order => {
        wx.hideLoading();
        this.setData({ loading: false });

        // 清空购物车中已下单的商品
        cartService.clearCart();

        wx.showToast({
          title: this.data.i18n.orderSuccess,
          icon: 'success'
        });

        // 跳转到订单列表
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/orders/orders'
          });
        }, 1500);
      })
      .catch(err => {
        console.error('Create order failed:', err);

        // 如果后端失败，使用本地订单创建
        const localOrder = app.placeOrder(orderDetails);

        wx.hideLoading();
        this.setData({ loading: false });

        if (localOrder) {
          wx.showToast({
            title: this.data.i18n.orderSuccess,
            icon: 'success'
          });

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/orders/orders'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: this.data.i18n.orderFailed,
            icon: 'none'
          });
        }
      });
  },

  goBack: function() {
    wx.navigateBack();
  },

  toFixed: function(num, digits) {
    return parseFloat(Number(num).toFixed(digits || 2));
  }
});
