// utils/i18n-util.js
const app = getApp();

// 获取翻译函数
function getI18n() {
  return app.globalData.i18n;
}

// 便捷翻译函数
function t(path, params) {
  const i18n = getI18n();
  return i18n.t(path, params);
}

// 获取当前语言
function getCurrentLocale() {
  const i18n = getI18n();
  return i18n.getLocale();
}

// 设置语言
function setLocale(locale) {
  const i18n = getI18n();
  return i18n.setLocale(locale);
}

// 获取支持的所有语言
function getSupportedLocales() {
  const i18n = getI18n();
  return i18n.getSupportedLocales();
}

module.exports = {
  getI18n,
  t,
  getCurrentLocale,
  setLocale,
  getSupportedLocales
};