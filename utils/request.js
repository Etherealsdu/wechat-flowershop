// HTTP 请求工具类
// HTTP Request Utility

const { getEnvConfig } = require('../config/api.js');

// 获取配置
const apiConfig = getEnvConfig();

// Token 存储键名
const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'userInfo';

/**
 * 获取存储的 Token
 * Get stored token
 */
const getToken = () => {
  return wx.getStorageSync(TOKEN_KEY) || '';
};

/**
 * 设置 Token
 * Set token
 */
const setToken = (token) => {
  wx.setStorageSync(TOKEN_KEY, token);
};

/**
 * 清除 Token
 * Clear token
 */
const clearToken = () => {
  wx.removeStorageSync(TOKEN_KEY);
  wx.removeStorageSync(USER_INFO_KEY);
};

/**
 * 基础请求方法
 * Base request method
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求路径（相对路径）
 * @param {string} options.method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 自定义请求头
 * @param {boolean} options.showLoading - 是否显示加载中
 * @param {boolean} options.showError - 是否显示错误提示
 */
const request = (options) => {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    showLoading = true,
    showError = true
  } = options;

  return new Promise((resolve, reject) => {
    // 显示加载中
    if (showLoading) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }

    // 构建完整 URL
    const fullUrl = url.startsWith('http') ? url : `${apiConfig.baseUrl}${url}`;

    // 构建请求头
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...header
    };

    // 添加认证头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: headers,
      timeout: apiConfig.timeout,
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }

        const statusCode = res.statusCode;

        // 成功响应
        if (statusCode >= 200 && statusCode < 300) {
          resolve(res.data);
        }
        // 未授权 - Token 过期或无效
        else if (statusCode === 401) {
          clearToken();
          if (showError) {
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
              duration: 2000
            });
          }
          // 跳转到登录页或触发重新登录
          wx.navigateTo({
            url: '/pages/profile/profile'
          });
          reject(new Error('Unauthorized'));
        }
        // 禁止访问
        else if (statusCode === 403) {
          if (showError) {
            wx.showToast({
              title: '没有访问权限',
              icon: 'none'
            });
          }
          reject(new Error('Forbidden'));
        }
        // 资源不存在
        else if (statusCode === 404) {
          if (showError) {
            wx.showToast({
              title: '请求的资源不存在',
              icon: 'none'
            });
          }
          reject(new Error('Not Found'));
        }
        // 服务器错误
        else if (statusCode >= 500) {
          if (showError) {
            wx.showToast({
              title: '服务器错误，请稍后重试',
              icon: 'none'
            });
          }
          reject(new Error('Server Error'));
        }
        // 其他错误
        else {
          const errorMsg = res.data?.error || res.data?.message || '请求失败';
          if (showError) {
            wx.showToast({
              title: errorMsg,
              icon: 'none'
            });
          }
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }

        console.error('Request failed:', err);

        if (showError) {
          let errorMsg = '网络错误，请检查网络连接';
          if (err.errMsg && err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请稍后重试';
          }
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          });
        }

        reject(err);
      }
    });
  });
};

/**
 * GET 请求
 * @param {string} url - 请求路径
 * @param {Object} params - 查询参数
 * @param {Object} options - 其他选项
 */
const get = (url, params = {}, options = {}) => {
  // 构建查询字符串
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const fullUrl = queryString ? `${url}?${queryString}` : url;

  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  });
};

/**
 * POST 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求体数据
 * @param {Object} options - 其他选项
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT 请求
 * @param {string} url - 请求路径
 * @param {Object} data - 请求体数据
 * @param {Object} options - 其他选项
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE 请求
 * @param {string} url - 请求路径
 * @param {Object} options - 其他选项
 */
const del = (url, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...options
  });
};

/**
 * 文件上传
 * @param {string} url - 上传路径
 * @param {string} filePath - 本地文件路径
 * @param {string} name - 文件字段名
 * @param {Object} formData - 额外表单数据
 */
const upload = (url, filePath, name = 'file', formData = {}) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    const fullUrl = url.startsWith('http') ? url : `${apiConfig.baseUrl}${url}`;
    const token = getToken();

    wx.uploadFile({
      url: fullUrl,
      filePath: filePath,
      name: name,
      formData: formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        wx.hideLoading();

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            resolve(res.data);
          }
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
          reject(new Error('Upload failed'));
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  getToken,
  setToken,
  clearToken
};
