// 商品服务层
// Product Service

const { get, post, put, del } = require('../utils/request.js');
const { products } = require('../config/api.js');

/**
 * 获取商品列表
 * Get product list
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {number} params.categoryId - 分类ID
 * @param {string} params.search - 搜索关键词
 * @param {boolean} params.isActive - 是否激活
 * @param {boolean} params.isOnSale - 是否在售
 */
const getProductList = (params = {}) => {
  return get(products.list, {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    categoryId: params.categoryId,
    search: params.search,
    isActive: params.isActive !== undefined ? params.isActive : true,
    isOnSale: params.isOnSale !== undefined ? params.isOnSale : true
  });
};

/**
 * 获取商品详情
 * Get product detail
 * @param {number|string} id - 商品ID
 */
const getProductDetail = (id) => {
  return get(`${products.detail}/${id}`);
};

/**
 * 获取精选商品
 * Get featured products
 * @param {number} limit - 数量限制
 */
const getFeaturedProducts = (limit = 4) => {
  // 如果后端有精选接口则使用，否则使用列表接口并按评分/销量排序
  return get(products.list, {
    page: 1,
    pageSize: limit,
    isActive: true,
    isOnSale: true
    // sort: 'rating' // 如果后端支持排序
  }).then(res => {
    // 如果返回的是带分页的数据结构
    if (res.data) {
      return res.data;
    }
    return res;
  });
};

/**
 * 搜索商品
 * Search products
 * @param {string} keyword - 搜索关键词
 * @param {Object} options - 其他选项
 */
const searchProducts = (keyword, options = {}) => {
  return get(products.list, {
    search: keyword,
    page: options.page || 1,
    pageSize: options.pageSize || 10,
    categoryId: options.categoryId,
    isActive: true,
    isOnSale: true
  });
};

/**
 * 按分类获取商品
 * Get products by category
 * @param {number|string} categoryId - 分类ID
 * @param {Object} options - 其他选项
 */
const getProductsByCategory = (categoryId, options = {}) => {
  return get(products.list, {
    categoryId: categoryId,
    page: options.page || 1,
    pageSize: options.pageSize || 10,
    isActive: true,
    isOnSale: true
  });
};

/**
 * 转换后端商品数据为前端格式
 * Transform backend product data to frontend format
 * @param {Object} product - 后端商品数据
 */
const transformProduct = (product) => {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    name_zh: product.name,
    name_en: product.name_en || product.name,
    price: parseFloat(product.price),
    originalPrice: parseFloat(product.original_price || product.price),
    category: product.category?.name || '',
    categoryId: product.category_id,
    image: product.image_urls?.[0] || '/images/default_flower.jpg',
    images: product.image_urls || [],
    description: product.description || '',
    description_zh: product.description,
    description_en: product.description_en || product.description,
    stock: product.stock || 0,
    rating: product.rating || 4.5,
    salesCount: product.sales_count || 0,
    tags: product.tags || [],
    isActive: product.is_active,
    isOnSale: product.is_on_sale,
    deliveryTime: '当天送达',
    deliveryTime_zh: '当天送达',
    deliveryTime_en: 'Same Day'
  };
};

/**
 * 批量转换商品数据
 * Transform multiple products
 * @param {Array} products - 商品数组
 */
const transformProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(transformProduct);
};

module.exports = {
  getProductList,
  getProductDetail,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory,
  transformProduct,
  transformProducts
};
