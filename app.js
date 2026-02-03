// app.js - Main application file
App({
  globalData: {
    userInfo: null,
    cart: [],
    orders: [],
    flowers: []
  },
  
  onLaunch: function () {
    // Application launch logic
    console.log('Flower Shop Mini Program Launched');
    
    // Initialize flower data
    this.initFlowerData();
  },
  
  onShow: function (options) {
    // Application show logic
    console.log('Flower Shop App Showed');
  },
  
  onHide: function () {
    // Application hide logic
    console.log('Flower Shop App Hidden');
  },
  
  onError: function (msg) {
    console.error('App Error:', msg);
  },
  
  initFlowerData: function() {
    // Initialize sample flower data
    const flowers = [
      {
        id: 1,
        name: "Red Roses",
        price: 29.99,
        originalPrice: 39.99,
        category: "roses",
        image: "/images/red_roses.jpg",
        description: "Beautiful red roses for your special someone",
        stock: 50,
        rating: 4.8,
        tags: ["romantic", "valentine"],
        deliveryTime: "Same Day"
      },
      {
        id: 2,
        name: "Sunflower Bouquet",
        price: 24.99,
        originalPrice: 34.99,
        category: "sunflowers",
        image: "/images/sunflowers.jpg",
        description: "Bright and cheerful sunflower arrangement",
        stock: 30,
        rating: 4.7,
        tags: ["cheerful", "bright"],
        deliveryTime: "Same Day"
      },
      {
        id: 3,
        name: "Mixed Flower Arrangement",
        price: 39.99,
        originalPrice: 49.99,
        category: "arrangements",
        image: "/images/mixed_arrangement.jpg",
        description: "Assorted flowers in a beautiful arrangement",
        stock: 25,
        rating: 4.9,
        tags: ["mixed", "arrangement"],
        deliveryTime: "Next Day"
      },
      {
        id: 4,
        name: "Orchid Plant",
        price: 45.99,
        originalPrice: 55.99,
        category: "plants",
        image: "/images/orchid.jpg",
        description: "Elegant orchid plant in decorative pot",
        stock: 15,
        rating: 4.6,
        tags: ["plant", "elegant"],
        deliveryTime: "2-3 Days"
      },
      {
        id: 5,
        name: "Lily Bouquet",
        price: 34.99,
        originalPrice: 44.99,
        category: "lilies",
        image: "/images/lilies.jpg",
        description: "Pure white lily bouquet",
        stock: 20,
        rating: 4.5,
        tags: ["white", "pure"],
        deliveryTime: "Same Day"
      }
    ];
    
    this.globalData.flowers = flowers;
  },
  
  // Cart management methods
  addToCart: function(flower, quantity = 1) {
    const existingItem = this.globalData.cart.find(item => item.id === flower.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.globalData.cart.push({
        ...flower,
        quantity: quantity
      });
    }
    
    this.saveCart();
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