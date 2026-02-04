// app.js - Main application file
const i18n = require('./i18n/index.js');
const productService = require('./services/product.js');
const categoryService = require('./services/category.js');
const orderService = require('./services/order.js');
const userService = require('./services/user.js');
const cartService = require('./services/cart.js');

App({
  globalData: {
    userInfo: null,
    cart: [],
    orders: [],
    flowers: [],        // 商品列表（从后端获取）
    categories: [],     // 分类列表（从后端获取）
    i18n: i18n,
    isDataLoaded: false, // 标记数据是否已加载
    isLoggedIn: false    // 登录状态
  },

  // 服务实例引用（方便页面调用）
  services: {
    product: productService,
    category: categoryService,
    order: orderService,
    user: userService,
    cart: cartService
  },

  onLaunch: function () {
    console.log('Flower Shop Mini Program Launched');

    // 初始化数据
    this.initData();

    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow: function (options) {
    console.log('Flower Shop App Showed');
    this.updateNavigationBarTitle();
  },

  onHide: function () {
    console.log('Flower Shop App Hidden');
  },

  onError: function (msg) {
    console.error('App Error:', msg);
  },

  /**
   * 初始化数据
   * Initialize data from backend
   */
  initData: function() {
    // 从本地加载购物车
    this.loadCart();

    // 从本地加载订单
    this.loadOrders();

    // 从后端加载商品和分类数据
    this.loadProductsFromServer();
    this.loadCategoriesFromServer();
  },

  /**
   * 从后端加载商品数据
   * Load products from backend
   */
  loadProductsFromServer: function() {
    productService.getProductList({ pageSize: 100, isActive: true, isOnSale: true })
      .then(res => {
        const products = res.data || res;
        this.globalData.flowers = productService.transformProducts(products);
        this.globalData.isDataLoaded = true;

        // 根据语言更新显示
        this.updateFlowerDataByLanguage();

        console.log('Products loaded from server:', this.globalData.flowers.length);
      })
      .catch(err => {
        console.error('Failed to load products from server:', err);
        // 如果后端请求失败，使用本地备用数据
        this.initLocalFlowerData();
      });
  },

  /**
   * 从后端加载分类数据
   * Load categories from backend
   */
  loadCategoriesFromServer: function() {
    categoryService.getCategoryList({ isActive: true })
      .then(res => {
        const categories = res.data || res;
        this.globalData.categories = categoryService.transformCategories(
          Array.isArray(categories) ? categories : [categories]
        );
        console.log('Categories loaded from server:', this.globalData.categories.length);
      })
      .catch(err => {
        console.error('Failed to load categories from server:', err);
        // 使用默认分类
        this.initLocalCategoryData();
      });
  },

  /**
   * 检查登录状态
   * Check login status
   */
  checkLoginStatus: function() {
    this.globalData.isLoggedIn = userService.isLoggedIn();
    this.globalData.userInfo = userService.getLocalUserInfo();

    if (this.globalData.isLoggedIn) {
      // 尝试刷新用户信息
      userService.getUserProfile()
        .then(user => {
          this.globalData.userInfo = userService.transformUser(user);
          wx.setStorageSync('userInfo', this.globalData.userInfo);
        })
        .catch(err => {
          console.log('Failed to refresh user profile:', err);
        });
    }
  },

  /**
   * 执行登录
   * Perform login
   */
  login: function() {
    return userService.doWxLogin()
      .then(res => {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = res.user || res.userInfo;
        return res;
      });
  },

  /**
   * 退出登录
   * Logout
   */
  logout: function() {
    return userService.logout()
      .then(() => {
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
      });
  },

  /**
   * 初始化本地备用商品数据
   * Initialize local fallback flower data
   */
  initLocalFlowerData: function() {
    const { t } = this.globalData.i18n;
    const currentLocale = this.globalData.i18n.getLocale();

    const flowers = [
      {
        id: 1,
        name: currentLocale === 'zh' ? "红玫瑰" : "Red Roses",
        name_zh: "红玫瑰",
        name_en: "Red Roses",
        price: 29.99,
        originalPrice: 39.99,
        category: "roses",
        categoryId: 1,
        image: "/images/red_roses.jpg",
        images: ["/images/red_roses.jpg"],
        description: currentLocale === 'zh' ? "送给特别的人的美丽红玫瑰" : "Beautiful red roses for your special someone",
        description_zh: "送给特别的人的美丽红玫瑰",
        description_en: "Beautiful red roses for your special someone",
        stock: 50,
        rating: 4.8,
        tags: ["romantic", "valentine"],
        deliveryTime: currentLocale === 'zh' ? "当天送达" : "Same Day",
        deliveryTime_zh: "当天送达",
        deliveryTime_en: "Same Day"
      },
      {
        id: 2,
        name: currentLocale === 'zh' ? "向日葵花束" : "Sunflower Bouquet",
        name_zh: "向日葵花束",
        name_en: "Sunflower Bouquet",
        price: 24.99,
        originalPrice: 34.99,
        category: "sunflowers",
        categoryId: 2,
        image: "/images/sunflowers.jpg",
        images: ["/images/sunflowers.jpg"],
        description: currentLocale === 'zh' ? "明亮愉快的向日葵花束" : "Bright and cheerful sunflower arrangement",
        description_zh: "明亮愉快的向日葵花束",
        description_en: "Bright and cheerful sunflower arrangement",
        stock: 30,
        rating: 4.7,
        tags: ["cheerful", "bright"],
        deliveryTime: currentLocale === 'zh' ? "当天送达" : "Same Day",
        deliveryTime_zh: "当天送达",
        deliveryTime_en: "Same Day"
      },
      {
        id: 3,
        name: currentLocale === 'zh' ? "混合花束" : "Mixed Flower Arrangement",
        name_zh: "混合花束",
        name_en: "Mixed Flower Arrangement",
        price: 39.99,
        originalPrice: 49.99,
        category: "arrangements",
        categoryId: 3,
        image: "/images/mixed_arrangement.jpg",
        images: ["/images/mixed_arrangement.jpg"],
        description: currentLocale === 'zh' ? "美丽的混合花束" : "Assorted flowers in a beautiful arrangement",
        description_zh: "美丽的混合花束",
        description_en: "Assorted flowers in a beautiful arrangement",
        stock: 25,
        rating: 4.9,
        tags: ["mixed", "arrangement"],
        deliveryTime: currentLocale === 'zh' ? "次日送达" : "Next Day",
        deliveryTime_zh: "次日送达",
        deliveryTime_en: "Next Day"
      },
      {
        id: 4,
        name: currentLocale === 'zh' ? "兰花盆栽" : "Orchid Plant",
        name_zh: "兰花盆栽",
        name_en: "Orchid Plant",
        price: 45.99,
        originalPrice: 55.99,
        category: "plants",
        categoryId: 4,
        image: "/images/orchid.jpg",
        images: ["/images/orchid.jpg"],
        description: currentLocale === 'zh' ? "装饰盆中的优雅兰花" : "Elegant orchid plant in decorative pot",
        description_zh: "装饰盆中的优雅兰花",
        description_en: "Elegant orchid plant in decorative pot",
        stock: 15,
        rating: 4.6,
        tags: ["plant", "elegant"],
        deliveryTime: currentLocale === 'zh' ? "2-3天送达" : "2-3 Days",
        deliveryTime_zh: "2-3天送达",
        deliveryTime_en: "2-3 Days"
      },
      {
        id: 5,
        name: currentLocale === 'zh' ? "百合花束" : "Lily Bouquet",
        name_zh: "百合花束",
        name_en: "Lily Bouquet",
        price: 34.99,
        originalPrice: 44.99,
        category: "lilies",
        categoryId: 5,
        image: "/images/lilies.jpg",
        images: ["/images/lilies.jpg"],
        description: currentLocale === 'zh' ? "纯白百合花束" : "Pure white lily bouquet",
        description_zh: "纯白百合花束",
        description_en: "Pure white lily bouquet",
        stock: 20,
        rating: 4.5,
        tags: ["white", "pure"],
        deliveryTime: currentLocale === 'zh' ? "当天送达" : "Same Day",
        deliveryTime_zh: "当天送达",
        deliveryTime_en: "Same Day"
      }
    ];

    this.globalData.flowers = flowers;
    this.globalData.isDataLoaded = true;
  },

  /**
   * 初始化本地备用分类数据
   * Initialize local fallback category data
   */
  initLocalCategoryData: function() {
    const currentLocale = this.globalData.i18n.getLocale();

    this.globalData.categories = [
      { id: 1, name: currentLocale === 'zh' ? '玫瑰' : 'Roses', name_zh: '玫瑰', name_en: 'Roses', icon: '🌹' },
      { id: 2, name: currentLocale === 'zh' ? '向日葵' : 'Sunflowers', name_zh: '向日葵', name_en: 'Sunflowers', icon: '🌻' },
      { id: 3, name: currentLocale === 'zh' ? '花束' : 'Arrangements', name_zh: '花束', name_en: 'Arrangements', icon: '💐' },
      { id: 4, name: currentLocale === 'zh' ? '盆栽' : 'Plants', name_zh: '盆栽', name_en: 'Plants', icon: '🪴' },
      { id: 5, name: currentLocale === 'zh' ? '百合' : 'Lilies', name_zh: '百合', name_en: 'Lilies', icon: '🌸' }
    ];
  },

  /**
   * 获取当前语言对应的值
   * Get value based on current language
   */
  getCurrentLanguageValue: function(zhValue, enValue) {
    const currentLocale = this.globalData.i18n.getLocale();
    return currentLocale === 'zh' ? zhValue : enValue;
  },

  /**
   * 更新花朵数据以匹配当前语言
   * Update flower data to match current language
   */
  updateFlowerDataByLanguage: function() {
    const currentLocale = this.globalData.i18n.getLocale();
    this.globalData.flowers.forEach(flower => {
      flower.name = currentLocale === 'zh' ? flower.name_zh : flower.name_en;
      flower.description = currentLocale === 'zh' ? flower.description_zh : flower.description_en;
      flower.deliveryTime = currentLocale === 'zh' ? (flower.deliveryTime_zh || "当天送达") : (flower.deliveryTime_en || "Same Day");
    });

    // 更新分类名称
    if (this.globalData.categories) {
      this.globalData.categories.forEach(cat => {
        if (cat.name_zh && cat.name_en) {
          cat.name = currentLocale === 'zh' ? cat.name_zh : cat.name_en;
        }
      });
    }
  },

  /**
   * 更新导航栏标题
   * Update navigation bar title
   */
  updateNavigationBarTitle: function() {
    const currentLocale = this.globalData.i18n.getLocale();
    const title = currentLocale === 'zh' ? '花店小程序' : 'Flower Shop';
    wx.setNavigationBarTitle({
      title: title
    });
  },

  /**
   * 切换语言
   * Switch language
   */
  switchLanguage: function(lang) {
    const success = this.globalData.i18n.setLocale(lang);
    if (success) {
      this.updateFlowerDataByLanguage();
      const pages = getCurrentPages();
      if (pages.length) {
        const currentPage = pages[pages.length - 1];
        if (currentPage.onLoad) {
          const options = currentPage.options || {};
          currentPage.onLoad(options);
        }
      }
    }
    return success;
  },

  // ==================== 购物车管理 ====================

  /**
   * 添加商品到购物车
   * Add item to cart
   */
  addToCart: function(flower, quantity = 1) {
    return cartService.addToCart(flower, quantity)
      .then(cart => {
        this.globalData.cart = cart;
        return cart;
      });
  },

  /**
   * 从购物车移除商品
   * Remove item from cart
   */
  removeFromCart: function(flowerId) {
    return cartService.removeFromCart(flowerId)
      .then(cart => {
        this.globalData.cart = cart;
        return cart;
      });
  },

  /**
   * 更新购物车商品数量
   * Update cart item quantity
   */
  updateCartQuantity: function(flowerId, quantity) {
    return cartService.updateCartItemQuantity(flowerId, quantity)
      .then(cart => {
        this.globalData.cart = cart;
        return cart;
      });
  },

  /**
   * 清空购物车
   * Clear cart
   */
  clearCart: function() {
    return cartService.clearCart()
      .then(() => {
        this.globalData.cart = [];
      });
  },

  /**
   * 保存购物车
   * Save cart
   */
  saveCart: function() {
    wx.setStorageSync('cart', this.globalData.cart);
  },

  /**
   * 加载购物车
   * Load cart
   */
  loadCart: function() {
    const savedCart = wx.getStorageSync('cart') || [];
    this.globalData.cart = savedCart;
  },

  /**
   * 计算购物车总价
   * Calculate cart total
   */
  calculateCartTotal: function() {
    return this.globalData.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },

  // ==================== 订单管理 ====================

  /**
   * 创建订单
   * Place order
   */
  placeOrder: function(orderDetails) {
    // 准备订单数据
    const orderData = {
      items: [...this.globalData.cart],
      totalAmount: this.calculateCartTotal(),
      ...orderDetails
    };

    // 调用后端创建订单
    return orderService.createOrder(orderData)
      .then(order => {
        // 订单创建成功，清空购物车
        this.clearCart();

        // 将订单添加到本地列表
        const transformedOrder = orderService.transformOrder(order);
        this.globalData.orders.unshift(transformedOrder);
        wx.setStorageSync('orders', this.globalData.orders);

        return transformedOrder;
      })
      .catch(err => {
        console.error('Failed to create order on server:', err);

        // 如果后端失败，使用本地订单创建
        const localOrder = {
          id: Date.now().toString(),
          orderNo: 'LOCAL' + Date.now(),
          items: [...this.globalData.cart],
          totalAmount: this.calculateCartTotal(),
          status: 'pending',
          statusText: '待付款',
          createdAt: new Date().toISOString(),
          ...orderDetails
        };

        this.globalData.orders.unshift(localOrder);
        wx.setStorageSync('orders', this.globalData.orders);
        this.clearCart();

        return localOrder;
      });
  },

  /**
   * 加载订单列表
   * Load orders
   */
  loadOrders: function() {
    // 首先从本地加载
    const savedOrders = wx.getStorageSync('orders') || [];
    this.globalData.orders = savedOrders;

    // 尝试从后端同步
    if (userService.isLoggedIn()) {
      orderService.getOrderList()
        .then(res => {
          const orders = res.data || res;
          if (Array.isArray(orders)) {
            this.globalData.orders = orderService.transformOrders(orders);
            wx.setStorageSync('orders', this.globalData.orders);
          }
        })
        .catch(err => {
          console.log('Failed to load orders from server:', err);
        });
    }
  },

  /**
   * 刷新订单列表
   * Refresh orders
   */
  refreshOrders: function() {
    return orderService.getOrderList()
      .then(res => {
        const orders = res.data || res;
        if (Array.isArray(orders)) {
          this.globalData.orders = orderService.transformOrders(orders);
          wx.setStorageSync('orders', this.globalData.orders);
        }
        return this.globalData.orders;
      });
  },

  /**
   * 取消订单
   * Cancel order
   */
  cancelOrder: function(orderId) {
    return orderService.cancelOrder(orderId)
      .then(() => {
        // 更新本地订单状态
        const order = this.globalData.orders.find(o => o.id === orderId);
        if (order) {
          order.status = 'cancelled';
          order.statusText = '已取消';
          wx.setStorageSync('orders', this.globalData.orders);
        }
      });
  }
});
