// pages/profile/profile.js
Page({
  data: {
    userInfo: {}
  },

  onLoad: function(options) {
    this.loadUserInfo();
  },

  onShow: function() {
    this.loadUserInfo();
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
      title: 'Login functionality would be implemented here',
      icon: 'none'
    });
  },

  editProfile: function() {
    wx.showToast({
      title: 'Edit profile functionality',
      icon: 'none'
    });
  },

  manageAddress: function() {
    wx.navigateTo({
      url: '/pages/address/address'
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

  about: function() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },

  contact: function() {
    wx.makePhoneCall({
      phoneNumber: '123-456-7890' // Replace with actual support number
    });
  },

  logout: function() {
    wx.showModal({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          this.setData({
            userInfo: {}
          });
          wx.showToast({
            title: 'Logged out successfully',
            icon: 'success'
          });
        }
      }
    });
  }
})