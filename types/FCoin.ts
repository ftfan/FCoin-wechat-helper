import { WsResponseAllTickers } from 'fcoin-nodejs-api/src/types';

/**
 * 交易类型
 */
export enum AccountType {
  Balance = '',
  Margin = 'margin',
}

export enum FCoinMiningType {
  Order = 'Order',
  Sorting = 'Sorting',
  Trading = 'Trading',
}

export interface WsResponseAllTickersThis extends WsResponseAllTickers {
  coin: string;
  main: string;
  time: number;
}

export interface SymbolInfo {
  amount_decimal: number; // 深度精度
  base_currency: string; // Coin
  category: string; // FOne
  leveraged_multiple: null | string; // null | '5'
  limit_amount_max: string;
  limit_amount_min: string;
  main_tag: string;
  market_order_enabled: boolean;
  price_decimal: number; // 价格精度
  quote_currency: number; // 基准币
  symbol: string;
  tradeable: boolean; // 是否可交易
}

export interface SymbolMsg {
  exists_currency_property_config: boolean;
  full_name: string;
  logo_url: string;
  name: string;
  properties: {
    anticipation: string;
    circulation: string;
    circulation_market_value: string;
    circulation_rate: string;
    ecology_score: string;
    level: string;
    level_description: string;
    level_mobile_pdf_url: string;
    project_score: string;
    team_score: string;
    warning: string;
  };
}

export interface FCoinSymbols {
  categories: string[];
  category_ref: {
    [index: string]: string[];
  };
  symbols: {
    [index: string]: SymbolInfo;
  };
}
