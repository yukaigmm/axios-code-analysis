'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * 创建Axios构造函数
 *
 * @param {Object} instanceConfig 构造函数实例化的默认配置
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  // 初始化两个拦截器，一个请求的拦截器，一个响应的拦截器
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  // 如果第一个参数传的是String类型的，那么就按照第一个参数是url，第二个参数是config来解析；否则就直接将参数当做config来解析
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }
  // 根据默认配置填充config
  config = mergeConfig(this.defaults, config);
  config.method = config.method ? config.method.toLowerCase() : 'get';

  // Hook up interceptors middleware
  // 遍历interceptor的request和response，将request从前面开始填充到chain数组中（包含成功和失败的状态）；将response从后面开始填充到数组中
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);


  // 将请求拦截通过unshift放在数组的前面，响应拦截通过push放在请求的后面
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 先执行请求拦截，然后再发请求，最后再执行响应拦截
  // 在此处，请求拦截返回的结果是发送请求的参数，请求返回的response是传入响应拦截的参数
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};



// 发请求就是调用axios的request方法，传入配置和参数(如需要)

// 给没有请求主体的请求绑定方法
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

// 给有请求主体的请求绑定方法
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;
