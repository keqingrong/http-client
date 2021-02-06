/// <reference types="axios" />

declare module 'axios/lib/core/buildFullPath' {
    export default function buildFullPath(
      baseURL?: string,
      requestedURL?: string
    ): string;
  }
  
  declare module 'axios/lib/core/createError' {
    import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
    export default function createError(
      message: string,
      config: AxiosRequestConfig,
      code?: string,
      request?: Object,
      response?: AxiosResponse
    ): AxiosError;
  }
  
  declare module 'axios/lib/core/enhanceError' {
    import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
    export default function enhanceError(
      error: Error,
      config: AxiosRequestConfig,
      code?: string,
      request?: Object,
      response?: AxiosResponse
    ): AxiosError;
  }
  
  declare module 'axios/lib/core/mergeConfig' {
    import type { AxiosRequestConfig } from 'axios';
    export default function mergeConfig(
      config1: AxiosRequestConfig,
      config2: AxiosRequestConfig
    ): AxiosRequestConfig;
  }
  
  declare module 'axios/lib/helpers/buildURL' {
    export default function buildURL(
      url: string,
      params: any,
      paramsSerializer?: (params: any) => string
    ): string;
  }
  
  declare module 'axios/lib/utils' {
    export function isURLSearchParams(val: any): boolean;
  }
  