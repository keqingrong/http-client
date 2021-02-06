import { AxiosRequestConfig } from 'axios';
import { CommonInterceptorCreator } from './types';
import { removeCustomConfigFromHeader } from '../utils';
import { jsonpAdapter } from '../adapters';

/**
 * 清理工作拦截器
 */
export const cleanupInterceptorCreator: CommonInterceptorCreator = () => {
  return {
    request: (config: AxiosRequestConfig) => {
      // JSONP 请求需要把自定义的 HTTP 头 X-Http-Client-Options 传入 jsonpAdapter
      if (config.adapter?.name === jsonpAdapter.name) {
        return config;
      }

      removeCustomConfigFromHeader(config.headers);
      return config;
    }
  };
};
