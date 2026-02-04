// app.js - Main application file
const i18n = require('./i18n/index.js');

App({
  globalData: {
    userInfo: null,
    cart: [],
    orders: [],
    flowers: [],
    i18n: i18n // 将国际化模块添加到全局数据
  },
  
  onLaunch: function () {
    // Application launch logic
    console.log('Flower Shop Mini Program Launched');

    // Load persisted cart and orders from storage
    this.loadCart();
    this.loadOrders();

    // Initialize flower data
    this.initFlowerData();
  },
  
  onShow: function (options) {
    // Application show logic
    console.log('Flower Shop App Showed');
    // 更新导航栏标题为当前语言
    this.updateNavigationBarTitle();
  },
  
  onHide: function () {
    // Application hide logic
    console.log('Flower Shop App Hidden');
  },
  
  onError: function (msg) {
    console.error('App Error:', msg);
  },
  
  initFlowerData: function() {
    // 获取国际化实例
    const { t } = this.globalData.i18n;
    
    // Initialize sample flower data
    const flowers = [
      {
        id: 1,
        name: t('common.appName').includes('Flower') ? "Red Roses" : "红玫瑰", // 根据语言决定名称
        name_zh: "红玫瑰",
        name_en: "Red Roses",
        price: 29.99,
        originalPrice: 39.99,
        category: "roses",
        image: "/images/red_roses.jpg",
        description: t('common.appName').includes('Flower') ? "Beautiful red roses for your special someone" : "送给特别的人的美丽红玫瑰",
        description_zh: "送给特别的人的美丽红玫瑰",
        description_en: "Beautiful red roses for your special someone",
        stock: 50,
        rating: 4.8,
        tags: ["romantic", "valentine"],
        deliveryTime: t('common.appName').includes('Flower') ? "Same Day" : "当天送达"
      },
      {
        id: 2,
        name: t('common.appName').includes('Flower') ? "Sunflower Bouquet" : "向日葵花束",
        name_zh: "向日葵花束",
        name_en: "Sunflower Bouquet",
        price: 24.99,
        originalPrice: 34.99,
        category: "sunflowers",
        image: "/images/sunflowers.jpg",
        description: t('common.appName').includes('Flower') ? "Bright and cheerful sunflower arrangement" : "明亮愉快的向日葵花束",
        description_zh: "明亮愉快的向日葵花束",
        description_en: "Bright and cheerful sunflower arrangement",
        stock: 30,
        rating: 4.7,
        tags: ["cheerful", "bright"],
        deliveryTime: t('common.appName').includes('Flower') ? "Same Day" : "当天送达"
      },
      {
        id: 3,
        name: t('common.appName').includes('Flower') ? "Mixed Flower Arrangement" : "混合花束",
        name_zh: "混合花束",
        name_en: "Mixed Flower Arrangement",
        price: 39.99,
        originalPrice: 49.99,
        category: "arrangements",
        image: "/images/mixed_arrangement.jpg",
        description: t('common.appName').includes('Flower') ? "Assorted flowers in a beautiful arrangement" : "美丽的混合花束",
        description_zh: "美丽的混合花束",
        description_en: "Assorted flowers in a beautiful arrangement",
        stock: 25,
        rating: 4.9,
        tags: ["mixed", "arrangement"],
        deliveryTime: t('common.appName').includes('Flower') ? "Next Day" : "次日送达"
      },
      {
        id: 4,
        name: t('common.appName').includes('Flower') ? "Orchid Plant" : "兰花盆栽",
        name_zh: "兰花盆栽",
        name_en: "Orchid Plant",
        price: 45.99,
        originalPrice: 55.99,
        category: "plants",
        image: "/images/orchid.jpg",
        description: t('common.appName').includes('Flower') ? "Elegant orchid plant in decorative pot" : "装饰盆中的优雅兰花",
        description_zh: "装饰盆中的优雅兰花",
        description_en: "Elegant orchid plant in decorative pot",
        stock: 15,
        rating: 4.6,
        tags: ["plant", "elegant"],
        deliveryTime: t('common.appName').includes('Flower') ? "2-3 Days" : "2-3天送达"
      },
      {
        id: 5,
        name: t('common.appName').includes('Flower') ? "Lily Bouquet" : "百合花束",
        name_zh: "百合花束",
        name_en: "Lily Bouquet",
        price: 34.99,
        originalPrice: 44.99,
        category: "lilies",
        image: "/images/lilies.jpg",
        description: t('common.appName').includes('Flower') ? "Pure white lily bouquet" : "纯白百合花束",
        description_zh: "纯白百合花束",
        description_en: "Pure white lily bouquet",
        stock: 20,
        rating: 4.5,
        tags: ["white", "pure"],
        deliveryTime: t('common.appName').includes('Flower') ? "Same Day" : "当天送达"
      }
    ];
    
    // 根据当前语言设置花朵名称和描述
    flowers.forEach(flower => {
      flower.name = this.getCurrentLanguageValue(flower.name_zh, flower.name_en);
      flower.description = this.getCurrentLanguageValue(flower.description_zh, flower.description_en);
      flower.deliveryTime = this.getCurrentLanguageValue(flower.deliveryTime_zh || "当天送达", flower.deliveryTime_en || "Same Day");
    });
    
    this.globalData.flowers = flowers;
  },
  
  // 获取当前语言对应的值
  getCurrentLanguageValue: function(zhValue, enValue) {
    const currentLocale = this.globalData.i18n.getLocale();
    return currentLocale === 'zh' ? zhValue : enValue;
  },
  
  // 更新花朵数据以匹配当前语言
  updateFlowerDataByLanguage: function() {
    const currentLocale = this.globalData.i18n.getLocale();
    this.globalData.flowers.forEach(flower => {
      flower.name = currentLocale === 'zh' ? flower.name_zh : flower.name_en;
      flower.description = currentLocale === 'zh' ? flower.description_zh : flower.description_en;
      flower.deliveryTime = currentLocale === 'zh' ? (flower.deliveryTime_zh || "当天送达") : (flower.deliveryTime_en || "Same Day");
    });
  },
  
  // 更新导航栏标题
  updateNavigationBarTitle: function() {
    const currentLocale = this.globalData.i18n.getLocale();
    const title = currentLocale === 'zh' ? '花店小程序' : 'Flower Shop';
    wx.setNavigationBarTitle({
      title: title
    });
  },
  
  // 切换语言
  switchLanguage: function(lang) {
    const success = this.globalData.i18n.setLocale(lang);
    if (success) {
      // 更新花朵数据以匹配新语言
      this.updateFlowerDataByLanguage();
      // 可能需要刷新当前页面
      const pages = getCurrentPages();
      if (pages.length) {
        const currentPage = pages[pages.length - 1];
        if (currentPage.onLoad) {
          // 重新加载当前页面
          const options = currentPage.options || {};
          currentPage.onLoad(options);
        }
      }
    }
    return success;
  },
  
  // Cart management methods
  addToCart: function(flower, quantity = 1) {
    // Validate quantity
    if (quantity <= 0) {
      return { success: false, message: 'invalidQuantity' };
    }

    // Check stock availability
    const currentFlower = this.globalData.flowers.find(f => f.id === flower.id);
    if (!currentFlower || currentFlower.stock <= 0) {
      return { success: false, message: 'outOfStock' };
    }

    const existingItem = this.globalData.cart.find(item => item.id === flower.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    // Check if requested quantity exceeds stock
    if (newTotalQuantity > currentFlower.stock) {
      return { success: false, message: 'exceedsStock', availableStock: currentFlower.stock - currentQuantity };
    }

    if (existingItem) {
      existingItem.quantity = newTotalQuantity;
    } else {
      this.globalData.cart.push({
        ...flower,
        quantity: quantity
      });
    }

    this.saveCart();
    return { success: true };
  },
  
  removeFromCart: function(flowerId) {
    this.globalData.cart = this.globalData.cart.filter(item => item.id !== flowerId);
    this.saveCart();
  },
  
  updateCartQuantity: function(flowerId, quantity) {
    const item = this.globalData.cart.find(item => item.id === flowerId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeFromCart(flowerId);
      }
    }
    this.saveCart();
  },
  
  clearCart: function() {
    this.globalData.cart = [];
    this.saveCart();
  },
  
  saveCart: function() {
    wx.setStorageSync('cart', this.globalData.cart);
  },
  
  loadCart: function() {
    const savedCart = wx.getStorageSync('cart') || [];
    this.globalData.cart = savedCart;
  },

  loadOrders: function() {
    const savedOrders = wx.getStorageSync('orders') || [];
    this.globalData.orders = savedOrders;
  },
  
  // Order management methods
  placeOrder: function(orderDetails) {
    const order = {
      id: Date.now().toString(),
      items: [...this.globalData.cart],
      total: this.calculateCartTotal(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...orderDetails
    };
    
    this.globalData.orders.unshift(order);
    this.clearCart();
    
    // Save to storage
    wx.setStorageSync('orders', this.globalData.orders);
    
    return order;
  },
  
  calculateCartTotal: function() {
    return this.globalData.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
})