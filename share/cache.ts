import fs from 'fs';
import path from 'path';
import { Config } from '../config';

class DataCacheClass {
  File = path.join(Config.CacheDir, `${Config.WebSiteInfo.Name}.cache.json`);
  Data = {
    UpdateTime: 0,
    RootWechatId: '', // 超级管理员
    AdminList: [] as string[], // 管理员列表
    RoomUse: [] as string[], // 默认所有群都不使用机器人（使用时需要加"."），在这个列表内的群直接使用
  };
  constructor () {
    const has = fs.existsSync(this.File);
    if (!has) {
      this.Save();
      return;
    }
    this.Data = JSON.parse(fs.readFileSync(this.File, 'utf-8') || '{}');
  }

  Save () {
    fs.writeFileSync(this.File, JSON.stringify(this.Data), 'utf-8');
  }
}

export const DataCache = new DataCacheClass();
