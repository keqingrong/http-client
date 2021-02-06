import { CommonInterceptorCreator } from './types';
import { getLowerCaseHeaders } from '../utils';
import { jsonpAdapter } from '../adapters';

/**
 * 开发日志拦截器
 */
export const developmentInterceptorCreator: CommonInterceptorCreator = () => {
  return {
    request: config => {
      const isJsonp = config.adapter?.name === jsonpAdapter.name;
      const method = isJsonp ? 'JSONP' : config.method?.toUpperCase();
      console.log(`[http-client] request: ${method} ${config.url}`);
      return config;
    },
    requestError: error => {
      console.groupCollapsed(
        '%c[http-client] HTTP Request Error',
        'color: red'
      );
      console.log('[http-client] error:', error);
      console.log('[http-client] config:', error.config);
      console.log('[http-client] request:', error.request);
      console.groupEnd();
      return Promise.reject(error);
    },
    response: response => {
      // 2xx状态码
      console.log('[http-client] response', response);
      return response;
    },
    responseError: error => {
      console.groupCollapsed(
        '%c[http-client] HTTP Response Error',
        'color: red'
      );
      console.log('[http-client] error:', error);
      console.log('[http-client] config:', error.config);
      console.log('[http-client] response:', error.response);
      console.log('[http-client] request:', error.request);
      console.groupEnd();

      if (error.response) {
        // 请求已发送，收到服务端响应，状态码非2xx
        const { response, config } = error;
        const { status } = response;
        switch (status) {
          case 400: {
            // 400 Bad Request
            console.error(`请检查请求参数是否正确，或者联系后端人员`);
            console.error(`请求的 URL 参数`, config.params);
            console.error(`请求体`, config.data);
            break;
          }
          case 401: {
            // 401 Unauthorized
            console.error(
              `请检查 Passport 配置和登录逻辑，如果是 APP 内嵌页面，必要时联系客户端人员`
            );
            break;
          }
          case 404: {
            // 404 Not Found
            console.error(
              `请确认请求的URL地址 "${config.url}" 是否正确，如果正确，可能是后端正在发布`
            );
            break;
          }
          case 405: {
            // 405 Method Not Allowed
            const method = config.method?.toUpperCase() || 'GET';
            console.error(
              `不支持通过 "${method}" 方法请求，请更换成其他 HTTP 方法或者和后端人员确认`
            );
            break;
          }
          case 406: {
            // 406 Not Acceptable
            const contentNegotiationHeaders = [
              'Accept',
              'Accept-Charset',
              'Accept-Encoding',
              'Accept-Language'
            ].join(', ');
            console.error(
              `请检查请求头是否设置了 ${contentNegotiationHeaders} 头部，服务端可能不支持，可以请求时放宽限制或者联系后端人员修改`
            );
            console.error(`请求头`, config.headers);
            console.error(`响应头`, response.headers);
            break;
          }
          case 415: {
            // 415 Unsupported Media Type
            const contentType = getLowerCaseHeaders(config.headers)[
              'content-type'
            ];
            console.error(
              `不支持 "Content-Type: ${contentType}"，请检查 HTTP 头，更换成其他媒体类型或者和后端人员确认`
            );
            break;
          }
        }
        return Promise.reject(error);
      } else if (error.request) {
        // 请求已发送，但没有收到服务端响应

        if (error.config && error.config.adapter?.name === jsonpAdapter.name) {
          console.error(
            '[http-client] 未能接收到服务器返回的数据，请确认 URL 支持 JSONP 方式访问，检查是否存在超时、断网等问题'
          );
          return Promise.reject(error);
        }

        console.error(
          '[http-client] 未能接收到服务器返回的数据，请确认请求域名可以访问，检查是否存在断网、跨域、重定向等问题'
        );
        return Promise.reject(error);
      } else {
        // 请求没有发送成功
        if (error.message === 'Passport Error') {
          console.error(
            '[http-client] 请求没有发送成功，请检查 Passport 配置和登录逻辑'
          );
          return Promise.reject(error);
        }

        console.error('[http-client] 请求没有发送成功，请检查请求配置');
        return Promise.reject(error);
      }
    }
  };
};
