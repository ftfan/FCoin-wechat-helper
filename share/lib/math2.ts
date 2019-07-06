import { Decimal } from 'decimal.js/decimal';
export default class Math2 {
  // 精确位数
  static decimal (num: number, num1: number) {
    const pp = Math.pow(10, num1);
    return Math.floor(Math2.mul(num, pp)) / pp;
  }
  // 精确位数
  static decimal2 (num: number, num1: number) {
    const pp = Math.pow(10, num1);
    return Math.ceil(Math2.mul(num, pp)) / pp;
  }
  // 标准乘法
  static mul (...numbers: number[]): number {
    if (numbers.length === 0) return 0;
    let a = new Decimal(1);
    numbers.forEach(num => {
      a = a.mul(num);
    });
    return a.toNumber();
  }

  // 标准加法
  static add (...numbers: number[]): number {
    if (numbers.length === 0) return 0;
    let a = new Decimal(0);
    numbers.forEach(num => {
      a = a.add(num);
    });
    return a.toNumber();
  }

  // 标准除法
  static div (...numbers: number[]): number {
    if (numbers.length === 0) return 0;
    let a = new Decimal(numbers[0]);
    numbers.forEach((num, index) => {
      if (index === 0) return;
      a = a.div(num);
    });
    return a.toNumber();
  }

  // 四舍五入。不会留下末尾的 0
  static toFixed (num: number, bit = 2): number {
    const len = Math.pow(10, bit);
    return Math.round(num * len) / len;
  }
}
