# 微信花店小程序

一个生产级别的微信小程序，用于在线花店，具备完整的电子商务功能。

## 功能特点

### 核心功能
- **产品目录**: 按类别浏览鲜花，支持搜索和筛选
- **购物车**: 添加/删除商品，调整数量
- **结账流程**: 地址管理，配送选项
- **订单管理**: 跟踪订单状态和历史
- **用户档案**: 管理账户信息
- **响应式设计**: 适配各种设备尺寸

### 技术特点
- **状态管理**: 全局应用状态管理购物车、订单和商品
- **本地存储**: 购物车和订单数据持久化
- **性能优化**: 高效渲染和缓存
- **无障碍设计**: 正确的语义标记和ARIA标签
- **错误处理**: 优雅的错误状态和用户反馈

## 项目结构

```
├── app.js                 # 主应用逻辑和全局状态
├── app.json               # 全局配置和路由
├── app.wxss               # 全局样式
├── sitemap.json           # 站点地图配置
├── images/                # 静态资源
│   ├── banner1.jpg        # 首页横幅图片
│   ├── banner2.jpg
│   ├── banner3.jpg
│   ├── roses-icon.png     # 类别图标
│   ├── sunflowers-icon.png
│   ├── arrangements-icon.png
│   ├── plants-icon.png
│   ├── roses-category.jpg # 类别图片
│   ├── sunflowers-category.jpg
│   ├── lilies-category.jpg
│   ├── orchids-category.jpg
│   ├── red_roses.jpg      # 商品图片
│   ├── sunflowers.jpg
│   ├── mixed_arrangement.jpg
│   ├── orchid.jpg
│   ├── lilies.jpg
│   ├── cart.png           # 底部导航图标
│   ├── cart-active.png
│   ├── home.png
│   ├── home-active.png
│   ├── shop.png
│   ├── shop-active.png
│   ├── profile.png
│   └── profile-active.png
└── pages/                 # 页面组件
    ├── index/             # 首页
    │   ├── index.wxml
    │   ├── index.js
    │   └── index.wxss
    ├── shop/              # 商品目录
    │   ├── shop.wxml
    │   ├── shop.js
    │   └── shop.wxss
    ├── cart/              # 购物车
    │   ├── cart.wxml
    │   ├── cart.js
    │   └── cart.wxss
    ├── checkout/          # 结账流程
    │   ├── checkout.wxml
    │   ├── checkout.js
    │   └── checkout.wxss
    ├── flower-detail/     # 商品详情
    │   ├── flower-detail.wxml
    │   ├── flower-detail.js
    │   └── flower-detail.wxss
    ├── profile/           # 用户档案
    │   ├── profile.wxml
    │   ├── profile.js
    │   └── profile.wxss
    └── orders/            # 订单历史
        ├── orders.wxml
        ├── orders.js
        └── orders.wxss
```

## 安装说明

1. 安装微信开发者工具
2. 克隆此仓库
3. 在微信开发者工具中打开项目
4. 构建并预览小程序

## 关键实现细节

### 全局状态管理
应用使用 `app.js` 中的 `globalData` 来管理：
- 用户信息
- 购物车商品
- 订单历史
- 产品目录

### 数据持久化
购物车和订单数据通过 `wx.setStorageSync()` 和 `wx.getStorageSync()` 进行持久化。

### 响应式设计
UI 使用灵活布局和响应式单位，确保在所有设备上都有良好的体验。

### 性能考虑
- 高效列表渲染，使用适当的 key
- 图像优化，使用适当尺寸
- 适用时采用懒加载

## 测试策略

### 手动测试清单
- [ ] 首页正确加载
- [ ] 产品浏览正常
- [ ] 加入购物车功能
- [ ] 购物车管理
- [ ] 结账流程
- [ ] 订单提交
- [ ] 订单跟踪
- [ ] 各种屏幕尺寸的响应式设计

### 边缘情况测试
- 购物车为空的情况
- 缺货商品
- 网络故障
- 无效表单输入
- 大量商品

## 安全考虑

- 表单输入验证
- 安全数据传输 (HTTPS)
- 适当的错误处理，不暴露系统细节
- 净化用户生成的内容

## 部署说明

1. 确保所有图像都为网页优化
2. 在不同网络条件下测试
3. 验证所有外部 API 都已正确配置
4. 设置分析以跟踪用户行为
5. 实施崩溃报告以监控错误

## 国际化 (i18n) 支持

本小程序现在包含了对中文和英文的全面国际化支持，默认使用中文。

### i18n 架构

```
├── i18n/                    # 国际化模块
│   ├── zh.json             # 中文语言包
│   ├── en.json             # 英文语言包
│   └── index.js            # i18n 管理模块
├── utils/
│   └── i18n-util.js        # i18n 工具函数
```

### 特性

- **双语支持**: 完整支持中文和英文
- **动态语言切换**: 用户可以在运行时切换语言
- **持久化语言偏好**: 选定的语言保存在本地存储中
- **全面覆盖**: 所有UI文本均已国际化
- **回退机制**: 如果翻译缺失，则回退到中文

### 实现

i18n 系统实现如下：

1. **语言文件**: 包含按模块组织的翻译的 JSON 文件
2. **i18n 管理器**: 处理语言切换和翻译查找
3. **工具函数**: 便于访问翻译的辅助函数
4. **页面集成**: 每个页面在初始化时加载适当的翻译

### 使用方法

要为新页面添加国际化：

1. 导入 i18n 工具: `const i18nUtil = require('../../utils/i18n-util.js');`
2. 在 `onLoad` 或 `onShow` 中，更新 i18n 数据:
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
3. 在 WXML 模板中使用翻译值

### 添加新翻译

1. 在 `i18n/zh.json` 和 `i18n/en.json` 中添加新的键值对
2. 在代码中使用 `i18nUtil.t('namespace.keyName')` 使用该键
3. 系统将根据用户的语言偏好自动选择适当的翻译

## 未来增强

- 支付集成
- 推送通知
- 心愿单功能
- 评论和评级系统
- 社交分享功能
- 高级搜索和筛选
- 库存管理集成