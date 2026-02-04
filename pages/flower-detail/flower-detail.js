// pages/flower-detail/flower-detail.js
import { t, getCurrentLocale } from '../../utils/i18n-util.js';

Page({
  data: {
    flower: {},
    quantity: 1,
    maxQuantity: 99,
    // 国际化文本
    i18n: {}
  },

  onLoad: function(options) {
    this.initI18n();
    this.loadFlowerDetail(options.id);
  },

  onShow: function() {
    // 语言可能已更改，重新加载国际化文本
    this.initI18n();
  },

  // 初始化国际化文本
  initI18n: function() {
    const i18nData = {
      title: t('flowerDetail.title'),
      description: t('flowerDetail.description'),
      specifications: t('flowerDetail.specifications'),
      reviews: t('flowerDetail.reviews'),
      noReviews: t('flowerDetail.noReviews'),
      deliveryInfo: t('flowerDetail.deliveryInfo'),
      deliveryTime: t('flowerDetail.deliveryTime'),
      inStock: t('flowerDetail.inStock'),
      outOfStock: t('flowerDetail.outOfStock'),
      addToCart: t('common.addToCart'),
      buyNow: t('common.buyNow'),
      quantity: t('common.quantity'),
      back: t('common.back'),
      price: t('common.price'),
      originalPrice: t('common.originalPrice'),
      addedToCartSuccess: t('messages.addedToCartSuccess'),
      outOfStockMessage: t('messages.outOfStock'),
      exceedsStock: t('messages.exceedsStock'),
      invalidQuantity: t('messages.invalidQuantity')
    };

    this.setData({
      i18n: i18nData
    });
  },

  loadFlowerDetail: function(id) {
    const flowerId = parseInt(id);
    const app = getApp();

    const flower = app.globalData.flowers.find(f => f.id === flowerId);

    if (flower) {
      const currentLocale = getCurrentLocale();
      // 根据当前语言获取特性描述
      const features = currentLocale === 'zh'
        ? '优质花卉，由我们的专业花艺师精心挑选和设计'
        : 'Premium quality flowers, carefully selected and arranged by our expert florists';

      const detailedFlower = {
        ...flower,
        reviewCount: flower.reviewCount || Math.floor(Math.random() * 50) + 10,
        features: features
      };

      // 设置最大可购买数量为库存数量
      this.setData({
        flower: detailedFlower,
        maxQuantity: flower.stock
      });
    } else {
      // 商品不存在，返回上一页
      wx.showToast({
        title: t('common.noData'),
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  increaseQuantity: function() {
    if (this.data.quantity < this.data.maxQuantity) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      wx.showToast({
        title: this.data.i18n.exceedsStock,
        icon: 'none'
      });
    }
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
        title: this.data.i18n.outOfStockMessage,
        icon: 'none'
      });
      return;
    }

    const app = getApp();
    const result = app.addToCart(this.data.flower, this.data.quantity);

    if (result.success) {
      wx.showToast({
        title: this.data.i18n.addedToCartSuccess,
        icon: 'success'
      });

      // 重置数量
      this.setData({
        quantity: 1
      });

      // Update cart badge in tab bar
      const cartCount = app.globalData.cart.reduce((total, item) => total + item.quantity, 0);
      if (cartCount > 0) {
        wx.setTabBarBadge({
          index: 2,
          text: cartCount.toString()
        });
      }
    } else {
      // 处理添加失败的情况
      let errorMessage = this.data.i18n.outOfStockMessage;
      if (result.message === 'exceedsStock') {
        errorMessage = t('messages.exceedsStock');
      } else if (result.message === 'invalidQuantity') {
        errorMessage = this.data.i18n.invalidQuantity;
      }

      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
    }
  },

  buyNow: function() {
    // 先添加到购物车，然后直接跳转到结账页面
    if (this.data.flower.stock <= 0) {
      wx.showToast({
        title: this.data.i18n.outOfStockMessage,
        icon: 'none'
      });
      return;
    }

    const app = getApp();
    const result = app.addToCart(this.data.flower, this.data.quantity);

    if (result.success) {
      wx.navigateTo({
        url: '/pages/checkout/checkout'
      });
    } else {
      wx.showToast({
        title: t('messages.' + result.message) || this.data.i18n.outOfStockMessage,
        icon: 'none'
      });
    }
  },

  goBack: function() {
    wx.navigateBack();
  }
})
