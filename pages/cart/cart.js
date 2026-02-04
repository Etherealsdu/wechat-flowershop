// pages/cart/cart.js
const i18nUtil = require('../../utils/i18n-util.js');
const cartService = require('../../services/cart.js');

Page({
  data: {
    cartItems: [],
    subtotal: 0,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 99,
    total: 0,
    allSelected: true,
    loading: false,
    i18n: {}
  },

  onLoad: function() {
    this.initI18n();
    this.loadCart();
  },

  onShow: function() {
    this.loadCart();
    this.updateTabBarBadge();
  },

  initI18n: function() {
    const i18nData = {
      title: i18nUtil.t('cart.title'),
      remove: i18nUtil.t('common.remove'),
      subTotal: i18nUtil.t('cart.subTotal'),
      shipping: i18nUtil.t('cart.shipping'),
      freeShipping: i18nUtil.t('cart.freeShipping'),
      total: i18nUtil.t('common.total'),
      congratulationsFreeDelivery: i18nUtil.t('messages.congratulationsFreeDelivery'),
      addMoreForFreeDelivery: i18nUtil.t('messages.addMoreForFreeDelivery'),
      goToCheckout: i18nUtil.t('cart.goToCheckout'),
      emptyCart: i18nUtil.t('cart.emptyCart'),
      continueShopping: i18nUtil.t('cart.continueShopping'),
      selectAll: i18nUtil.t('cart.selectAll') || 'Select All',
      selected: i18nUtil.t('cart.selected') || 'Selected'
    };

    this.setData({
      i18n: i18nData
    });
  },

  loadCart: function() {
    this.setData({ loading: true });

    cartService.getCart()
      .then(cart => {
        // 根据当前语言更新商品名称
        const currentLocale = i18nUtil.getCurrentLocale();
        cart.forEach(item => {
          if (item.name_zh && item.name_en) {
            item.name = currentLocale === 'zh' ? item.name_zh : item.name_en;
          }
        });

        this.setData({
          cartItems: cart,
          loading: false
        });

        this.calculateTotals();
        this.updateSelectAllStatus();
      })
      .catch(err => {
        console.error('Failed to load cart:', err);
        this.setData({ loading: false });
      });
  },

  calculateTotals: function() {
    const result = cartService.calculateTotal(true);

    // 使用自定义阈值
    const subtotal = result.subtotal;
    const deliveryFee = subtotal >= this.data.freeDeliveryThreshold ? 0 : this.data.deliveryFee;
    const total = subtotal + deliveryFee;

    this.setData({
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total
    });
  },

  updateSelectAllStatus: function() {
    const allSelected = this.data.cartItems.length > 0 &&
      this.data.cartItems.every(item => item.selected !== false);

    this.setData({
      allSelected: allSelected
    });
  },

  toggleItemSelection: function(e) {
    const id = e.currentTarget.dataset.id;

    cartService.toggleItemSelection(id)
      .then(cart => {
        const currentLocale = i18nUtil.getCurrentLocale();
        cart.forEach(item => {
          if (item.name_zh && item.name_en) {
            item.name = currentLocale === 'zh' ? item.name_zh : item.name_en;
          }
        });

        this.setData({
          cartItems: cart
        });
        this.calculateTotals();
        this.updateSelectAllStatus();
      });
  },

  toggleSelectAll: function() {
    const newSelectAll = !this.data.allSelected;

    cartService.selectAll(newSelectAll)
      .then(cart => {
        const currentLocale = i18nUtil.getCurrentLocale();
        cart.forEach(item => {
          if (item.name_zh && item.name_en) {
            item.name = currentLocale === 'zh' ? item.name_zh : item.name_en;
          }
        });

        this.setData({
          cartItems: cart,
          allSelected: newSelectAll
        });
        this.calculateTotals();
      });
  },

  increaseQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(item => item.id === id);

    if (item && item.quantity < (item.stock || 999)) {
      cartService.updateCartItemQuantity(id, item.quantity + 1)
        .then(() => {
          this.loadCart();
          this.updateTabBarBadge();
        });
    } else {
      wx.showToast({
        title: this.data.i18n.stockLimit || 'Max stock reached',
        icon: 'none'
      });
    }
  },

  decreaseQuantity: function(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(item => item.id === id);

    if (item && item.quantity > 1) {
      cartService.updateCartItemQuantity(id, item.quantity - 1)
        .then(() => {
          this.loadCart();
          this.updateTabBarBadge();
        });
    }
  },

  removeFromCart: function(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: this.data.i18n.confirmRemove || 'Confirm',
      content: this.data.i18n.confirmRemoveMessage || 'Remove this item from cart?',
      success: (res) => {
        if (res.confirm) {
          cartService.removeFromCart(id)
            .then(() => {
              this.loadCart();
              this.updateTabBarBadge();
              wx.showToast({
                title: this.data.i18n.removed || 'Removed',
                icon: 'success'
              });
            });
        }
      }
    });
  },

  clearCart: function() {
    if (this.data.cartItems.length === 0) return;

    wx.showModal({
      title: this.data.i18n.confirmClear || 'Clear Cart',
      content: this.data.i18n.confirmClearMessage || 'Clear all items from cart?',
      success: (res) => {
        if (res.confirm) {
          cartService.clearCart()
            .then(() => {
              this.loadCart();
              this.updateTabBarBadge();
            });
        }
      }
    });
  },

  updateTabBarBadge: function() {
    const count = cartService.getCartCount();
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: count.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  },

  proceedToCheckout: function() {
    const selectedItems = this.data.cartItems.filter(item => item.selected !== false);

    if (selectedItems.length === 0) {
      wx.showToast({
        title: this.data.i18n.selectItems || 'Please select items',
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

  viewFlowerDetail: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/flower-detail/flower-detail?id=${item.id}`
    });
  },

  toFixed: function(num, digits) {
    return parseFloat(Number(num).toFixed(digits || 2));
  }
});
