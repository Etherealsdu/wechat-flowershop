// pages/orders/orders.js
const i18nUtil = require('../../utils/i18n-util.js');
const orderService = require('../../services/order.js');
const userService = require('../../services/user.js');

Page({
  data: {
    activeTab: 'all',
    orders: [],
    filteredOrders: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    i18n: {},
    statusMap: {}
  },

  onLoad: function() {
    this.initI18n();
    this.loadOrders();
  },

  onShow: function() {
    this.initI18n();
    this.loadOrders();
  },

  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      hasMore: true,
      orders: []
    });
    this.loadOrders();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrders();
    }
  },

  initI18n: function() {
    const currentLocale = i18nUtil.getCurrentLocale();

    const i18nData = {
      title: i18nUtil.t('orders.myOrders'),
      all: i18nUtil.t('orders.all'),
      pending: i18nUtil.t('orders.pending'),
      paid: i18nUtil.t('orders.paid') || 'Paid',
      shipped: i18nUtil.t('orders.shipped'),
      delivered: i18nUtil.t('orders.delivered'),
      cancelled: i18nUtil.t('orders.cancelled'),
      viewDetails: i18nUtil.t('orders.viewDetails'),
      noOrders: i18nUtil.t('orders.noOrders'),
      startShopping: i18nUtil.t('orders.startShopping') || i18nUtil.t('cart.continueShopping'),
      orderTotal: i18nUtil.t('orders.orderTotal'),
      orderNumber: i18nUtil.t('orders.orderNumber') || 'Order #',
      quantity: i18nUtil.t('common.quantity'),
      loading: i18nUtil.t('common.loading') || 'Loading...',
      cancelOrder: i18nUtil.t('orders.cancelOrder') || 'Cancel Order',
      confirmReceipt: i18nUtil.t('orders.confirmReceipt') || 'Confirm Receipt'
    };

    const statusMap = {
      pending: currentLocale === 'zh' ? '待付款' : 'Pending',
      paid: currentLocale === 'zh' ? '待发货' : 'Paid',
      shipped: currentLocale === 'zh' ? '已发货' : 'Shipped',
      delivered: currentLocale === 'zh' ? '已完成' : 'Delivered',
      completed: currentLocale === 'zh' ? '已完成' : 'Completed',
      cancelled: currentLocale === 'zh' ? '已取消' : 'Cancelled'
    };

    this.setData({
      i18n: i18nData,
      statusMap: statusMap
    });
  },

  loadOrders: function() {
    const app = getApp();
    this.setData({ loading: true });

    // 检查是否登录
    if (userService.isLoggedIn()) {
      // 从后端加载订单
      orderService.getOrderList({
        page: this.data.page,
        pageSize: this.data.pageSize,
        status: this.data.activeTab !== 'all' ? this.data.activeTab : undefined
      })
        .then(res => {
          const orders = res.data || res;
          const transformedOrders = orderService.transformOrders(
            Array.isArray(orders) ? orders : [orders]
          );

          // 更新状态文本
          this.updateOrderStatusText(transformedOrders);

          this.setData({
            orders: transformedOrders,
            loading: false,
            hasMore: res.pagination ? res.pagination.page < res.pagination.totalPages : false
          });

          this.filterOrders();

          // 同步到全局
          app.globalData.orders = transformedOrders;
        })
        .catch(err => {
          console.log('Using local orders:', err);
          this.loadLocalOrders();
        });
    } else {
      // 使用本地订单
      this.loadLocalOrders();
    }
  },

  loadLocalOrders: function() {
    const app = getApp();
    const orders = app.globalData.orders || [];

    // 更新状态文本
    this.updateOrderStatusText(orders);

    this.setData({
      orders: orders,
      loading: false,
      hasMore: false
    });

    this.filterOrders();
  },

  loadMoreOrders: function() {
    if (!userService.isLoggedIn()) return;

    this.setData({
      page: this.data.page + 1,
      loading: true
    });

    orderService.getOrderList({
      page: this.data.page,
      pageSize: this.data.pageSize,
      status: this.data.activeTab !== 'all' ? this.data.activeTab : undefined
    })
      .then(res => {
        const orders = res.data || res;
        const transformedOrders = orderService.transformOrders(
          Array.isArray(orders) ? orders : [orders]
        );

        this.updateOrderStatusText(transformedOrders);

        const allOrders = [...this.data.orders, ...transformedOrders];

        this.setData({
          orders: allOrders,
          loading: false,
          hasMore: res.pagination ? res.pagination.page < res.pagination.totalPages : false
        });

        this.filterOrders();
      })
      .catch(err => {
        console.log('Load more orders failed:', err);
        this.setData({
          loading: false,
          hasMore: false
        });
      });
  },

  updateOrderStatusText: function(orders) {
    const currentLocale = i18nUtil.getCurrentLocale();
    orders.forEach(order => {
      order.statusText = orderService.getOrderStatusText(order.status, currentLocale);
      order.statusColor = orderService.orderStatusMap[order.status]?.color || '#999';
    });
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true
    });

    // 如果登录了，重新从后端加载
    if (userService.isLoggedIn()) {
      this.loadOrders();
    } else {
      this.filterOrders();
    }
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

  cancelOrder: function(e) {
    const order = e.currentTarget.dataset.order;

    wx.showModal({
      title: this.data.i18n.cancelOrder,
      content: this.data.i18n.confirmCancelOrder || 'Are you sure you want to cancel this order?',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();

          orderService.cancelOrder(order.id)
            .then(() => {
              wx.showToast({
                title: this.data.i18n.orderCancelled || 'Order cancelled',
                icon: 'success'
              });
              this.loadOrders();
            })
            .catch(err => {
              console.log('Cancel order failed:', err);
              // 本地取消
              const orderIndex = this.data.orders.findIndex(o => o.id === order.id);
              if (orderIndex > -1) {
                const orders = [...this.data.orders];
                orders[orderIndex].status = 'cancelled';
                orders[orderIndex].statusText = this.data.statusMap.cancelled;

                this.setData({ orders });
                this.filterOrders();

                // 更新全局
                app.globalData.orders = orders;
                wx.setStorageSync('orders', orders);

                wx.showToast({
                  title: this.data.i18n.orderCancelled || 'Order cancelled',
                  icon: 'success'
                });
              }
            });
        }
      }
    });
  },

  confirmReceipt: function(e) {
    const order = e.currentTarget.dataset.order;

    wx.showModal({
      title: this.data.i18n.confirmReceipt,
      content: this.data.i18n.confirmReceiptMessage || 'Confirm you have received this order?',
      success: (res) => {
        if (res.confirm) {
          orderService.confirmReceipt(order.id)
            .then(() => {
              wx.showToast({
                title: this.data.i18n.orderCompleted || 'Order completed',
                icon: 'success'
              });
              this.loadOrders();
            })
            .catch(err => {
              console.log('Confirm receipt failed:', err);
              wx.showToast({
                title: 'Failed to confirm',
                icon: 'none'
              });
            });
        }
      }
    });
  },

  viewOrderDetails: function(e) {
    const order = e.currentTarget.dataset.order;
    // 如果有订单详情页，跳转到详情页
    // wx.navigateTo({
    //   url: `/pages/order-detail/order-detail?id=${order.id}`
    // });

    // 暂时显示订单信息
    wx.showModal({
      title: `Order #${order.orderNo || order.id}`,
      content: `Status: ${order.statusText}\nTotal: ¥${order.totalAmount || order.total}`,
      showCancel: false
    });
  },

  goToShop: function() {
    wx.switchTab({
      url: '/pages/shop/shop'
    });
  },

  toFixed: function(num, digits) {
    return parseFloat(Number(num).toFixed(digits || 2));
  }
});
