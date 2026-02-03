// pages/orders/orders.js
Page({
  data: {
    activeTab: 'all',
    orders: [],
    filteredOrders: []
  },

  onLoad: function() {
    this.loadOrders();
  },

  onShow: function() {
    this.loadOrders();
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
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled'
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