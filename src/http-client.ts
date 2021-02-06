import axios, {
  AxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
  AxiosError
} from 'axios';
import { isURLSearchParams } from 'axios/lib/utils';
import qs from 'qs';
import {
  CustomAxiosRequestConfig,
  HttpClientRequestConfig,
  HttpClientInitConfig,
  QueryStringParams
} from './types';
import {
  cleanupInterceptorCreator,
  developmentInterceptorCreator,
  CommonInterceptorCreator,
  CommonInterceptorCreatorOptions
} from './interceptors';
import { buildCustomConfigHeader } from './utils';
import { jsonpAdapter } from './adapters';

export class HttpClient {
  instance = axios.create({
    timeout: 5000,
    withCredentials: true
  });
  paramsSerializer = (params: QueryStringParams | URLSearchParams): string => {
    if (isURLSearchParams(params)) {
      return params.toString();
    }
    // 数组使用 repeat 风格，即 "a=b&a=c&a=d" 风格，
    // 和 <form> 多选、URLSearchParams 保持一致。
    return qs.stringify(params, { arrayFormat: 'repeat' });
  };

  constructor(options?: HttpClientInitConfig) {
    if (options?.paramsSerializer) {
      this.paramsSerializer = options.paramsSerializer;
    }

    // 初始化内部使用的拦截器
    this.addInternalInterceptors();
  }

  getInstance() {
    return this.instance;
  }

  setInstance(instance: AxiosInstance) {
    return (this.instance = instance);
  }

  request<T = any>(config: HttpClientRequestConfig = {}) {
    // axios 会对 config 进行标准化，丢掉自定义配置，导致拦截器中无法获取。
    // 因此放到自定义 HTTP 头中，处理完后，在请求前去除。
    // TODO: 除了 axios 的，其他配置全部透传？
    const {
      loginRequired,
      jsonpCallback,
      jsonpCallbackFunction,
      ...restConfig
    } = config;
    const httpClientOptions: CustomAxiosRequestConfig = {
      loginRequired,
      jsonpCallback,
      jsonpCallbackFunction
    };
    restConfig.headers = buildCustomConfigHeader(
      restConfig.headers,
      httpClientOptions
    );
    return this.instance.request<T>(restConfig);
  }

  get<T = any>(
    url: string,
    query: QueryStringParams | null = {},
    config: HttpClientRequestConfig = {}
  ) {
    const defaultConfig: AxiosRequestConfig = {
      url,
      method: 'GET',
      params: query,
      paramsSerializer: this.paramsSerializer
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  post<T = any>(url: string, data?: any, config?: HttpClientRequestConfig) {
    const defaultConfig: AxiosRequestConfig = {
      url,
      method: 'POST',
      data: data
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  /**
   * "application/x-www-form-urlencoded"
   */
  postFormUrlencoded<T = any>(
    url: string,
    data: QueryStringParams | URLSearchParams,
    config: HttpClientRequestConfig = {}
  ) {
    const defaultConfig: AxiosRequestConfig = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: this.paramsSerializer(data)
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  /**
   * "multipart/form-data"
   */
  postFormData<T = any>(
    url: string,
    data: FormData,
    config: HttpClientRequestConfig = {}
  ) {
    const defaultConfig: AxiosRequestConfig = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: data
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  /**
   * "application/json"
   */
  postJSON<T = any>(
    url: string,
    data: Object = {},
    config: HttpClientRequestConfig = {}
  ) {
    const defaultConfig: AxiosRequestConfig = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      data: data
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  /**
   * JSONP
   */
  jsonp<T = any>(
    url: string,
    query: QueryStringParams | null = {},
    config: HttpClientRequestConfig = {}
  ) {
    const defaultConfig: HttpClientRequestConfig = {
      url,
      method: 'GET',
      params: query,
      paramsSerializer: this.paramsSerializer,
      adapter: jsonpAdapter
    };
    return this.request<T>(Object.assign({}, defaultConfig, config));
  }

  /**
   * 增加请求拦截器
   */
  addRequestInterceptor(
    onFulfilled?: (
      config: HttpClientRequestConfig
    ) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: AxiosError) => any
  ): () => void {
    if (onFulfilled || onRejected) {
      const interceptorId = this.instance.interceptors.request.use(
        onFulfilled,
        onRejected
      );
      return () => {
        this.instance.interceptors.request.eject(interceptorId);
      };
    } else {
      return () => {};
    }
  }

  /**
   * 增加响应拦截器
   */
  addResponseInterceptor(
    onFulfilled?: (
      response: AxiosResponse
    ) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: AxiosError) => any
  ): () => void {
    if (onFulfilled || onRejected) {
      const interceptorId = this.instance.interceptors.response.use(
        onFulfilled,
        onRejected
      );
      return () => {
        this.instance.interceptors.response.eject(interceptorId);
      };
    }
    return () => {};
  }

  /**
   * 增加内部拦截器
   */
  addInternalInterceptors() {
    // axios 的拦截器越早调用，越靠近真实请求，清理工作放在真实请求前
    this.addInterceptorCreators(
      [
        cleanupInterceptorCreator, // 执行清理工作的拦截器
        developmentInterceptorCreator // 开发日志拦截器
      ],
      {}
    );
  }

  /**
   * 增加拦截器并初始化注入参数
   */
  addInterceptorCreators(
    interceptorCreators: CommonInterceptorCreator[],
    options: CommonInterceptorCreatorOptions
  ) {
    if (Array.isArray(interceptorCreators) && interceptorCreators.length > 0) {
      interceptorCreators.forEach(creator => {
        const interceptor = creator(options);
        this.addRequestInterceptor(
          interceptor.request,
          interceptor.requestError
        );
        this.addResponseInterceptor(
          interceptor.response,
          interceptor.responseError
        );
      });
    }
  }
}

const httpClient = new HttpClient();

export { httpClient, httpClient as http };
