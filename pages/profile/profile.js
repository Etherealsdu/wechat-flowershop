// pages/profile/profile.js
import { t } from '../../utils/i18n-util.js';

Page({
  data: {
    userInfo: {},
    // 国际化文本
    i18n: {}
  },

  onLoad: function(options) {
    this.initI18n();
    this.loadUserInfo();
  },

  onShow: function() {
    this.initI18n();
    this.loadUserInfo();
  },

  // 初始化国际化文本
  initI18n: function() {
    const i18nData = {
      title: t('profile.title'),
      myProfile: t('profile.myProfile'),
      myAddress: t('profile.myAddress'),
      myFavorites: t('profile.myFavorites'),
      customerService: t('profile.customerService'),
      aboutUs: t('profile.aboutUs'),
      logout: t('profile.logout'),
      login: t('profile.login'),
      register: t('profile.register'),
      orders: t('common.orders'),
      settings: t('common.settings'),
      confirmLogout: t('messages.confirmLogout'),
      confirmLogoutMessage: t('messages.confirmLogoutMessage'),
      logoutSuccess: t('messages.logoutSuccess'),
      featureNotAvailable: t('messages.featureNotAvailable'),
      yes: t('common.yes'),
      no: t('common.no')
    };

    this.setData({
      i18n: i18nData
    });
  },

  loadUserInfo: function() {
    // In a real app, this would come from WeChat login or your backend
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
  },

  login: function() {
    // In a real app, this would trigger WeChat login
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  editProfile: function() {
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  manageAddress: function() {
    // 由于 address 页面不存在，显示提示
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  viewOrders: function() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  },

  viewWishlist: function() {
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  settings: function() {
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  about: function() {
    wx.showToast({
      title: this.data.i18n.featureNotAvailable,
      icon: 'none'
    });
  },

  contact: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail: () => {
        wx.showToast({
          title: this.data.i18n.featureNotAvailable,
          icon: 'none'
        });
      }
    });
  },

  logout: function() {
    wx.showModal({
      title: this.data.i18n.confirmLogout,
      content: this.data.i18n.confirmLogoutMessage,
      confirmText: this.data.i18n.yes || t('common.confirm'),
      cancelText: this.data.i18n.no || t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          // 只清除用户相关数据，保留语言设置
          const locale = wx.getStorageSync('locale');
          wx.clearStorageSync();
          if (locale) {
            wx.setStorageSync('locale', locale);
          }

          this.setData({
            userInfo: {}
          });

          // 清除全局数据中的购物车和订单
          const app = getApp();
          app.globalData.cart = [];
          app.globalData.orders = [];
          app.globalData.userInfo = null;

          wx.showToast({
            title: this.data.i18n.logoutSuccess,
            icon: 'success'
          });
        }
      }
    });
  }
})
