# WeChat Flower Shop Mini Program

A production-level WeChat mini program for an online flower shop with complete e-commerce functionality.

## Features

### Core Features
- **Product Catalog**: Browse flowers by category with search and filtering
- **Shopping Cart**: Add/remove items, adjust quantities
- **Checkout Process**: Address management, delivery options
- **Order Management**: Track order status and history
- **User Profile**: Manage account information
- **Responsive Design**: Works on all device sizes

### Technical Features
- **State Management**: Global application state for cart, orders, and products
- **Local Storage**: Persistent cart and order data
- **Performance Optimized**: Efficient rendering and caching
- **Accessibility**: Proper semantic markup and ARIA labels
- **Error Handling**: Graceful error states and user feedback

## Project Structure

```
├── app.js                 # Main application logic and global state
├── app.json               # Global configuration and routing
├── app.wxss               # Global styles
├── sitemap.json           # Sitemap configuration
├── images/                # Static assets
│   ├── banner1.jpg        # Hero banner images
│   ├── banner2.jpg
│   ├── banner3.jpg
│   ├── roses-icon.png     # Category icons
│   ├── sunflowers-icon.png
│   ├── arrangements-icon.png
│   ├── plants-icon.png
│   ├── roses-category.jpg # Category images
│   ├── sunflowers-category.jpg
│   ├── lilies-category.jpg
│   ├── orchids-category.jpg
│   ├── red_roses.jpg      # Product images
│   ├── sunflowers.jpg
│   ├── mixed_arrangement.jpg
│   ├── orchid.jpg
│   ├── lilies.jpg
│   ├── cart.png           # Tab bar icons
│   ├── cart-active.png
│   ├── home.png
│   ├── home-active.png
│   ├── shop.png
│   ├── shop-active.png
│   ├── profile.png
│   └── profile-active.png
└── pages/                 # Page components
    ├── index/             # Home page
    │   ├── index.wxml
    │   ├── index.js
    │   └── index.wxss
    ├── shop/              # Product catalog
    │   ├── shop.wxml
    │   ├── shop.js
    │   └── shop.wxss
    ├── cart/              # Shopping cart
    │   ├── cart.wxml
    │   ├── cart.js
    │   └── cart.wxss
    ├── checkout/          # Checkout process
    │   ├── checkout.wxml
    │   ├── checkout.js
    │   └── checkout.wxss
    ├── flower-detail/     # Product detail
    │   ├── flower-detail.wxml
    │   ├── flower-detail.js
    │   └── flower-detail.wxss
    ├── profile/           # User profile
    │   ├── profile.wxml
    │   ├── profile.js
    │   └── profile.wxss
    └── orders/            # Order history
        ├── orders.wxml
        ├── orders.js
        └── orders.wxss
```

## Setup Instructions

1. Install WeChat Developer Tools
2. Clone this repository
3. Open the project in WeChat Developer Tools
4. Build and preview the mini program

## Key Implementation Details

### Global State Management
The app uses `globalData` in `app.js` to manage:
- User information
- Shopping cart items
- Order history
- Product catalog

### Data Persistence
Cart and order data are persisted using `wx.setStorageSync()` and `wx.getStorageSync()`.

### Responsive Design
The UI uses flexible layouts and responsive units to ensure good experience on all devices.

### Performance Considerations
- Efficient list rendering with proper keys
- Image optimization with appropriate sizes
- Lazy loading where applicable

## Testing Strategy

### Manual Testing Checklist
- [ ] Home page loads correctly
- [ ] Product browsing works
- [ ] Add to cart functionality
- [ ] Cart management
- [ ] Checkout flow
- [ ] Order placement
- [ ] Order tracking
- [ ] Responsive design on various screen sizes

### Edge Cases Tested
- Empty cart scenarios
- Out of stock items
- Network failures
- Invalid form inputs
- Large quantities

## Security Considerations

- Input validation for forms
- Secure data transmission (HTTPS)
- Proper error handling without exposing system details
- Sanitized user-generated content

## Deployment Notes

1. Ensure all images are optimized for web
2. Test on different network conditions
3. Verify all external APIs are properly configured
4. Set up analytics for user behavior tracking
5. Implement crash reporting for error monitoring

## Internationalization (i18n) Support

This mini program now includes comprehensive internationalization support for Chinese and English languages, with Chinese as the default language.

### i18n Architecture

```
├── i18n/                    # Internationalization module
│   ├── zh.json             # Chinese language pack
│   ├── en.json             # English language pack
│   └── index.js            # i18n manager module
├── utils/
│   └── i18n-util.js        # i18n utility functions
```

### Features

- **Dual Language Support**: Full support for Chinese and English
- **Dynamic Language Switching**: Users can switch languages at runtime
- **Persistent Language Preference**: Selected language is saved in local storage
- **Comprehensive Coverage**: All UI texts are internationalized
- **Fallback Mechanism**: Falls back to Chinese if translation is missing

### Implementation

The i18n system is implemented as follows:

1. **Language Files**: JSON files containing translations organized by sections
2. **i18n Manager**: Handles language switching and translation lookups
3. **Utility Functions**: Helper functions to easily access translations
4. **Page Integration**: Each page loads appropriate translations on initialization

### Usage

To add internationalization to a new page:

1. Import the i18n utility: `const i18nUtil = require('../../utils/i18n-util.js');`
2. In `onLoad` or `onShow`, update i18n data:
   ```javascript
   updateI18nData: function() {
     const i18nData = {
       title: i18nUtil.t('common.title'),
       buttonText: i18nUtil.t('common.buttonText')
     };
     
     this.setData({
       i18n: i18nData
     });
   }
   ```
3. Use the translated values in your WXML template

### Adding New Translations

1. Add new key-value pairs to both `i18n/zh.json` and `i18n/en.json`
2. Use the key in your code with `i18nUtil.t('namespace.keyName')`
3. The system will automatically select the appropriate translation based on user's language preference

## Future Enhancements

- Payment integration
- Push notifications
- Wishlist functionality
- Review and rating system
- Social sharing features
- Advanced search and filtering
- Inventory management integration
