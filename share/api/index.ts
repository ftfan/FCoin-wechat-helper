import Axios from 'axios';
import { CodeObj, Code } from '../../types/Code';
import { FCoinTickerData } from 'types/FCoinWatch';

export const FCoinDataApiHandler = Axios.create({
  baseURL: 'http://127.0.0.1:7777',
});

FCoinDataApiHandler.interceptors.request.use((config) => {
  return config;
}, (error: any) => {
  return Promise.resolve(new CodeObj(Code.Error, error));
});

FCoinDataApiHandler.interceptors.response.use((response) => {
  return response.data;
}, (error: any) => {
  return Promise.resolve(new CodeObj(Code.Error, error));
});

export class FCoinDataApi {
  static async Ticker (params: {
    Symbol: string;
    TimeDiffAble: number;
  }) {
    return FCoinDataApiHandler.get<CodeObj<FCoinTickerData>>('/FCoin/Ticker', { params }).then(res => res.data);
  }
}
