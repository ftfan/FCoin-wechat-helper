import { FCoinApi, FcoinWebSocket } from 'fcoin-nodejs-api';
import { FCoinTickerData } from '../../types/FCoinWatch';
import { CodeObj, Code } from '../../types/Code';
import { logger } from '../../share/logger';
import { FCoinHttp, FCoinRequest } from './webapi';
import { TickerData, WsResponseCandle, WsResponseTicker } from 'fcoin-nodejs-api/src/types';
import { WsResponseAllTickersThis, SymbolInfo, SymbolMsg, FCoinSymbols } from '../../types/FCoin';
import { Config } from '../../config';

let IndexArg = 0;

const MainCoinPow: {[ index: string]: number; } = {
  usdt: 100,
  btc: 90,
  eth: 80,
  ft: 70,
  pax: 60,
  tusd: 50,
  usdc: 40,
};
const BaseCoinSymbol = ['btcusdt', 'ethusdt', 'paxusdt', 'tusdusdt', 'usdcusdt', 'gusdusdt'];

class FCoinData {
  RequestHandler: {
    [index: string]: Promise<any> | null;
  } = {};
  Usdt = 0;
  LastGetUsdtTime = 0;
  DiffUsdtTime = 5 * 60 * 1000;
  TickerData: { [index: string]: FCoinTickerData; } = {};
  TickerWatchSymbol: { [index: string]: Promise<CodeObj<FCoinTickerData>>; } = {};

  state = {
    WsInitTime: 0, // 记录初始化ws的时候时间。
    FCoinWs: {} as FcoinWebSocket,
    Candles: [] as WsResponseCandle[], // 蜡烛图

    AllAnsData: {
      // usdt: {
      //   symbol: 'usdt',
      //   coin: 'usdt',
      //   main: 'usdt',
      //   time: Date.now(),
      //   ticker: {
      //     LastPrice: 1, // 最新成交价
      //     LastVolume: 1, // 最近一笔成交量
      //     MaxBuyPrice: 1, // 最大买一价格
      //     MaxBuyVolume: 1, // 最大买一量
      //     MinSalePrice: 1, // 最小卖一价格
      //     MinSaleVolume: 1, // 最小卖一量
      //     BeforeH24Price: 1, // 24小时前成交价
      //     HighestH24Price: 1, // 24小时内最高价
      //     LowestH24Price: 1, // 24小时内最低价
      //     OneDayVolume1: 1, // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
      //     OneDayVolume2: 1, // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
      //   },
      // },
    } as {
      [index: string]: WsResponseAllTickersThis;
    },

    SymbolLastInfo: {
      usdt: {
        // usdt: {
        //   symbol: 'usdt',
        //   ticker: {
        //     LastPrice: 1, // 最新成交价
        //     LastVolume: 1, // 最近一笔成交量
        //     MaxBuyPrice: 1, // 最大买一价格
        //     MaxBuyVolume: 1, // 最大买一量
        //     MinSalePrice: 1, // 最小卖一价格
        //     MinSaleVolume: 1, // 最小卖一量
        //     BeforeH24Price: 1, // 24小时前成交价
        //     HighestH24Price: 1, // 24小时内最高价
        //     LowestH24Price: 1, // 24小时内最低价
        //     OneDayVolume1: 1, // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
        //     OneDayVolume2: 1, // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
        //   },
        // },
      },
    } as {
      [index: string]: { [index: string]: WsResponseAllTickersThis };
    },
    Proxy: {
      Http: { host: '', port: '', secureProxy: true },
    },

    Usdt: 0,

    Symbols: {} as { [index: string]: SymbolInfo; },
    AllRefs: {} as {
      [index: string]: { [index: string]: string[]; };
    },
    Ref: {} as { [index: string]: string[]; },
    SymbolMsg: {} as { [index: string]: SymbolMsg; },
  };

  io = new FCoinApi('', '', undefined, Config.FCoinDomain);

  constructor () {
    //
    this.Reload();
  }

  async Reload () {
    await this.FeatchSymbols();
    if (this.state.FCoinWs.Close) this.state.FCoinWs.Close();
    this.state.FCoinWs = new FcoinWebSocket(undefined, Config.FCoinDomain);
    this.state.FCoinWs.HeartbeatInit(5000); // 5秒呼吸
    this.state.WsInitTime = this.state.FCoinWs.LastHeartbeat.ts;
    this.state.Candles = [];
    this.state.FCoinWs.Heartbeat();
    const All = this.state.Symbols;

    const Hnadler = (symbol: string, item: WsResponseTicker) => {
      if (!item) return console.info('空');
      const info = All[symbol];
      if (!info) return console.info('未找到', item);
      if (!info.tradeable) return;
      if (!(this.state.SymbolLastInfo as any)[info.quote_currency]) this.state.SymbolLastInfo[info.quote_currency] = {};
      this.state.SymbolLastInfo[info.quote_currency][info.base_currency] = Object.assign(item, {
        coin: info.base_currency,
        main: info.quote_currency,
        time: Date.now(),
      }) as any;
      try {
        const has = this.state.AllAnsData[info.base_currency];
        if (has && has.main === 'usdt') return;
        const pow = MainCoinPow[info.quote_currency as any];
        const haspow = has ? MainCoinPow[has.main] : 0;
        if (haspow > pow) return;
        this.state.AllAnsData[info.base_currency] = this.state.SymbolLastInfo[info.quote_currency][info.base_currency];
      } catch (e) {
        logger.error(e);
      }
    };
    BaseCoinSymbol.forEach(symbol => {
      this.state.FCoinWs.OnTicker(symbol, (data) => {
        Hnadler(symbol, data);
      });
    });
    this.state.FCoinWs.OnAllTickers(data => {
      data.forEach(item => Hnadler(item.symbol, { ticker: item.ticker } as WsResponseTicker));
    });
  }

  async FeatchSymbols () {
    const [res, cate] = await Promise.all([
      FCoinHttp.get('/openapi/v2/symbols').then(FCoinRequest),
      FCoinHttp.get('/openapi/v1/categories').then(FCoinRequest),
    ]);
    if (res.Error()) {
      logger.error('/openapi/v2/symbols', res);
      return res;
    }
    if (cate.Error()) {
      logger.error('/openapi/v1/categories', cate);
      return cate;
    }
    this.UsdtGet();
    const resData = res.Data as FCoinSymbols;
    this.state.Symbols = resData.symbols;
    return new CodeObj(Code.Success);
  }

  async FeatchSymbolDes () {
    const res = await FCoinHttp.get('/openapi/v1/currency_properties').then(FCoinRequest);
    if (res.Error()) return res;
    const data = res.Data as SymbolMsg[];
    data.forEach(sym => {
      this.state.SymbolMsg[sym.name] = sym;
    });
    return new CodeObj(Code.Success);
  }

  async FetchSymbolLastInfo (symbol: string): Promise<CodeObj<TickerData>> {
    const id = IndexArg++;
    console.log(id, '---------', symbol);
    if (this.RequestHandler[`FetchSymbolLastInfo--${symbol}`]) return Promise.resolve(this.RequestHandler[`FetchSymbolLastInfo--${symbol}`]);
    console.log(id, '重新获取数据', symbol);
    let timer: any;

    this.RequestHandler[`FetchSymbolLastInfo--${symbol}`] = this.io.Ticker(symbol).then(res => {
      console.log(id, '接口返回', symbol);
      if (timer) clearTimeout(timer);
      this.RequestHandler[`FetchSymbolLastInfo--${symbol}`] = null;
      if (res.status) return new CodeObj(Code.Error, null, res.msg);
      return new CodeObj(Code.Success, res.data);
    });
    const handler = this.RequestHandler[`FetchSymbolLastInfo--${symbol}`];
    timer = setTimeout(() => {
      console.log(id, '倒计时结束', symbol);
      if (this.RequestHandler[`FetchSymbolLastInfo--${symbol}`] === handler) this.RequestHandler[`FetchSymbolLastInfo--${symbol}`] = null;
    }, 10000);
    return this.RequestHandler[`FetchSymbolLastInfo--${symbol}`];
  }

  async UsdtGet (JustUpdate = false) {
    const diff = Date.now() - this.LastGetUsdtTime;
    if (JustUpdate === false && diff < this.DiffUsdtTime) {
      // 过了一半时间了
      if (diff > this.DiffUsdtTime / 2 && !this.RequestHandler.UsdtGet) this.UsdtGet(true);
      return Promise.resolve(this.Usdt);
    }
    const handler = FCoinHttp.get('/openapi/v1/otc/delegation_orders?currency=usdt&legal_currency=cny&page=1&page_size=10&direction=buy').then(FCoinRequest);
    if (JustUpdate) {
      this.RequestHandler.UsdtGet = handler;
      handler.then(res => {
        this.RequestHandler.UsdtGet = null;
        return res;
      });
    }
    const res = await handler;
    const data = res.Data as any;
    if (res.Error() || !data.content || !data.content[0]) return this.Usdt;
    this.LastGetUsdtTime = Date.now();
    this.Usdt = parseFloat(data.content[0].price);
    return this.Usdt;
  }

  async FTokenFetch () {
    if (this.RequestHandler.FTokenFetch) return Promise.resolve(this.RequestHandler.FTokenFetch);
    let timer: any;
    this.RequestHandler.FTokenFetch = FCoinHttp.get('/openapi/v1/exchange/trading_fees_group').then(FCoinRequest).then(res => {
      if (timer) clearTimeout(timer);
      this.RequestHandler.FTokenFetch = null;
      if (res.Error()) return res;
      return new CodeObj(Code.Success, res.Data);
    });
    const handler = this.RequestHandler.FTokenFetch;
    timer = setTimeout(() => {
      if (this.RequestHandler.FTokenFetch === handler) this.RequestHandler.FTokenFetch = null;
    }, 10000);
    return this.RequestHandler.FTokenFetch;
  }

  async FinancialDividends () {
    if (this.RequestHandler.FinancialDividends) return Promise.resolve(this.RequestHandler.FinancialDividends);
    let timer: any;
    this.RequestHandler.FinancialDividends = FCoinHttp.get('/openapi/v1/financial_dividends').then(FCoinRequest).then(res => {
      if (timer) clearTimeout(timer);
      this.RequestHandler.FinancialDividends = null;
      if (res.Error()) return res;
      return new CodeObj(Code.Success, res.Data);
    });
    const handler = this.RequestHandler.FinancialDividends;
    timer = setTimeout(() => {
      if (this.RequestHandler.FinancialDividends === handler) this.RequestHandler.FinancialDividends = null;
    }, 10000);
    return this.RequestHandler.FinancialDividends;
  }

  // private TickerFetch (symbol: string) {
  //   const Ts = Date.now();
  //   // 2、获取最新的数据
  //   this.TickerWatchSymbol[symbol] = this.io.Ticker(symbol).then(res => {
  //     delete this.TickerWatchSymbol[symbol];
  //     if (res.status) return new CodeObj(Code.FCoinError, res.full, res.msg);
  //     const resData = res.data as FCoinTickerData;
  //     resData.Ts = Ts;
  //     this.TickerData[symbol] = resData;
  //     return new CodeObj(Code.Success, resData);
  //   }).catch(e => {
  //     delete this.TickerWatchSymbol[symbol];
  //     logger.error(e);
  //     return new CodeObj(Code.UndefinedDbError);
  //   });
  //   return this.TickerWatchSymbol[symbol];
  // }
}

export const FCoin = new FCoinData();
