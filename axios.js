'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * 创建axios实例
 * 将axios和上下文的this绑定，返回的instance是一个函数
 *
 * @param {Object} defaultConfig 实例的默认配置
 * @return {Axios} Axios的实例
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);
  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// 根据默认配置实例化Axios，模块输出的就是这个axios方法
var axios = createInstance(defaults);
// 扩展axios的继承关系,使得axios实例也能继承
axios.Axios = Axios;

// 定义axios的create方法,就是根据配置在默认配置的基础上创建axios实例
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
// 扩充axios的Cancel和CancelToken方法
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
// 扩充axios的all和spread方法
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;


// Allow use of default import syntax in TypeScript
module.exports.default = axios;

axios.get('https://www.apiopen.top/satinCommentApi?id=27610708&page=1').then(res => {
  console.log(res)
})
console.dir(axios)