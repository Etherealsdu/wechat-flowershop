// 用户服务层
// User Service

const { get, post, put, del, setToken, clearToken, getToken } = require('../utils/request.js');
const { users } = require('../config/api.js');

/**
 * 微信登录
 * WeChat login
 * @param {string} code - 微信登录凭证
 */
const wxLogin = (code) => {
  return post(users.wxLogin, { code }).then(res => {
    if (res.token) {
      setToken(res.token);
      wx.setStorageSync('userInfo', res.user || res.userInfo);
    }
    return res;
  });
};

/**
 * 执行微信登录流程
 * Execute WeChat login flow
 */
const doWxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          wxLogin(loginRes.code)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('微信登录失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取当前用户信息
 * Get current user profile
 */
const getUserProfile = () => {
  return get(users.profile);
};

/**
 * 更新用户信息
 * Update user profile
 * @param {Object} userData - 用户数据
 * @param {string} userData.nickname - 昵称
 * @param {string} userData.avatar - 头像
 * @param {string} userData.phone - 手机号
 */
const updateUserProfile = (userData) => {
  return put(users.update, userData);
};

/**
 * 获取用户地址列表
 * Get user address list
 */
const getAddressList = () => {
  return get(users.addresses);
};

/**
 * 添加用户地址
 * Add user address
 * @param {Object} addressData - 地址数据
 */
const addAddress = (addressData) => {
  return post(users.addAddress, addressData);
};

/**
 * 更新用户地址
 * Update user address
 * @param {number|string} id - 地址ID
 * @param {Object} addressData - 地址数据
 */
const updateAddress = (id, addressData) => {
  return put(`${users.addresses}/${id}`, addressData);
};

/**
 * 删除用户地址
 * Delete user address
 * @param {number|string} id - 地址ID
 */
const deleteAddress = (id) => {
  return del(`${users.addresses}/${id}`);
};

/**
 * 设置默认地址
 * Set default address
 * @param {number|string} id - 地址ID
 */
const setDefaultAddress = (id) => {
  return put(`${users.addresses}/${id}/default`);
};

/**
 * 获取微信用户信息
 * Get WeChat user info
 */
const getWxUserInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve(res.userInfo);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 退出登录
 * Logout
 */
const logout = () => {
  clearToken();
  wx.removeStorageSync('userInfo');
  return Promise.resolve();
};

/**
 * 检查是否已登录
 * Check if user is logged in
 */
const isLoggedIn = () => {
  const token = getToken();
  return !!token;
};

/**
 * 获取本地存储的用户信息
 * Get locally stored user info
 */
const getLocalUserInfo = () => {
  return wx.getStorageSync('userInfo') || null;
};

/**
 * 转换后端用户数据为前端格式
 * Transform backend user data to frontend format
 * @param {Object} user - 后端用户数据
 */
const transformUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    openid: user.openid,
    nickname: user.nickname || '微信用户',
    avatar: user.avatar || '/images/default_avatar.png',
    phone: user.phone || '',
    gender: user.gender || 0,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

/**
 * 转换地址数据
 * Transform address data
 * @param {Object} address - 后端地址数据
 */
const transformAddress = (address) => {
  if (!address) return null;

  return {
    id: address.id,
    name: address.name || address.consignee,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail || address.address,
    fullAddress: `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || address.address || ''}`,
    isDefault: address.is_default || false
  };
};

module.exports = {
  wxLogin,
  doWxLogin,
  getUserProfile,
  updateUserProfile,
  getAddressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getWxUserInfo,
  logout,
  isLoggedIn,
  getLocalUserInfo,
  transformUser,
  transformAddress
};
