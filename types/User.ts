
// 用户注册
export interface UserRegisterParams {
  Key: string;
  Secret: string;
}

// 销毁用户数据
export interface UserDestroyParams {
  Id: string;
  Key: string;
  Secret: string;
}
