import express from 'express';
import { AuthRouter } from './Auth';
import { WechatRouter } from './Wechat';
import { FCoinRouter } from './FCoin';
export const AppRouter = express();

AppRouter.use(AuthRouter);
AppRouter.use('/wechat', WechatRouter);
AppRouter.use('/fcoin', FCoinRouter);
