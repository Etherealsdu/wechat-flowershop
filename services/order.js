// 订单服务层
// Order Service

const { get, post, put, del } = require('../utils/request.js');
const { orders } = require('../config/api.js');

/**
 * 获取订单列表
 * Get order list
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.status - 订单状态
 * @param {string} params.dateFrom - 开始日期
 * @param {string} params.dateTo - 结束日期
 */
const getOrderList = (params = {}) => {
  return get(orders.list, {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    status: params.status,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search
  });
};

/**
 * 获取订单详情
 * Get order detail
 * @param {number|string} id - 订单ID
 */
const getOrderDetail = (id) => {
  return get(`${orders.detail}/${id}`);
};

/**
 * 创建订单
 * Create order
 * @param {Object} orderData - 订单数据
 * @param {Array} orderData.items - 订单商品列表
 * @param {string} orderData.consignee - 收货人
 * @param {string} orderData.phone - 联系电话
 * @param {string} orderData.address - 收货地址
 * @param {string} orderData.remark - 备注
 * @param {string} orderData.deliveryType - 配送方式
 */
const createOrder = (orderData) => {
  return post(orders.create, {
    items: orderData.items.map(item => ({
      product_id: item.id || item.productId,
      quantity: item.quantity,
      price: item.price
    })),
    consignee: orderData.consignee,
    phone: orderData.phone,
    address: orderData.address,
    remark: orderData.remark || '',
    delivery_type: orderData.deliveryType || 'delivery',
    total_amount: orderData.totalAmount
  });
};

/**
 * 取消订单
 * Cancel order
 * @param {number|string} id - 订单ID
 */
const cancelOrder = (id) => {
  return put(`${orders.cancel}/${id}/status`, {
    status: 'cancelled'
  });
};

/**
 * 获取订单统计
 * Get order statistics
 */
const getOrderStats = () => {
  return get(orders.stats);
};

/**
 * 确认收货
 * Confirm receipt
 * @param {number|string} id - 订单ID
 */
const confirmReceipt = (id) => {
  return put(`${orders.detail}/${id}/status`, {
    status: 'delivered'
  });
};

/**
 * 订单状态映射
 * Order status mapping
 */
const orderStatusMap = {
  pending: {
    text: '待付款',
    text_zh: '待付款',
    text_en: 'Pending Payment',
    color: '#ff9800'
  },
  paid: {
    text: '待发货',
    text_zh: '待发货',
    text_en: 'Paid',
    color: '#2196f3'
  },
  shipped: {
    text: '已发货',
    text_zh: '已发货',
    text_en: 'Shipped',
    color: '#9c27b0'
  },
  delivered: {
    text: '已完成',
    text_zh: '已完成',
    text_en: 'Delivered',
    color: '#4caf50'
  },
  cancelled: {
    text: '已取消',
    text_zh: '已取消',
    text_en: 'Cancelled',
    color: '#9e9e9e'
  }
};

/**
 * 获取订单状态文本
 * Get order status text
 * @param {string} status - 状态码
 * @param {string} locale - 语言
 */
const getOrderStatusText = (status, locale = 'zh') => {
  const statusInfo = orderStatusMap[status];
  if (!statusInfo) return status;
  return locale === 'zh' ? statusInfo.text_zh : statusInfo.text_en;
};

/**
 * 转换后端订单数据为前端格式
 * Transform backend order data to frontend format
 * @param {Object} order - 后端订单数据
 */
const transformOrder = (order) => {
  if (!order) return null;

  return {
    id: order.id,
    orderNo: order.order_no,
    status: order.status,
    statusText: getOrderStatusText(order.status),
    statusColor: orderStatusMap[order.status]?.color || '#999',
    items: order.items || [],
    totalAmount: parseFloat(order.total_amount),
    consignee: order.consignee,
    phone: order.phone,
    address: order.address,
    remark: order.remark,
    paymentMethod: order.payment_method,
    paymentTime: order.payment_time,
    shippingTime: order.shipping_time,
    deliveredTime: order.delivered_time,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    user: order.user
  };
};

/**
 * 批量转换订单数据
 * Transform multiple orders
 * @param {Array} orders - 订单数组
 */
const transformOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map(transformOrder);
};

module.exports = {
  getOrderList,
  getOrderDetail,
  createOrder,
  cancelOrder,
  getOrderStats,
  confirmReceipt,
  orderStatusMap,
  getOrderStatusText,
  transformOrder,
  transformOrders
};
