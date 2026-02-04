// i18n/index.js - 国际化管理器
const zhLang = require('./zh.json');
const enLang = require('./en.json');

// 语言包映射
const locales = {
  zh: zhLang,
  en: enLang
};

// 默认语言
let currentLocale = 'zh';

// 初始化语言
function initLocale() {
  // 尝试从本地存储获取用户选择的语言
  try {
    const savedLocale = wx.getStorageSync('locale');
    if (savedLocale && locales[savedLocale]) {
      currentLocale = savedLocale;
    } else {
      // 获取系统语言
      const systemInfo = wx.getSystemInfoSync();
      const systemLang = systemInfo.language;
      // 简单判断是否为中文环境
      if (systemLang && (systemLang.startsWith('zh') || systemLang === 'en')) {
        currentLocale = systemLang.startsWith('zh') ? 'zh' : 'en';
      }
      // 保存默认语言
      wx.setStorageSync('locale', currentLocale);
    }
  } catch (e) {
    console.warn('Failed to get locale from storage, using default zh');
    currentLocale = 'zh';
  }
}

// 获取当前语言
function getLocale() {
  return currentLocale;
}

// 设置语言
function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
    wx.setStorageSync('locale', locale);
    return true;
  }
  console.warn(`Locale ${locale} not supported`);
  return false;
}

// 翻译函数
function t(path, params = {}) {
  const keys = path.split('.');
  let value = locales[currentLocale];
  
  for (let key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }
  
  if (value === undefined) {
    console.warn(`Translation key '${path}' not found in locale '${currentLocale}'`);
    // 尝试回退到中文
    if (currentLocale !== 'zh') {
      value = locales['zh'];
      for (let key of keys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
    }
    // 如果中文也没有，则返回原始键
    if (value === undefined) {
      return path;
    }
  }
  
  // 处理参数插值
  let result = String(value);
  if (params && typeof params === 'object') {
    for (let key in params) {
      const reg = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(reg, params[key]);
    }
  }
  
  return result;
}

// 获取所有支持的语言
function getSupportedLocales() {
  return Object.keys(locales);
}

// 初始化
initLocale();

module.exports = {
  getLocale,
  setLocale,
  t,
  getSupportedLocales,
  locales
};