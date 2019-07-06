import express from 'express';
import { FCoin } from '../../share/FCoin';
export const HuobiRouter = express();

HuobiRouter.get('/data/:symbol', async (req, res) => {
  const data = await FCoin.Ticker(req.params.symbol, 5000);
  res.send(data);
});
