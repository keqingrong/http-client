import { AxiosRequestConfig } from 'axios';

/** 自定义的 axios 配置键名列表 */
export const customAxiosRequestConfigKeys: (keyof CustomAxiosRequestConfig)[] = [
  'loginRequired',
  'jsonpCallback',
  'jsonpCallbackFunction'
];

/** 自定义的 axios 配置 */
export interface CustomAxiosRequestConfig {
  /** 是否需要登录检查 */
  loginRequired?: boolean;
  /** JSONP 回调参数 */
  jsonpCallback?: string;
  /** JSONP 回调函数名称 */
  jsonpCallbackFunction?: string;
}

/**
 * TODO: 支持处理业务异常
 */
export interface HttpClientRequestConfig
  extends AxiosRequestConfig,
    CustomAxiosRequestConfig {}

/** 网络类型 */
export type NetworkType = '2G' | '3G' | '4G' | '5G' | 'WIFI' | 'unknown';

export interface HttpClientInitConfig {
  /**
   * QueryString/URLSearchParams 参数序列化
   * get, post application/x-www-form-urlencoded, jsonp 会调用该函数
   */
  paramsSerializer?(params: any): string;
}

export interface QueryStringParams {
  [key: string]: any;
}

export interface Headers {
  [headerName: string]: string;
}
