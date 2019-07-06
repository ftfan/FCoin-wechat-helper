import path from 'path';

export const Config = {
  WebSiteInfo: {
    Name: 'FCoinWechatHelper',
    InstanceNumber: 1,
    maxMemoryRestart: '2048M',
    Port: 1026,
  },

  RootAuthPwd: '~FT100 FI100 FM100 FJ100 FF100~', // 超级管理员认证时需要的密码
  CacheDir: path.join(__dirname, '../'),

  FCoinDomain: 'fcoin.com',

  // 服务器日志路径 /logs/
  loggerDist: path.join(__dirname, '../logs/'),
  loggerPattern: `yyyy-MM-dd/hh.txt`,

  // log 前缀日期格式
  logDateFormat: 'YYYY-MM-dd HH:mm:ss.SSS',

  DefaultFOne: {
    category_code: 'hivecapital',
    category: 'fone::hivecapital',
    category_name_cn: '蜂巢资本',
    category_name_en: 'Hive Capital',
    category_type: 'sponsor_institution',
    logo_url: 'https://www.fcoin.com/logos/24a5d9c255ad76e8bb4ff1c863178192.jpg',
  },
};
