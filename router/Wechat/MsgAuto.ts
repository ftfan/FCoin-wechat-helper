import { FCoin } from '../../share/FCoin';
import Math2 from '../../share/lib/math2';
import { WsResponseAllTickersThis, SymbolInfo } from '../../types/FCoin';
import { DataCache } from '../../share/cache';
import { FCoinHttp, FCoinRequest } from '../../share/FCoin/webapi';
const dateformat = require('dateformat-util');

export async function GetMsgResTemplate (CoinName: string, topic: string) {
  const revert: string[] = [];
  if (CoinName === '帮助') {
    revert.push('.帮助 => 显示通用功能');
    revert.push('.FT => 币价');
    revert.push('.FT 150 => 150档位网址');
    revert.push('.FT是什么 => BTC信息');
    revert.push('.网址 => FCoin网址');
    revert.push('.杠杠 => 理财和杠杠数据');
    revert.push('.理财 => 理财和杠杠数据');
    revert.push('.FToken => ft分布数据');
    if (topic && DataCache.Data.RoomUse.indexOf(topic) > -1) {
      return revert.join('\r\n').replace(/\./ig, '');
    }
    return revert.join('\r\n');
  }

  if (CoinName === 'ftoken') {
    const res = await FCoin.FTokenFetch();
    if (res.Error()) return '接口请求报：' + res.Msg;
    revert.push(`【FToken】`);
    revert.push(`总量`);
    revert.push(`${Math2.decimal(res.Data.circulation, 0)} FT`);

    revert.push(`二级市场流通量`);
    revert.push(`${Math2.decimal(res.Data.secondary_circulation, 0)} FT`);

    revert.push(`锁仓数量`);
    revert.push(`${Math2.decimal(res.Data.locking_amount, 0)} FT`);

    revert.push(`24小时待解锁FT数量`);
    revert.push(`${Math2.decimal(res.Data.will_unlock_amount, 0)} FT`);

    revert.push(`年度(累计待分配)`);
    revert.push(`${Math2.decimal(res.Data.accumulated_amount, 2)} BTC`);

    revert.push(`昨日`);
    revert.push(`${res.Data.current_dividend_amount} BTC`);

    revert.push(`昨日全站交易量折合`);
    revert.push(`${Math2.decimal(res.Data.platform_total_volume, 0)} USDT`);

    revert.push(`【${dateformat.format(new Date(parseInt(res.Data.dividend_updated_at, 10)), 'yyyy-MM-dd hh:mm:ss')}】`);
    // data_state: "normal"
    // destroy_amount: "5095834557.54834028"
    // dividend_summary: "-"
    // income: "-"
    // platform_total_volume: "2254116620.96124824"
    // prev_day_amount: "11036290.16082879"
    // prev_day_circulation: "14099826.96401089"
    // prev_day_dividend_detail: {summary: "3.96069454", dividend_summary: "0.63371113", income: "0.00012922", dynamic_income: null,…}
    // total_dividend_amount: "1.80226602"
    // trading_fees: [{currency: "btc", fees: "0.32147409", dividend_fees: "0.25717927", ft_income: "-", income: "-"},…]
    // will_unlock_amount: "9776372.87938144"
    return revert.join('\r\n');
  }
  if (CoinName === '杠杠' || CoinName === '理财') {
    const res = await FCoin.FinancialDividends();
    if (res.Error()) return '接口请求报：' + res.Msg;
    revert.push('理财账户余额折合:');
    revert.push(res.Data.financial_balance_summary + ' BTC');
    revert.push('杠杆借贷总额折合:');
    revert.push(res.Data.leveraged_loan_summary + ' BTC');
    revert.push('本月累计待分配:');
    revert.push(res.Data.leverage_income_summary + ' BTC');
    return revert.join('\r\n');
  }
  if (CoinName === '网址') {
    revert.push('FCoin官网：');
    revert.push('  www.fcoin.com (需翻墙)');

    revert.push('FCoin备用网址一：');
    revert.push('  www.fcoin.pro (免翻墙)');

    revert.push('FCoin备用网址二：');
    revert.push('  www.ifukang.com (免翻墙)');

    revert.push('手机APP下载地址一');
    revert.push('  www.fcoin.pro/app');

    revert.push('手机APP下载地址二');
    revert.push('  www.ifukang.com/app');
    return revert.join('\r\n');
  }

  const coinInfo = CoinName.match(/(.*?)[\-\ \_\#\~\&\>\.\^\%\@]?是什么$/) || CoinName.match(/^什么是(.*)/);
  const coinInfo2 = CoinName.match(/(.*)的备案$/);
  if (coinInfo || coinInfo2) {
    const lastInfo = (coinInfo || coinInfo2)!;
    const name = (lastInfo[1] || '').trim().toLocaleLowerCase();
    if (!name || !name.match(/^[a-zA-Z0-9_]+/)) return '';
    const info = await FCoinHttp.get(`/openapi/v3/currency_manage/currency/${name}`, {
      timeout: 5000,
      headers: {
        'accept-language': 'zh',
      },
    }).then(FCoinRequest);
    if (info.Error()) return '';
    if (!info.Data) return '';
    const data = info.Data as any;
    if (!data.properties) return '';
    if (data.full_name === data.properties.name_cn) {
      revert.push(`${data.name.toLocaleUpperCase()}/${data.properties.name_cn}`);
    } else {
      revert.push(`${data.name.toLocaleUpperCase()}/${data.full_name}/${data.properties.name_cn}`);
    }
    if (coinInfo2) {
      for (const i in data.properties) revert.push(`${i}：${data.properties[i]}`);
    } else {
      revert.push(`发行时间：${dateformat.format(new Date(data.release_at), 'yyyy-MM-dd')}`);
      revert.push(`发行总量：${data.properties.amount}`);
      if (data.properties.circulation) revert.push(`流通总量：${data.properties.circulation}`);
      if (data.properties.open_guidance_price) revert.push(`私募价格：${data.properties.open_guidance_price}`);
      if (data.properties.white_paper_url) revert.push(`白皮书：${data.properties.white_paper_url}`);
      if (data.properties.website_url) revert.push(`官网：${data.properties.website_url}`);
      if (data.properties.block_query_url) revert.push(`合约地址：${data.properties.block_query_url}`);
      if (data.properties.currency_desc) revert.push(`Token介绍：${data.properties.currency_desc}`);
    }

    return revert.join('\r\n');
  }

  const music = CoinName.match(/放歌[\-\ \_\#\~\&\>\.\^\%\@]?(.*)/);
  if (music) {
    const name = (music[1] || 'FT100').trim();
    revert.push(`正在播放  《${name}》`);
    revert.push('━━━●━━━───────');
    revert.push(`5:24`);
    revert.push('⇆          ◁      ❚❚      ▷          ↻ ');
    return revert.join('\r\n');
  }

  const usdt = await FCoin.UsdtGet();
  if (CoinName === 'usdt') {
    if (usdt === 0) {
      return '稍等一下，数据还没取到。';
    }
    revert.push(`FCoin-OTC: USDT ${usdt}`);
    return revert.join('\r\n');
  }

  const reg = new RegExp(/(.*?)[\-\ \_\#\~\&\>\.\^\%\@]?150$/);
  const match = CoinName.match(reg);
  let CoinNameArgs = '';
  if (match) {
    CoinName = match[1].trim();
    CoinNameArgs = '150';
    // https://biluochun.github.io/ft/depth.html?symbol=btcusdt
  }
  const info = FCoin.state.AllAnsData[CoinName];
  if (!info) return '';
  const symbol = info.coin + info.main;
  const baseInfo = FCoin.state.Symbols[symbol];
  // 5秒内数据不再取
  if (Date.now() - info.time <= 5000) {
    GetCoinSowTemplate(revert, info, baseInfo, info.ticker);
  } else {
    const res = await FCoin.FetchSymbolLastInfo(symbol);
    if (res.Error()) return '接口请求报：' + res.Msg;
    GetCoinSowTemplate(revert, info, baseInfo, res.Data);
  }

  if (CoinNameArgs === '150') {
    revert.push(`150档位数据查看：https://biluochun.github.io/ft/depth.html?symbol=${info.coin}${info.main}`);
  }

  return revert.join('\r\n');
}

function GetCoinSowTemplate (revert: string[], info: WsResponseAllTickersThis, baseInfo: SymbolInfo, data: {
  LastPrice: number; // 最新成交价
  LastVolume: number; // 最近一笔成交量
  MaxBuyPrice: number; // 最大买一价格
  MaxBuyVolume: number; // 最大买一量
  MinSalePrice: number; // 最小卖一价格
  MinSaleVolume: number; // 最小卖一量
  BeforeH24Price: number; // 24小时前成交价
  HighestH24Price: number; // 24小时内最高价
  LowestH24Price: number; // 24小时内最低价
  OneDayVolume1: number; // 24小时内基准货币成交量, 如 btcusdt 中 btc 的量
  OneDayVolume2: number; // 24小时内基准货币成交量, 如 btcusdt 中 usdt 的量
}) {
  const Main = info.main.toLocaleUpperCase();
  revert.push(`FCoin: ${info.coin.toLocaleUpperCase()}${CountRmbString(info.main, data.LastPrice)}`);
  revert.push(`最新成交价：${data.LastPrice.toFixed(baseInfo.price_decimal)} ${Main}`);
  if (data.OneDayVolume1 === 0) {
    revert.push(`24小时内无成交量`);
  } else {
    revert.push(`24小时均价：${Math2.decimal(Math2.div(data.OneDayVolume2, data.OneDayVolume1), baseInfo.price_decimal).toFixed(baseInfo.price_decimal)} ${Main}`);
  }
  revert.push(`24小时最高：${data.HighestH24Price.toFixed(baseInfo.price_decimal)} ${Main}`);
  revert.push(`24小时最低：${data.LowestH24Price.toFixed(baseInfo.price_decimal)} ${Main}`);
  revert.push(`24小时涨幅：${Math2.mul(Math2.decimal(Math2.div(Math2.add(-data.BeforeH24Price, data.LastPrice), data.BeforeH24Price), 4), 100)}%`);

  revert.push(`【${dateformat.format(new Date(), 'yyyy-MM-dd hh:mm:ss')}】`);
}

function CountRmbString (main: string, price: number): string {
  const res = CountRmb(main, price);
  if (res) return ` ￥${Math2.decimal(res, 3)}`;
  return '';
}
function CountRmb (main: string, price: number): number {
  if (!FCoin.Usdt) return 0;
  if (main === 'usdt') return Math2.mul(price, FCoin.Usdt);
  const usdtSymbol = FCoin.state.AllAnsData[`${main}usdt`];
  if (!usdtSymbol) return 0;
  return Math2.mul(price, CountRmb(usdtSymbol.main, usdtSymbol.ticker.LastPrice));
}
