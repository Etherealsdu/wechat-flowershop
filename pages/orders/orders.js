// pages/orders/orders.js
import { t } from '../../utils/i18n-util.js';

Page({
  data: {
    activeTab: 'all',
    orders: [],
    filteredOrders: [],
    // 国际化文本
    pageTitle: '',
    allOrdersText: '',
    pendingText: '',
    completedText: '',
    viewDetailsText: '',
    noOrdersText: '',
    startShoppingText: '',
    orderTotalText: '',
    orderNumberPrefix: '#',
    quantityText: '',
    andMoreItemsText: '',
    statusMap: {}
  },

  onLoad: function() {
    this.initI18n(); // 初始化国际化文本
    this.loadOrders();
  },

  onShow: function() {
    this.loadOrders();
  },

  // 初始化国际化文本
  initI18n: function() {
    this.setData({
      pageTitle: t('orders.myOrders'),
      allOrdersText: t('orders.all'),
      pendingText: t('orders.pending'),
      completedText: t('orders.delivered'), // 使用'delivered'对应已完成
      viewDetailsText: t('orders.viewDetails'),
      noOrdersText: t('orders.noOrders'),
      startShoppingText: t('orders.startShopping') || t('cart.continueShopping'),
      orderTotalText: t('orders.orderTotal'),
      orderNumberPrefix: '#',
      quantityText: t('common.quantity'),
      andMoreItemsText: t('orders.andMoreItems', { count: 0 }).replace('0', ''), // 移除数字占位符
      statusMap: {
        pending: t('orders.pending'),
        processing: t('orders.processing'),
        shipped: t('orders.shipped'),
        delivered: t('orders.delivered'),
        completed: t('orders.delivered'), // 映射到delivered
        cancelled: t('orders.cancelled')
      }
    });
  },

  // 更新国际化文本
  updateI18n: function() {
    this.setData({
      pageTitle: t('orders.myOrders'),
      allOrdersText: t('orders.all'),
      pendingText: t('orders.pending'),
      completedText: t('orders.delivered'),
      viewDetailsText: t('orders.viewDetails'),
      noOrdersText: t('orders.noOrders'),
      startShoppingText: t('orders.startShopping') || t('cart.continueShopping'),
      orderTotalText: t('orders.orderTotal'),
      orderNumberPrefix: '#',
      quantityText: t('common.quantity'),
      andMoreItemsText: t('orders.andMoreItems', { count: 0 }).replace('0', ''),
      statusMap: {
        pending: t('orders.pending'),
        processing: t('orders.processing'),
        shipped: t('orders.shipped'),
        delivered: t('orders.delivered'),
        completed: t('orders.delivered'),
        cancelled: t('orders.cancelled')
      }
    });
  },

  loadOrders: function() {
    const app = getApp();
    // Load orders from global data (in a real app, this would come from storage or API)
    const orders = app.globalData.orders || [];
    
    this.setData({
      orders: orders
    });
    
    this.filterOrders();
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    this.filterOrders();
  },

  filterOrders: function() {
    let filteredOrders = [...this.data.orders];
    
    if (this.data.activeTab !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === this.data.activeTab);
    }
    
    this.setData({
      filteredOrders: filteredOrders
    });
  },

  formatStatus: function(status) {
    const statusMap = this.data.statusMap || {
      pending: t('orders.pending'),
      processing: t('orders.processing'),
      shipped: t('orders.shipped'),
      delivered: t('orders.delivered'),
      completed: t('orders.delivered'), // 映射到delivered
      cancelled: t('orders.cancelled')
    };
    
    return statusMap[status] || status;
  },

  viewOrderDetails: function(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${order.id}`
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