// 购物车服务层
// Cart Service

const { get, post, put, del } = require('../utils/request.js');
const { cart } = require('../config/api.js');

// 本地存储键名
const CART_STORAGE_KEY = 'cart';

/**
 * 获取购物车（本地 + 远程同步）
 * Get cart (local + remote sync)
 * 购物车采用本地优先策略，同时支持后端同步
 */
const getCart = () => {
  // 首先从本地获取
  let localCart = wx.getStorageSync(CART_STORAGE_KEY) || [];

  // 如果后端支持购物车API，可以同步
  // return get(cart.list).catch(() => ({ items: localCart }));

  return Promise.resolve(localCart);
};

/**
 * 保存购物车到本地
 * Save cart to local storage
 * @param {Array} cartItems - 购物车商品列表
 */
const saveCart = (cartItems) => {
  wx.setStorageSync(CART_STORAGE_KEY, cartItems);
  return Promise.resolve(cartItems);
};

/**
 * 添加商品到购物车
 * Add item to cart
 * @param {Object} product - 商品信息
 * @param {number} quantity - 数量
 */
const addToCart = (product, quantity = 1) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  const existingIndex = cartItems.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    // 商品已存在，更新数量
    cartItems[existingIndex].quantity += quantity;
  } else {
    // 添加新商品
    cartItems.push({
      id: product.id,
      name: product.name,
      name_zh: product.name_zh || product.name,
      name_en: product.name_en || product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.original_price || product.price,
      image: product.image || product.image_urls?.[0] || '/images/default_flower.jpg',
      quantity: quantity,
      stock: product.stock || 999,
      selected: true // 默认选中
    });
  }

  return saveCart(cartItems);
};

/**
 * 更新购物车商品数量
 * Update cart item quantity
 * @param {number|string} productId - 商品ID
 * @param {number} quantity - 新数量
 */
const updateCartItemQuantity = (productId, quantity) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  const index = cartItems.findIndex(item => item.id === productId);

  if (index > -1) {
    if (quantity <= 0) {
      // 数量为0或负数，移除商品
      cartItems.splice(index, 1);
    } else {
      cartItems[index].quantity = quantity;
    }
  }

  return saveCart(cartItems);
};

/**
 * 从购物车移除商品
 * Remove item from cart
 * @param {number|string} productId - 商品ID
 */
const removeFromCart = (productId) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];
  cartItems = cartItems.filter(item => item.id !== productId);
  return saveCart(cartItems);
};

/**
 * 清空购物车
 * Clear cart
 */
const clearCart = () => {
  return saveCart([]);
};

/**
 * 切换商品选中状态
 * Toggle item selection
 * @param {number|string} productId - 商品ID
 */
const toggleItemSelection = (productId) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  const index = cartItems.findIndex(item => item.id === productId);

  if (index > -1) {
    cartItems[index].selected = !cartItems[index].selected;
  }

  return saveCart(cartItems);
};

/**
 * 全选/取消全选
 * Select/Deselect all items
 * @param {boolean} selected - 是否选中
 */
const selectAll = (selected = true) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  cartItems.forEach(item => {
    item.selected = selected;
  });

  return saveCart(cartItems);
};

/**
 * 获取选中的商品
 * Get selected items
 */
const getSelectedItems = () => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];
  return cartItems.filter(item => item.selected);
};

/**
 * 计算购物车总价
 * Calculate cart total
 * @param {boolean} onlySelected - 是否只计算选中的商品
 */
const calculateTotal = (onlySelected = true) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  if (onlySelected) {
    cartItems = cartItems.filter(item => item.selected);
  }

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // 运费计算逻辑
  const deliveryFee = subtotal >= 99 ? 0 : 10; // 满99免运费

  return {
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: subtotal + deliveryFee,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    selectedCount: cartItems.length
  };
};

/**
 * 获取购物车商品数量
 * Get cart item count
 */
const getCartCount = () => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};

/**
 * 检查商品是否在购物车中
 * Check if item is in cart
 * @param {number|string} productId - 商品ID
 */
const isInCart = (productId) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];
  return cartItems.some(item => item.id === productId);
};

/**
 * 获取购物车中某商品的数量
 * Get quantity of specific item in cart
 * @param {number|string} productId - 商品ID
 */
const getItemQuantity = (productId) => {
  let cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];
  const item = cartItems.find(item => item.id === productId);
  return item ? item.quantity : 0;
};

/**
 * 同步购物车到后端（如果后端支持）
 * Sync cart to backend
 */
const syncToServer = () => {
  const cartItems = wx.getStorageSync(CART_STORAGE_KEY) || [];

  // 如果后端支持购物车同步
  // return post(cart.sync, { items: cartItems });

  return Promise.resolve(cartItems);
};

/**
 * 从后端同步购物车（如果后端支持）
 * Sync cart from backend
 */
const syncFromServer = () => {
  // 如果后端支持购物车API
  // return get(cart.list).then(res => {
  //   const items = res.items || res;
  //   saveCart(items);
  //   return items;
  // });

  return getCart();
};

module.exports = {
  getCart,
  saveCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  toggleItemSelection,
  selectAll,
  getSelectedItems,
  calculateTotal,
  getCartCount,
  isInCart,
  getItemQuantity,
  syncToServer,
  syncFromServer
};
