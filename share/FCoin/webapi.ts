import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CodeObj, Code } from '../../types/Code';

const axiosConf = {
  // 统一的请求配置
  options: {
    timeout: 60000,
    headers: {},
  },

  // 请求前处理
  beforeRequest (config: AxiosRequestConfig) {
    return config;
  },

  // 请求后处理
  afterResponse (response: AxiosResponse) {
    return response;
  },

  // 为了将所有结果统一处理，http请求不抛出异常，只用Code返回异常状态。
  catchError (error: any) {
    console.error('接口出错', error);
    let revert = 0;
    if (error.response) {
      revert = error.response.status;
    } else if (error.request) {
      revert = Code.Error;
      if (error.message === 'Network Error') {
        revert = Code.NetError;
      }
    } else {
      revert = Code.Error;
    }
    return Promise.resolve({ data: new CodeObj(revert) });
  },
};

// 创建代理
function Proxy (baseURL: string) {
  const proxy = axios.create(Object.assign({ baseURL }, axiosConf.options));
  proxy.interceptors.request.use(axiosConf.beforeRequest, axiosConf.catchError); // req处理
  proxy.interceptors.response.use(axiosConf.afterResponse, axiosConf.catchError); // res处理
  return proxy;
}
export const FCoinHttp = Proxy('https://www.fcoin.pro');

export interface FCoinResponse<T> {
  status: 'ok' | 'error';
  err_msg: string;
  data: T;
}

export const FCoinRequest = function<T> (res: AxiosResponse<FCoinResponse<T>>) {
  const data = res.data;
  if (data.status !== 'ok') return new CodeObj(Code.Error, data.data, data.err_msg);
  return new CodeObj(Code.Success, data.data);
};
