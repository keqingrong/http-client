import { Headers, CustomAxiosRequestConfig } from './types';

/** HttpClient 自定义 HTTP 头 */
export const HTTP_CLIENT_OPTIONS_HEADER_NAME = 'X-Http-Client-Options';

/**
 * HTTP 头名称转小写
 */
export function getLowerCaseHeaders(headers: Headers = {}) {
  const lowerCaseHeaders: Headers = {};
  Object.keys(headers).forEach(headerName => {
    lowerCaseHeaders[headerName.toLowerCase()] = headers[headerName];
  });
  return lowerCaseHeaders;
}

/**
 * 从 HTTP 头中获取自定义配置
 */
export function getCustomConfigFromHeader(
  headers: Headers
): CustomAxiosRequestConfig {
  if (headers && headers[HTTP_CLIENT_OPTIONS_HEADER_NAME]) {
    try {
      return JSON.parse(headers[HTTP_CLIENT_OPTIONS_HEADER_NAME]) || {};
    } catch (error) {
      console.warn('getCustomConfigFromHeader', error);
    }
  }
  return {};
}

/**
 * 从 HTTP 头中移除自定义配置
 */
export function removeCustomConfigFromHeader(headers: Headers): Headers {
  if (headers && headers[HTTP_CLIENT_OPTIONS_HEADER_NAME]) {
    delete headers[HTTP_CLIENT_OPTIONS_HEADER_NAME];
  }
  return headers || {};
}

/**
 * 生成新的带自定义配置的 HTTP 头
 * @param headers
 * @param httpClientOptions
 */
export function buildCustomConfigHeader(
  headers: Headers = {},
  httpClientOptions: CustomAxiosRequestConfig
): Headers {
  return {
    ...headers,
    [HTTP_CLIENT_OPTIONS_HEADER_NAME]: JSON.stringify(httpClientOptions)
  };
}
