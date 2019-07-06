import { CodeObj, Code } from '../../types/Code';

export const CheckParams = (arg: any, options: { [index: string]: 'string' | 'number' | 'array' | 'object' | 'boolean'; }) => {
  if (!arg) return new CodeObj(Code.ParamsError);
  if (typeof arg !== 'object') return new CodeObj(Code.ParamsError);
  for (const param in options) {
    const type = options[param];
    if (!(param in arg)) return new CodeObj(Code.ParamsError, null, param);
    const value = arg[param];
    // 数组单独处理
    if (type === 'array') {
      if (!(value instanceof Array)) return new CodeObj(Code.ParamsError, null, `${param} 应该是 array 类型`);
    } else {
      if (typeof value !== type) return new CodeObj(Code.ParamsError, null, `${param} 应该是 ${type} 类型`);
    }
  }
  return new CodeObj(Code.Success);
};
