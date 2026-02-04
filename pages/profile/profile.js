// pages/profile/profile.js
const i18nUtil = require('../../utils/i18n-util.js');
const userService = require('../../services/user.js');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    loading: false,
    i18n: {}
  },

  onLoad: function(options) {
    this.initI18n();
    this.loadUserInfo();

    // 处理地址编辑模式
    if (options.mode === 'addAddress' || options.mode === 'editAddress') {
      // 可以在这里处理地址相关逻辑
    }
  },

  onShow: function() {
    this.initI18n();
    this.loadUserInfo();
  },

  initI18n: function() {
    const currentLocale = i18nUtil.getCurrentLocale();

    const i18nData = {
      title: i18nUtil.t('profile.title') || 'My Profile',
      login: i18nUtil.t('profile.login') || 'Login',
      logout: i18nUtil.t('profile.logout') || 'Logout',
      editProfile: i18nUtil.t('profile.editProfile') || 'Edit Profile',
      myOrders: i18nUtil.t('profile.myOrders') || 'My Orders',
      myAddress: i18nUtil.t('profile.myAddress') || 'My Addresses',
      wishlist: i18nUtil.t('profile.wishlist') || 'Wishlist',
      settings: i18nUtil.t('profile.settings') || 'Settings',
      language: i18nUtil.t('common.language') || 'Language',
      chinese: i18nUtil.t('common.chinese') || 'Chinese',
      english: i18nUtil.t('common.english') || 'English',
      about: i18nUtil.t('profile.about') || 'About Us',
      contact: i18nUtil.t('profile.contact') || 'Contact Us',
      confirmLogout: currentLocale === 'zh' ? '确认退出' : 'Confirm Logout',
      confirmLogoutMessage: currentLocale === 'zh' ? '确定要退出登录吗？' : 'Are you sure you want to logout?',
      logoutSuccess: currentLocale === 'zh' ? '已退出登录' : 'Logged out successfully',
      loginFirst: currentLocale === 'zh' ? '请先登录' : 'Please login first',
      loginFailed: currentLocale === 'zh' ? '登录失败' : 'Login failed'
    };

    this.setData({
      i18n: i18nData,
      currentLocale: currentLocale
    });
  },

  loadUserInfo: function() {
    const app = getApp();

    // 检查登录状态
    const isLoggedIn = userService.isLoggedIn();
    const localUserInfo = userService.getLocalUserInfo();

    this.setData({
      isLoggedIn: isLoggedIn,
      userInfo: localUserInfo
    });

    // 如果已登录，尝试刷新用户信息
    if (isLoggedIn) {
      userService.getUserProfile()
        .then(user => {
          const transformedUser = userService.transformUser(user);
          this.setData({
            userInfo: transformedUser
          });
          // 更新本地存储
          wx.setStorageSync('userInfo', transformedUser);
          // 更新全局
          app.globalData.userInfo = transformedUser;
        })
        .catch(err => {
          console.log('Failed to refresh user profile:', err);
        });
    }
  },

  login: function() {
    const app = getApp();
    this.setData({ loading: true });

    // 执行微信登录
    app.login()
      .then(res => {
        this.setData({
          isLoggedIn: true,
          userInfo: res.user || res.userInfo,
          loading: false
        });

        wx.showToast({
          title: this.data.i18n.loginSuccess || 'Login successful',
          icon: 'success'
        });
      })
      .catch(err => {
        console.error('Login failed:', err);
        this.setData({ loading: false });

        wx.showToast({
          title: this.data.i18n.loginFailed,
          icon: 'none'
        });
      });
  },

  getUserProfile: function() {
    // 获取微信用户头像和昵称
    userService.getWxUserInfo()
      .then(wxUserInfo => {
        // 更新用户信息
        const updatedUserInfo = {
          ...this.data.userInfo,
          nickname: wxUserInfo.nickName,
          avatar: wxUserInfo.avatarUrl
        };

        // 同步到后端
        userService.updateUserProfile({
          nickname: wxUserInfo.nickName,
          avatar: wxUserInfo.avatarUrl
        })
          .then(() => {
            this.setData({
              userInfo: updatedUserInfo
            });
            wx.setStorageSync('userInfo', updatedUserInfo);
          })
          .catch(err => {
            console.log('Failed to sync user info:', err);
            // 仍然更新本地
            this.setData({
              userInfo: updatedUserInfo
            });
            wx.setStorageSync('userInfo', updatedUserInfo);
          });
      })
      .catch(err => {
        console.log('Failed to get wx user info:', err);
      });
  },

  editProfile: function() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: this.data.i18n.loginFirst,
        icon: 'none'
      });
      return;
    }

    // 可以跳转到编辑页面或显示编辑弹窗
    wx.showToast({
      title: 'Edit profile functionality',
      icon: 'none'
    });
  },

  manageAddress: function() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: this.data.i18n.loginFirst,
        icon: 'none'
      });
      return;
    }

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

        // 保存地址
        wx.setStorageSync('deliveryAddress', address);

        wx.showToast({
          title: this.data.i18n.addressSaved || 'Address saved',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('Choose address failed:', err);
      }
    });
  },

  viewOrders: function() {
    wx.switchTab({
      url: '/pages/orders/orders'
    });
  },

  viewWishlist: function() {
    wx.showToast({
      title: 'Wishlist functionality',
      icon: 'none'
    });
  },

  settings: function() {
    wx.showToast({
      title: 'Settings functionality',
      icon: 'none'
    });
  },

  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    const app = getApp();

    if (lang && app.switchLanguage(lang)) {
      this.initI18n();
      wx.showToast({
        title: lang === 'zh' ? '已切换到中文' : 'Switched to English',
        icon: 'success'
      });
    }
  },

  about: function() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  contact: function() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  },

  logout: function() {
    wx.showModal({
      title: this.data.i18n.confirmLogout,
      content: this.data.i18n.confirmLogoutMessage,
      success: (res) => {
        if (res.confirm) {
          const app = getApp();

          app.logout()
            .then(() => {
              this.setData({
                isLoggedIn: false,
                userInfo: null
              });

              wx.showToast({
                title: this.data.i18n.logoutSuccess,
                icon: 'success'
              });
            });
        }
      }
    });
  }
});
