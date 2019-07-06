import { TickerData } from 'fcoin-nodejs-api/src/types';

export interface FCoinTickerData extends TickerData {
  Ts: number;
}
