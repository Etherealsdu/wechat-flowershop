// pages/shop/shop.js
const i18nUtil = require('../../utils/i18n-util.js');
const productService = require('../../services/product.js');
const categoryService = require('../../services/category.js');
const cartService = require('../../services/cart.js');

Page({
  data: {
    flowers: [],
    displayedFlowers: [],
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    selectedCategoryId: null,
    sortIndex: 0,
    sortOptions: [],
    cartItemCount: 0,
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    i18n: {}
  },

  onLoad: function(options) {
    this.updateI18nData();
    this.loadCategories();
    this.loadProducts();
    this.updateCartCount();

    // Apply category filter if passed from another page
    if (options.category) {
      this.setData({
        selectedCategory: options.category,
        selectedCategoryId: options.categoryId || null
      });
    }
  },

  onShow: function() {
    this.updateI18nData();
    this.updateCartCount();
  },

  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      hasMore: true,
      flowers: [],
      displayedFlowers: []
    });
    this.loadProducts();
    wx.stopPullDownRefresh();
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts();
    }
  },

  updateI18nData: function() {
    const i18nData = {
      title: i18nUtil.t('shop.title'),
      all: i18nUtil.t('shop.all'),
      sortBy: i18nUtil.t('shop.sortBy'),
      sortByPriceLow: i18nUtil.t('shop.sortByPriceLow'),
      sortByPriceHigh: i18nUtil.t('shop.sortByPriceHigh'),
      sortByRating: i18nUtil.t('shop.sortByRating'),
      filter: i18nUtil.t('shop.filter'),
      resetFilters: i18nUtil.t('shop.resetFilters'),
      addToCart: i18nUtil.t('common.addToCart'),
      buyNow: i18nUtil.t('common.buyNow'),
      price: i18nUtil.t('common.price'),
      originalPrice: i18nUtil.t('common.originalPrice'),
      quantity: i18nUtil.t('common.quantity'),
      total: i18nUtil.t('common.total'),
      confirm: i18nUtil.t('common.confirm'),
      cancel: i18nUtil.t('common.cancel'),
      back: i18nUtil.t('common.back'),
      more: i18nUtil.t('common.more'),
      loading: i18nUtil.t('common.loading'),
      noData: i18nUtil.t('common.noData'),
      refresh: i18nUtil.t('common.refresh'),
      settings: i18nUtil.t('common.settings'),
      language: i18nUtil.t('common.language'),
      chinese: i18nUtil.t('common.chinese'),
      english: i18nUtil.t('common.english'),
      searchPlaceholder: i18nUtil.t('search.placeholder') || 'Search flowers...'
    };

    const sortOptions = [
      i18nUtil.t('shop.sortByPriceLow'),
      i18nUtil.t('shop.sortByPriceHigh'),
      i18nUtil.t('shop.sortByRating'),
      i18nData.newest || 'Newest'
    ];

    this.setData({
      i18n: i18nData,
      sortOptions: sortOptions
    });
  },

  loadCategories: function() {
    const app = getApp();

    categoryService.getCategoryList({ isActive: true })
      .then(res => {
        const categories = res.data || res;
        const transformedCategories = categoryService.transformCategories(
          Array.isArray(categories) ? categories : [categories]
        );

        const currentLocale = i18nUtil.getCurrentLocale();
        transformedCategories.forEach(cat => {
          if (cat.name_zh && cat.name_en) {
            cat.name = currentLocale === 'zh' ? cat.name_zh : cat.name_en;
          }
        });

        this.setData({
          categories: transformedCategories
        });
      })
      .catch(err => {
        console.log('Using local categories:', err);
        this.setData({
          categories: app.globalData.categories || []
        });
      });
  },

  loadProducts: function() {
    const app = getApp();
    this.setData({ loading: true });

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      isActive: true,
      isOnSale: true
    };

    // 添加分类筛选
    if (this.data.selectedCategoryId) {
      params.categoryId = this.data.selectedCategoryId;
    }

    // 添加搜索关键词
    if (this.data.searchQuery) {
      params.search = this.data.searchQuery;
    }

    productService.getProductList(params)
      .then(res => {
        const products = res.data || res;
        const transformedProducts = productService.transformProducts(
          Array.isArray(products) ? products : [products]
        );

        // 根据当前语言更新显示
        const currentLocale = i18nUtil.getCurrentLocale();
        transformedProducts.forEach(flower => {
          flower.name = currentLocale === 'zh' ? flower.name_zh : flower.name_en;
          flower.description = currentLocale === 'zh' ? flower.description_zh : flower.description_en;
        });

        // 更新全局数据
        app.globalData.flowers = transformedProducts;

        // 应用本地筛选和排序
        let displayedFlowers = this.applyLocalFilters(transformedProducts);
        displayedFlowers = this.applySorting(displayedFlowers);

        this.setData({
          flowers: transformedProducts,
          displayedFlowers: displayedFlowers,
          loading: false,
          hasMore: res.pagination ? res.pagination.page < res.pagination.totalPages : false
        });
      })
      .catch(err => {
        console.log('Using local products:', err);
        // 使用本地数据
        const allFlowers = app.globalData.flowers;
        let displayedFlowers = this.applyLocalFilters(allFlowers);
        displayedFlowers = this.applySorting(displayedFlowers);

        this.setData({
          flowers: allFlowers,
          displayedFlowers: displayedFlowers,
          loading: false,
          hasMore: false
        });
      });
  },

  loadMoreProducts: function() {
    this.setData({
      page: this.data.page + 1
    });

    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      isActive: true,
      isOnSale: true
    };

    if (this.data.selectedCategoryId) {
      params.categoryId = this.data.selectedCategoryId;
    }

    if (this.data.searchQuery) {
      params.search = this.data.searchQuery;
    }

    this.setData({ loading: true });

    productService.getProductList(params)
      .then(res => {
        const products = res.data || res;
        const transformedProducts = productService.transformProducts(
          Array.isArray(products) ? products : [products]
        );

        const currentLocale = i18nUtil.getCurrentLocale();
        transformedProducts.forEach(flower => {
          flower.name = currentLocale === 'zh' ? flower.name_zh : flower.name_en;
          flower.description = currentLocale === 'zh' ? flower.description_zh : flower.description_en;
        });

        const allFlowers = [...this.data.flowers, ...transformedProducts];
        let displayedFlowers = this.applyLocalFilters(allFlowers);
        displayedFlowers = this.applySorting(displayedFlowers);

        this.setData({
          flowers: allFlowers,
          displayedFlowers: displayedFlowers,
          loading: false,
          hasMore: res.pagination ? res.pagination.page < res.pagination.totalPages : false
        });
      })
      .catch(err => {
        console.log('Load more failed:', err);
        this.setData({
          loading: false,
          hasMore: false
        });
      });
  },

  applyLocalFilters: function(flowers) {
    let filteredFlowers = [...flowers];

    // 应用搜索过滤
    if (this.data.searchQuery) {
      const query = this.data.searchQuery.toLowerCase();
      filteredFlowers = filteredFlowers.filter(flower =>
        (flower.name && flower.name.toLowerCase().includes(query)) ||
        (flower.description && flower.description.toLowerCase().includes(query)) ||
        (flower.tags && flower.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // 应用分类过滤
    if (this.data.selectedCategory) {
      filteredFlowers = filteredFlowers.filter(flower =>
        flower.category === this.data.selectedCategory ||
        flower.categoryId === this.data.selectedCategoryId
      );
    }

    return filteredFlowers;
  },

  onSearchInput: function(e) {
    this.setData({
      searchQuery: e.detail.value
    });
    this.performSearch();
  },

  performSearch: function() {
    // 如果有搜索关键词，重新从后端搜索
    if (this.data.searchQuery && this.data.searchQuery.length >= 2) {
      this.setData({
        page: 1,
        hasMore: true
      });
      this.loadProducts();
    } else {
      // 本地筛选
      let displayedFlowers = this.applyLocalFilters(this.data.flowers);
      displayedFlowers = this.applySorting(displayedFlowers);
      this.setData({
        displayedFlowers: displayedFlowers
      });
    }
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    const categoryId = e.currentTarget.dataset.categoryid;

    this.setData({
      selectedCategory: category || '',
      selectedCategoryId: categoryId || null,
      page: 1,
      hasMore: true
    });

    // 重新加载商品
    this.loadProducts();
  },

  onSortChange: function(e) {
    this.setData({
      sortIndex: parseInt(e.detail.value)
    });
    this.performSearch();
  },

  applySorting: function(flowers) {
    const sortedFlowers = [...flowers];

    switch(this.data.sortIndex) {
      case 0: // Price: Low to High
        return sortedFlowers.sort((a, b) => a.price - b.price);
      case 1: // Price: High to Low
        return sortedFlowers.sort((a, b) => b.price - a.price);
      case 2: // Rating
        return sortedFlowers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 3: // Newest (by ID)
        return sortedFlowers.sort((a, b) => b.id - a.id);
      default:
        return sortedFlowers;
    }
  },

  resetFilters: function() {
    this.setData({
      searchQuery: '',
      selectedCategory: '',
      selectedCategoryId: null,
      sortIndex: 0,
      page: 1,
      hasMore: true
    });
    this.loadProducts();
  },

  viewFlowerDetail: function(e) {
    const flower = e.currentTarget.dataset.flower;
    wx.navigateTo({
      url: `/pages/flower-detail/flower-detail?id=${flower.id}`
    });
  },

  quickAddToCart: function(e) {
    const flower = e.currentTarget.dataset.flower;
    const app = getApp();

    if (flower.stock <= 0) {
      wx.showToast({
        title: this.data.i18n.outOfStock || 'Out of stock',
        icon: 'none'
      });
      return;
    }

    app.addToCart(flower, 1);
    this.updateCartCount();

    wx.showToast({
      title: this.data.i18n.addedToCart || 'Added to cart!',
      icon: 'success'
    });
  },

  goToCart: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  updateCartCount: function() {
    const count = cartService.getCartCount();
    this.setData({
      cartItemCount: count
    });

    // 更新 tabBar 徽标
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: count.toString()
      });
    } else {
      wx.removeTabBarBadge({
        index: 2
      });
    }
  }
});
