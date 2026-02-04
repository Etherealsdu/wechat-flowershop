// API 配置文件
// API Configuration

const config = {
  // 后端服务器地址 - 请根据实际部署情况修改
  // Backend server URL - modify according to your deployment
  baseUrl: 'https://your-backend-domain.com/api',

  // 开发环境配置
  // Development environment configuration
  dev: {
    baseUrl: 'http://localhost:3000/api'
  },

  // 生产环境配置
  // Production environment configuration
  prod: {
    baseUrl: 'https://your-backend-domain.com/api'
  },

  // 请求超时时间（毫秒）
  // Request timeout (milliseconds)
  timeout: 10000,

  // API 路径
  // API paths
  paths: {
    // 用户相关
    users: {
      login: '/auth/login',           // 微信登录
      wxLogin: '/auth/wx-login',      // 微信小程序登录
      profile: '/users/profile',      // 获取当前用户信息
      update: '/users/profile',       // 更新用户信息
      addresses: '/users/addresses',  // 用户地址列表
      addAddress: '/users/addresses', // 添加地址
    },

    // 商品相关
    products: {
      list: '/products',              // 商品列表
      detail: '/products',            // 商品详情 (需追加 /:id)
      featured: '/products/featured', // 精选商品
      search: '/products/search',     // 搜索商品
    },

    // 分类相关
    categories: {
      list: '/categories',            // 分类列表
      tree: '/categories/tree',       // 分类树结构
      detail: '/categories',          // 分类详情 (需追加 /:id)
    },

    // 订单相关
    orders: {
      list: '/orders',                // 订单列表
      detail: '/orders',              // 订单详情 (需追加 /:id)
      create: '/orders',              // 创建订单
      cancel: '/orders',              // 取消订单 (需追加 /:id/cancel)
      stats: '/orders/stats',         // 订单统计
    },

    // 购物车相关（如果后端支持）
    cart: {
      list: '/cart',                  // 获取购物车
      add: '/cart',                   // 添加到购物车
      update: '/cart',                // 更新购物车项 (需追加 /:id)
      remove: '/cart',                // 删除购物车项 (需追加 /:id)
      clear: '/cart/clear',           // 清空购物车
    },

    // 文件上传
    files: {
      upload: '/files/upload',        // 单文件上传
      uploads: '/files/uploads',      // 多文件上传
    }
  }
};

// 根据环境获取配置
// Get configuration based on environment
const getEnvConfig = () => {
  // 可以根据需要切换环境
  // Switch environment as needed
  const env = 'dev'; // 'dev' or 'prod'

  return {
    ...config,
    baseUrl: config[env]?.baseUrl || config.baseUrl
  };
};

module.exports = {
  config,
  getEnvConfig,
  ...config.paths
};
