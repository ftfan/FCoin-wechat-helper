import { Config } from './config/index';

/**
 * Application configuration section
 * http://pm2.keymetrics.io/docs/usage/application-declaration/
 */
module.exports = {
  apps: [{
    name: Config.WebSiteInfo.Name,
    cwd: __dirname,
    script: `bin/www.js`,
    max_restarts: 100, // 重启次数
    exec_mode: 'fork',
    instances: Config.WebSiteInfo.InstanceNumber,
    max_memory_restart: Config.WebSiteInfo.maxMemoryRestart,
    ignore_watch: ['node_modules', 'logs', '.git', '.svn', '.eslintrc'],
    watch: ['./bin/', './app.js', './config/', './types/', './router/'],
  }],
};
