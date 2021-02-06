import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface AxiosRequestInterceptor {
  (config: AxiosRequestConfig):
    | AxiosRequestConfig
    | Promise<AxiosRequestConfig>;
}

export interface AxiosResponseInterceptor {
  (response: AxiosResponse): AxiosResponse | Promise<AxiosResponse>;
}

export interface AxiosRejectedInterceptor {
  (error: AxiosError): any;
}

export interface CommonInterceptor {
  request?: AxiosRequestInterceptor;
  requestError?: AxiosRejectedInterceptor;
  response?: AxiosResponseInterceptor;
  responseError?: AxiosRejectedInterceptor;
}

export interface Passport {
  /** 登录页面地址 */
  loginUrl: string;
  /** 退出登录页面地址 */
  logoutUrl: string;
  /** 判断用户是否登陆 */
  isLogin(): Promise<boolean>;
  /** 登陆 */
  login(): any;
  /** 退出登录 */
  logout(): any;
}

// TODO: 不强制包含 Passport ？
export interface CommonInterceptorCreatorOptions {
  passport?: Passport;
}

export interface CommonInterceptorCreator {
  (options?: CommonInterceptorCreatorOptions): CommonInterceptor;
}
