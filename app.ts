
// 日志模块最先引入
import { logger } from './share/logger';
import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { killPort } from './share/lib/tool';
import { Config } from './config';
import { AppRouter } from './router';
import { DataCache } from './share/cache';

const app = express();

// 设置信任代理
app.set('trust proxy', true);
app.set('port', Config.WebSiteInfo.Port);
app.disable('x-powered-by');
app.use(AppRouter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));

const server = http.createServer(app);

// 强制监听
(async function () {
  const port = parseInt(app.get('port'), 10);
  await killPort(port);
  server.listen(app.get('port'));
  logger.trace('站点开启');
  DataCache.Data.UpdateTime = Date.now();
  DataCache.Save();
})();

export default server;
