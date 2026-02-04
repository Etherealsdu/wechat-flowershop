// pages/flower-detail/flower-detail.js
const i18nUtil = require('../../utils/i18n-util.js');
const productService = require('../../services/product.js');
const cartService = require('../../services/cart.js');

Page({
  data: {
    flower: {},
    quantity: 1,
    loading: false,
    i18n: {}
  },

  onLoad: function(options) {
    this.updateI18nData();
    const flowerId = options.id;

    if (flowerId) {
      this.loadFlowerDetail(flowerId);
    }
  },

  onShow: function() {
    this.updateI18nData();
  },

  updateI18nData: function() {
    const currentLocale = i18nUtil.getCurrentLocale();
    const i18nData = {
      addToCart: i18nUtil.t('common.addToCart'),
      buyNow: i18nUtil.t('common.buyNow'),
      price: i18nUtil.t('common.price'),
      originalPrice: i18nUtil.t('common.originalPrice'),
      quantity: i18nUtil.t('common.quantity'),
      description: i18nUtil.t('flowerDetail.description') || 'Description',
      features: i18nUtil.t('flowerDetail.features') || 'Features',
      reviews: i18nUtil.t('flowerDetail.reviews') || 'Reviews',
      stock: i18nUtil.t('flowerDetail.stock') || 'Stock',
      deliveryTime: i18nUtil.t('flowerDetail.deliveryTime') || 'Delivery',
      outOfStock: i18nUtil.t('messages.outOfStock') || 'Out of stock',
      addedToCart: i18nUtil.t('messages.addedToCart') || 'Added to cart!',
      loading: i18nUtil.t('common.loading') || 'Loading...'
    };

    this.setData({
      i18n: i18nData,
      locale: currentLocale
    });
  },

  loadFlowerDetail: function(flowerId) {
    const app = getApp();
    this.setData({ loading: true });

    // 首先尝试从后端获取商品详情
    productService.getProductDetail(flowerId)
      .then(product => {
        const transformedProduct = productService.transformProduct(product);

        // 根据当前语言更新显示
        const currentLocale = i18nUtil.getCurrentLocale();
        if (transformedProduct) {
          transformedProduct.name = currentLocale === 'zh' ?
            transformedProduct.name_zh : transformedProduct.name_en;
          transformedProduct.description = currentLocale === 'zh' ?
            transformedProduct.description_zh : transformedProduct.description_en;
          transformedProduct.deliveryTime = currentLocale === 'zh' ?
            (transformedProduct.deliveryTime_zh || '当天送达') :
            (transformedProduct.deliveryTime_en || 'Same Day');

          // 添加额外属性
          transformedProduct.reviewCount = transformedProduct.reviewCount ||
            Math.floor(Math.random() * 50) + 10;
          transformedProduct.features = transformedProduct.features ||
            (currentLocale === 'zh' ?
              "优质花卉，由专业花艺师精心挑选和布置" :
              "Premium quality flowers, carefully selected and arranged by our expert florists");
        }

        this.setData({
          flower: transformedProduct,
          loading: false
        });
      })
      .catch(err => {
        console.log('Using local product data:', err);
        // 如果后端请求失败，使用本地数据
        this.loadLocalFlowerDetail(flowerId);
      });
  },

  loadLocalFlowerDetail: function(flowerId) {
    const app = getApp();
    const id = parseInt(flowerId);
    const flower = app.globalData.flowers.find(f => f.id === id);

    if (flower) {
      const currentLocale = i18nUtil.getCurrentLocale();
      const detailedFlower = {
        ...flower,
        reviewCount: Math.floor(Math.random() * 50) + 10,
        features: currentLocale === 'zh' ?
          "优质花卉，由专业花艺师精心挑选和布置" :
          "Premium quality flowers, carefully selected and arranged by our expert florists"
      };

      this.setData({
        flower: detailedFlower,
        loading: false
      });
    } else {
      this.setData({ loading: false });
      wx.showToast({
        title: 'Product not found',
        icon: 'none'
      });
    }
  },

  increaseQuantity: function() {
    if (this.data.quantity < this.data.flower.stock) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      wx.showToast({
        title: this.data.i18n.stockLimit || 'Max stock reached',
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
    if (!this.data.flower || !this.data.flower.id) {
      return;
    }

    if (this.data.flower.stock <= 0) {
      wx.showToast({
        title: this.data.i18n.outOfStock,
        icon: 'none'
      });
      return;
    }

    const app = getApp();
    app.addToCart(this.data.flower, this.data.quantity);

    wx.showToast({
      title: this.data.i18n.addedToCart,
      icon: 'success'
    });

    // 更新 tabBar 徽标
    this.updateCartBadge();
  },

  buyNow: function() {
    if (!this.data.flower || !this.data.flower.id) {
      return;
    }

    if (this.data.flower.stock <= 0) {
      wx.showToast({
        title: this.data.i18n.outOfStock,
        icon: 'none'
      });
      return;
    }

    // 添加到购物车
    const app = getApp();
    app.addToCart(this.data.flower, this.data.quantity);

    // 直接跳转到结算页
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },

  updateCartBadge: function() {
    const cartCount = cartService.getCartCount();
    if (cartCount > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: cartCount.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  },

  previewImage: function(e) {
    const current = e.currentTarget.dataset.url || this.data.flower.image;
    const urls = this.data.flower.images || [this.data.flower.image];

    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});
