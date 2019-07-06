import express from 'express';
import { logger } from '../../share/logger';
export const WechatRouter = express();
import { Wechaty, Message } from 'wechaty';
import { Config } from '../../config';
import { MessageType } from 'wechaty-puppet';
import { GetMsgResTemplate } from './MsgAuto';
import { DataCache } from '../../share/cache';

const bot = new Wechaty({ name: Config.WebSiteInfo.Name });

// 扫码
bot.on('scan', (qrcode) => {
  require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('');
  logger.debug(qrcodeImageUrl);
});

bot.on('login' as any, function (user: string) {
  logger.debug(`${user}登录了`);
});
bot.on('logout' as any, (user: string) => {
  logger.debug(`${user}登出了`);
});

bot.on('message', async (msg: Message) => {
  const contact = msg.from(); // 发消息人
  const content = msg.text(); // 消息内容
  const room = msg.room(); // 是否是群消息
  const to = msg.to();
  let topic = '';

  if (!contact) {
    logger.error('contact is null, %o', msg);
    return;
  }

  if (room) {
    topic = await room.topic();
    console.log(`【${contact!.name()}】 ${topic}: ${content}`);
  } else {
    console.log(`【${contact!.name()}】: ${content}`);
  }

  // 这里暂时只处理文字消息
  if (msg.type() !== MessageType.Text) return;

  // 超管认证
  if (DataCache.Data.RootWechatId === '' && !room && content === Config.RootAuthPwd) {
    if (msg.self()) return;
    DataCache.Data.RootWechatId = contact.id;
    DataCache.Save();
    contact.say('超管认证成功，以后你就是这个机器人的最大管理者了！');
    return;
  }
  // 超管命令
  if (msg.self() || contact.id === DataCache.Data.RootWechatId) {
    const reg = new RegExp(/^命令-(.*)/);
    const res = content.match(reg);
    if (res) {
      const cmd = res[1] || '';
      if (cmd === '简约模式' && room) {
        if (DataCache.Data.RoomUse.indexOf(topic) > -1) return;
        DataCache.Data.RoomUse.push(topic);
        DataCache.Save();
        room.say('操作成功，查看功能输入：帮助');
        return;
      }
      if (cmd === '退出简约模式' && room) {
        const index = DataCache.Data.RoomUse.indexOf(topic);
        if (index === -1) return;
        DataCache.Data.RoomUse.splice(index, 1);
        DataCache.Save();
        room.say('操作成功，查看功能输入：.帮助');
        return;
      }
    }
  }

  const reg = new RegExp(/^\.(.*)/);
  const res = content.match(reg);
  let matchText = '';
  if (!res) {
    if (room && DataCache.Data.RoomUse.indexOf(topic) === -1) return;
    matchText = content || '';
  } else {
    matchText = res[1] || '';
  }
  const CoinName = matchText.trim().toLocaleLowerCase();
  const revert = await GetMsgResTemplate(CoinName, topic);
  if (revert.trim() === '') {
    return;
  }

  if (room) return room.say(revert);
  if (msg.self()) {
    if (!to) return;
    return to.say(revert);
  }
  contact.say(revert);
});

bot.start().then(() => logger.debug(`开始登录微信`)).catch((e: any) => logger.error(e));

// WechatRouter.get('/msg', (req, res) => {
//   res.send();
// });
