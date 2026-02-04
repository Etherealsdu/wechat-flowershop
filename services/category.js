// 分类服务层
// Category Service

const { get, post, put, del } = require('../utils/request.js');
const { categories } = require('../config/api.js');

/**
 * 获取分类列表
 * Get category list
 * @param {Object} params - 查询参数
 * @param {boolean} params.isActive - 是否激活
 * @param {number} params.parentId - 父分类ID
 */
const getCategoryList = (params = {}) => {
  return get(categories.list, {
    isActive: params.isActive !== undefined ? params.isActive : true,
    parentId: params.parentId
  });
};

/**
 * 获取分类树结构
 * Get category tree
 */
const getCategoryTree = () => {
  return get(categories.tree);
};

/**
 * 获取分类详情
 * Get category detail
 * @param {number|string} id - 分类ID
 */
const getCategoryDetail = (id) => {
  return get(`${categories.detail}/${id}`);
};

/**
 * 转换后端分类数据为前端格式
 * Transform backend category data to frontend format
 * @param {Object} category - 后端分类数据
 */
const transformCategory = (category) => {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    name_zh: category.name,
    name_en: category.name_en || category.name,
    description: category.description || '',
    image: category.image_url || '/images/default_category.jpg',
    icon: category.icon || '',
    parentId: category.parent_id || 0,
    sortOrder: category.sort_order || 0,
    isActive: category.is_active,
    children: category.children ? category.children.map(transformCategory) : []
  };
};

/**
 * 批量转换分类数据
 * Transform multiple categories
 * @param {Array} categories - 分类数组
 */
const transformCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  return categories.map(transformCategory);
};

/**
 * 获取分类映射（用于快速查找）
 * Get category map for quick lookup
 * @param {Array} categories - 分类数组
 */
const getCategoryMap = (categories) => {
  const map = {};
  const flattenCategories = (cats, parentName = '') => {
    cats.forEach(cat => {
      map[cat.id] = {
        ...cat,
        fullName: parentName ? `${parentName} > ${cat.name}` : cat.name
      };
      if (cat.children && cat.children.length > 0) {
        flattenCategories(cat.children, cat.name);
      }
    });
  };
  flattenCategories(categories);
  return map;
};

module.exports = {
  getCategoryList,
  getCategoryTree,
  getCategoryDetail,
  transformCategory,
  transformCategories,
  getCategoryMap
};
