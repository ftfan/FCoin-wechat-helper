import log4js from 'log4js';
import os from 'os';
import { Config } from '../config';
const osname = os.hostname();
const InstanceName = String(process.env.NODE_APP_INSTANCE || 0);

// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF
log4js.configure({
  // pm2: true,
  appenders: {
    // https://log4js-node.github.io/log4js-node/dateFile.html
    info: {
      type: 'dateFile',
      filename: Config.loggerDist,
      // pattern: `yyyy-MM-dd/hh-${InstanceName}.txt`,
      pattern: Config.loggerPattern,
      compress: false,
      keepFileExt: false,
      daysToKeep: 60,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: {
      appenders: ['info'],
      level: 'all',
    },
  },
});

export const logger = log4js.getLogger(`${osname}-${InstanceName}`);

process.on('exit', (num) => {
  logger.info('----Process exit width:', num);
  log4js.shutdown();
});

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
});

logger.trace('----Process begin');
