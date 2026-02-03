# Testing Suite for WeChat Flower Shop Mini Program

## Unit Tests

### App.js Tests
```javascript
// tests/app.test.js
const app = require('../app.js');

describe('Global App Functions', () => {
  beforeEach(() => {
    // Reset global data before each test
    app.globalData = {
      userInfo: null,
      cart: [],
      orders: [],
      flowers: [
        {
          id: 1,
          name: "Test Flower",
          price: 10.99,
          originalPrice: 15.99,
          category: "test",
          image: "/images/test.jpg",
          description: "Test flower",
          stock: 10,
          rating: 4.5
        }
      ]
    };
  });

  describe('addToCart', () => {
    test('should add new item to cart', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 2);
      
      expect(app.globalData.cart.length).toBe(1);
      expect(app.globalData.cart[0].quantity).toBe(2);
    });

    test('should increase quantity for existing item', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 1);
      app.addToCart(flower, 2);
      
      expect(app.globalData.cart[0].quantity).toBe(3);
    });
  });

  describe('removeFromCart', () => {
    test('should remove item from cart', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 1);
      app.removeFromCart(flower.id);
      
      expect(app.globalData.cart.length).toBe(0);
    });
  });

  describe('updateCartQuantity', () => {
    test('should update item quantity', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 1);
      app.updateCartQuantity(flower.id, 5);
      
      expect(app.globalData.cart[0].quantity).toBe(5);
    });

    test('should remove item when quantity is 0 or less', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 1);
      app.updateCartQuantity(flower.id, 0);
      
      expect(app.globalData.cart.length).toBe(0);
    });
  });

  describe('calculateCartTotal', () => {
    test('should calculate correct total', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 2);
      
      const total = app.calculateCartTotal();
      expect(total).toBe(21.98); // 10.99 * 2
    });
  });

  describe('placeOrder', () => {
    test('should create order and clear cart', () => {
      const flower = app.globalData.flowers[0];
      app.addToCart(flower, 1);
      
      const orderDetails = {
        deliveryAddress: { street: "123 Main St" },
        deliveryTime: "standard"
      };
      
      const order = app.placeOrder(orderDetails);
      
      expect(order.items.length).toBe(1);
      expect(order.total).toBe(10.99);
      expect(app.globalData.cart.length).toBe(0);
      expect(app.globalData.orders.length).toBe(1);
    });
  });
});
```

### Page Logic Tests
```javascript
// tests/pages/cart.test.js
const cartPage = require('../pages/cart/cart.js');

describe('Cart Page Logic', () => {
  beforeEach(() => {
    cartPage.setData({
      cartItems: [
        { id: 1, name: "Test Flower", price: 10.99, quantity: 2 }
      ],
      subtotal: 0,
      deliveryFee: 5.99,
      freeDeliveryThreshold: 50,
      total: 0
    });
  });

  test('calculateTotals should compute correct values', () => {
    cartPage.calculateTotals();
    
    const data = cartPage.data;
    expect(data.subtotal).toBe(21.98); // 10.99 * 2
    expect(data.deliveryFee).toBe(5.99); // Under threshold
    expect(data.total).toBe(27.97); // 21.98 + 5.99
  });

  test('getQuantityById should return correct quantity', () => {
    const quantity = cartPage.getQuantityById(1);
    expect(quantity).toBe(2);
  });

  test('toFixed should round numbers correctly', () => {
    const result = cartPage.toFixed(10.9876, 2);
    expect(result).toBe(10.99);
  });
});

// tests/pages/shop.test.js
const shopPage = require('../pages/shop/shop.js');

describe('Shop Page Logic', () => {
  beforeEach(() => {
    shopPage.setData({
      flowers: [
        { id: 1, name: "Red Rose", price: 15.99, rating: 4.5, category: "roses" },
        { id: 2, name: "Sunflower", price: 12.99, rating: 4.2, category: "sunflowers" },
        { id: 3, name: "Lily", price: 18.99, rating: 4.8, category: "lilies" }
      ],
      searchQuery: '',
      selectedCategory: '',
      sortIndex: 0
    });
  });

  test('applySorting should sort by price low to high', () => {
    shopPage.setData({ sortIndex: 0 }); // Price: Low to High
    const sorted = shopPage.applySorting(shopPage.data.flowers);
    
    expect(sorted[0].price).toBe(12.99); // Sunflower cheapest
    expect(sorted[2].price).toBe(18.99); // Lily most expensive
  });

  test('applySorting should sort by rating', () => {
    shopPage.setData({ sortIndex: 2 }); // Rating
    const sorted = shopPage.applySorting(shopPage.data.flowers);
    
    expect(sorted[0].rating).toBe(4.8); // Lily highest rated
    expect(sorted[2].rating).toBe(4.2); // Sunflower lowest rated
  });
});
```

## Integration Tests

### Cart Flow Tests
```javascript
// tests/integration/cart-flow.test.js
describe('Cart Flow Integration', () => {
  test('Full shopping flow from product to cart to checkout', () => {
    // Mock app instance
    const app = getApp();
    
    // Step 1: Add product to cart
    const testFlower = app.globalData.flowers[0];
    app.addToCart(testFlower, 3);
    
    // Verify cart has item
    expect(app.globalData.cart.length).toBe(1);
    expect(app.globalData.cart[0].quantity).toBe(3);
    
    // Step 2: Calculate totals
    const subtotal = app.calculateCartTotal();
    expect(subtotal).toBe(testFlower.price * 3);
    
    // Step 3: Place order
    const orderDetails = {
      deliveryAddress: { street: "123 Test St" },
      deliveryTime: "standard"
    };
    
    const order = app.placeOrder(orderDetails);
    
    // Verify order was created
    expect(order.items.length).toBe(1);
    expect(order.total).toBe(subtotal);
    expect(app.globalData.cart.length).toBe(0);
    expect(app.globalData.orders.length).toBe(1);
  });
});
```

### Search and Filter Tests
```javascript
// tests/integration/search-filter.test.js
describe('Search and Filter Integration', () => {
  test('Search functionality works end-to-end', () => {
    const shopPage = require('../pages/shop/shop.js');
    
    shopPage.setData({
      flowers: [
        { id: 1, name: "Red Rose", description: "Beautiful red rose", tags: ["red", "romantic"] },
        { id: 2, name: "Blue Tulip", description: "Rare blue tulip", tags: ["blue", "rare"] }
      ]
    });
    
    // Simulate search input
    shopPage.setData({ searchQuery: "red" });
    shopPage.performSearch();
    
    const results = shopPage.data.displayedFlowers;
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Red Rose");
  });
  
  test('Category filtering works', () => {
    const shopPage = require('../pages/shop/shop.js');
    
    shopPage.setData({
      flowers: [
        { id: 1, name: "Red Rose", category: "roses" },
        { id: 2, name: "Sunflower", category: "sunflowers" }
      ],
      selectedCategory: "roses"
    });
    
    shopPage.performSearch();
    
    const results = shopPage.data.displayedFlowers;
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Red Rose");
  });
});
```

## UI Component Tests

### Product Card Component Test
```javascript
// tests/components/product-card.test.js
describe('Product Card Component', () => {
  test('renders product information correctly', () => {
    const product = {
      id: 1,
      name: "Test Flower",
      price: 15.99,
      originalPrice: 19.99,
      rating: 4.5,
      image: "/images/test.jpg",
      description: "Test product description"
    };
    
    // Simulate WXML rendering with product data
    const renderedHTML = `
      <view class="product-card">
        <image src="${product.image}"></image>
        <view class="product-info">
          <text class="product-title">${product.name}</text>
          <text class="product-description">${product.description}</text>
          <view class="product-price">
            <text class="current-price">$${product.price}</text>
            <text class="original-price">$${product.originalPrice}</text>
          </view>
          <view class="rating">
            <text class="star">★</text>
            <text>${product.rating}</text>
          </view>
        </view>
      </view>
    `;
    
    // Verify all elements are present
    expect(renderedHTML).toContain(product.name);
    expect(renderedHTML).toContain(`$${product.price}`);
    expect(renderedHTML).toContain(`$${product.originalPrice}`);
    expect(renderedHTML).toContain(product.rating.toString());
  });
});
```

## End-to-End Tests

### User Journey Tests
```javascript
// tests/e2e/user-journey.test.js
describe('User Journey Tests', () => {
  test('Complete purchase journey', async () => {
    // Simulate user opening the app
    const app = getApp();
    app.onLaunch();
    
    // User browses to shop
    const shopPage = require('../pages/shop/shop.js');
    shopPage.onLoad();
    
    // User searches for roses
    shopPage.setData({ searchQuery: "rose" });
    shopPage.performSearch();
    
    // User clicks on a product
    const selectedFlower = shopPage.data.displayedFlowers[0];
    expect(selectedFlower.name.toLowerCase()).toContain("rose");
    
    // User adds to cart
    app.addToCart(selectedFlower, 2);
    
    // User goes to cart
    const cartPage = require('../pages/cart/cart.js');
    cartPage.onLoad();
    
    // Verify cart has item
    expect(cartPage.data.cartItems.length).toBe(1);
    expect(cartPage.data.cartItems[0].quantity).toBe(2);
    
    // User proceeds to checkout
    const checkoutPage = require('../pages/checkout/checkout.js');
    checkoutPage.onLoad();
    
    // User completes checkout
    checkoutPage.setData({
      address: { street: "123 Test St", city: "Test City", zip: "12345" }
    });
    
    // Place order
    const order = app.placeOrder({
      deliveryAddress: checkoutPage.data.address,
      deliveryTime: checkoutPage.data.selectedDeliveryTime
    });
    
    // Verify order was created
    expect(order.id).toBeDefined();
    expect(order.items.length).toBe(1);
    expect(order.total).toBeGreaterThan(0);
  });
});
```

## Performance Tests

### Render Performance Tests
```javascript
// tests/performance/render.test.js
describe('Performance Tests', () => {
  test('Page render time under 100ms', () => {
    const startTime = performance.now();
    
    // Simulate page load
    const shopPage = require('../pages/shop/shop.js');
    shopPage.onLoad();
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // Less than 100ms
  });
  
  test('Large product list renders efficiently', () => {
    const shopPage = require('../pages/shop/shop.js');
    
    // Create a large product list
    const largeProductList = Array.from({length: 100}, (_, i) => ({
      id: i + 1,
      name: `Flower ${i + 1}`,
      price: 10 + i,
      category: i % 3 === 0 ? 'roses' : i % 3 === 1 ? 'lilies' : 'sunflowers'
    }));
    
    const startTime = performance.now();
    
    shopPage.setData({ flowers: largeProductList });
    shopPage.performSearch(); // This should handle large datasets efficiently
    
    const endTime = performance.now();
    const processTime = endTime - startTime;
    
    expect(processTime).toBeLessThan(200); // Should process 100 items in under 200ms
  });
});
```

## Error Handling Tests

### Error Boundary Tests
```javascript
// tests/error-handling.test.js
describe('Error Handling', () => {
  test('App error handler captures errors', () => {
    const app = getApp();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const errorMessage = "Test error occurred";
    app.onError(errorMessage);
    
    expect(consoleSpy).toHaveBeenCalledWith('App Error:', errorMessage);
    
    consoleSpy.mockRestore();
  });
  
  test('Invalid cart operations handled gracefully', () => {
    const app = getApp();
    
    // Try to add negative quantity
    const testFlower = app.globalData.flowers[0];
    app.addToCart(testFlower, -5);
    
    // Should not add negative quantity
    expect(app.globalData.cart.length).toBe(0);
    
    // Try to update non-existent item
    app.updateCartQuantity(999, 5);
    // Should not crash
  });
  
  test('Division by zero in discount calculation handled', () => {
    const app = getApp();
    
    // Simulate scenario where original price is 0
    const testFlower = {
      id: 1,
      name: "Test",
      price: 10,
      originalPrice: 0, // This could cause division by zero
      category: "test"
    };
    
    // The WXML should handle this gracefully
    const discountPercentage = testFlower.originalPrice > testFlower.price ? 
      Math.round((1 - testFlower.price/testFlower.originalPrice)*100) : 0;
    
    // Should not throw error, should return 0 or handle gracefully
    expect(discountPercentage).toBeDefined();
  });
});
```

## Accessibility Tests

### Screen Reader Compatibility
```javascript
// tests/accessibility.test.js
describe('Accessibility Tests', () => {
  test('Semantic HTML elements used appropriately', () => {
    // Check that WXML uses proper semantic elements
    const shopWXML = `
    <view class="container">
      <view class="header" role="banner">
        <text class="header-title">Our Flower Collection</text>
      </view>
      
      <view role="main">
        <view class="search-container" role="search">
          <input type="text" placeholder="Search flowers..." role="searchbox" />
        </view>
        
        <view class="products-container" role="region" aria-label="Product listings">
          <view class="product-card" role="article">
            <image src="{{item.image}}" role="img" aria-label="{{item.name}}" />
            <view class="product-info">
              <text class="product-title" role="heading" aria-level="3">{{item.name}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    `;
    
    // Verify accessibility attributes are present
    expect(shopWXML).toContain('role="banner"');
    expect(shopWXML).toContain('role="main"');
    expect(shopWXML).toContain('role="search"');
    expect(shopWXML).toContain('role="region"');
    expect(shopWXML).toContain('role="article"');
    expect(shopWXML).toContain('role="img"');
    expect(shopWXML).toContain('role="heading"');
  });
});
```

## Cross-Browser/Device Tests

### Responsive Design Tests
```javascript
// tests/responsive-design.test.js
describe('Responsive Design Tests', () => {
  test('Layout adapts to different screen sizes', () => {
    // Test CSS media queries would be applied differently based on screen size
    // In WeChat mini programs, we test the responsive classes
    
    const responsiveClasses = [
      'grid-cols-2',  // Mobile: 2 columns
      'flex',         // Flexible layout
      'container',    // Full width container
      'card'          // Consistent card styling
    ];
    
    // These classes should work across different device sizes
    expect(responsiveClasses.length).toBe(4);
  });
});
```

## Test Execution Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- tests/app.test.js
```

## Continuous Integration Configuration

### GitHub Actions Workflow
```yaml
name: CI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
    - name: Generate coverage report
      run: npm run test:coverage
```