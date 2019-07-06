
import Axios from 'axios';

class HuobiData {
  Usdt = 0;
  LastGetUsdtTime = 0;
  DiffUsdtTime = 5 * 60 * 1000;

  constructor () {
    //
  }

  async UsdtGet () {
    if (Date.now() - this.LastGetUsdtTime < this.DiffUsdtTime) return this.Usdt;
    const res = await Axios.get('https://otc-api.eiijo.cn/v1/data/trade-market?coinId=2&currency=1&tradeType=buy&currPage=1&payMethod=0&country=37&blockType=general&online=1&range=0&amount=');
    if (res.status !== 200) return this.Usdt;
    const data = res.data;
    if (data.status !== 200) return this.Usdt;
    if (!data.data || !data.data[0]) return this.Usdt;
    this.Usdt = data.data[0].price;
    return this.Usdt;
  }
}

export const Huobi = new HuobiData();
