import { AxiosRequestConfig, AxiosResponse } from 'axios';
import buildFullPath from 'axios/lib/core/buildFullPath';
import buildURL from 'axios/lib/helpers/buildURL';
import enhanceError from 'axios/lib/core/enhanceError';
import fetchJsonp from 'fetch-jsonp';
import { getCustomConfigFromHeader } from '../utils';

export function jsonpAdapter(config: AxiosRequestConfig) {
  return new Promise<AxiosResponse>(function(resolve, reject) {
    const httpClientOptions = getCustomConfigFromHeader(config.headers);
    const fetchJsonpOptions: fetchJsonp.Options = {
      timeout: config.timeout,
      jsonpCallback: httpClientOptions.jsonpCallback,
      jsonpCallbackFunction: httpClientOptions.jsonpCallbackFunction
    };

    const fullPath: string = buildFullPath(config.baseURL, config.url);
    const url = buildURL(fullPath, config.params, config.paramsSerializer);

    if (config.cancelToken) {
      config.cancelToken.promise.then(function onCanceled(cancel) {
        // TODO: 支持取消请求
        reject(cancel);
      });
    }

    // FIXME: 异常处理，比如服务端不支持传入的 jsonpCallback 参数
    // 跨源读取阻止(CORB)功能阻止了 MIME 类型为 application/json 的跨源响应。有关详细信息，请参阅 https://www.chromestatus.com/feature/5629709824032768。
    fetchJsonp(url, fetchJsonpOptions)
      .then(res => res.json())
      .then(responseData => {
        resolve({
          data: responseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config,
          request: null
        });
      })
      .catch(error => {
        // TODO: fetch-jsonp 抛出的异常：
        // new Error('JSONP request to ' + _url + ' timed out')
        // new Error('JSONP request to ' + _url + ' failed')

        // TODO: jsonp 模拟 XMLHttpRequest 请求对象返回，让拦截器知道虽然请求失败，但请求已经被发送
        // xhr adapter 的 request 是 XMLHttpRequest https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
        // http adapter 的 request 是 http.ClientRequest https://nodejs.org/dist/latest-v14.x/docs/api/http.html#http_class_http_clientrequest
        const requestLike = {
          readyState: 4,
          response: '',
          responseText: '',
          responseType: '',
          responseURL: '',
          responseXML: null,
          status: 0,
          statusText: '',
          timeout: config.timeout
        };
        reject(enhanceError(error, config, undefined, requestLike, undefined));
      });
  });
}
