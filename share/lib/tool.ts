import { Request } from 'express';
import { exec } from 'child_process';
import { logger } from '../logger';

/**
 * 可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg: ("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * ("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * ("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * ("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * ("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
export function dateFormat (time: Date, fmt: string) {
  const o: any = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    'h+': time.getHours(), // 小时
    'H+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
  };
  fmt = fmt.replace(/Y/g, 'y');
  const week = ['/u65e5', '/u4e00', '/u4e8c', '/u4e09', '/u56db', '/u4e94', '/u516d'];
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    const repl = RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '';
    const replace = repl + week[parseInt(time.getDay() + '', 10)];
    fmt = fmt.replace(RegExp.$1, replace);
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const kk = o[k];
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? kk : ('00' + kk).substr(('' + kk).length));
    }
  }
  if (/(S+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ('000' + time.getMilliseconds()).substr(-3, RegExp.$1.length));
  }
  return fmt;
}

/**
 * 获取请求的IP
 * @param {req} request
 */
export function getCallerIP (request: Request) {
  let ip = request.headers['x-forwarded-for'] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress;
    // request.connection.socket.remoteAddress;
  if (!ip) {
    return '';
  }
  if (ip instanceof Array) {
    ip = ip[0];
  }
  ip = ip.split(',')[0];
  ip = ip.split(':').slice(-1); // in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
  return ip;
}

/**
 * 获取当前主机的IP
 */
export function getIPAdress () {
  const interfaces = require('os').networkInterfaces();
  const revert: string[] = [];
  for (const devName of Object.keys(interfaces)) {
    const iface = interfaces[devName];
    iface.forEach((alias: any) => {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        revert.push(alias.address);
      }
    });
  }
  return revert;
}
// 强制占用端口
export async function killPort (port: number) {
  return new Promise(resolve => {
    const cmd = process.platform === 'win32' ? 'netstat -ano' : 'ps aux';
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        return logger.error(err);
      }
      let p: string[] = [];
      stdout.split('\n').forEach(function (line) {
        const tempP = line.trim().split(/\s+/);
        const address = tempP[1];
        if (!address) return;
        const tempPort = parseInt(address.split(':')[1], 10);
        if (tempPort === port) {
          p = tempP;
        }
      });
      return resolve(async function kill (port: number) {
        return new Promise(resolve => {
          const data: string[] = p;
          if (data.length === 0) return resolve(true);
          exec('taskkill /F /pid ' + data[4], function (err, stdout, stderr) {
            if (err) {
              logger.trace(`释放${port}端口失败！！`);
              return resolve(false);
            }
            logger.trace(`占用${port}端口的程序被成功杀掉！`);
            resolve(true);
          });
        });
      });
    });
  }).catch(e => logger.error(e));
}
