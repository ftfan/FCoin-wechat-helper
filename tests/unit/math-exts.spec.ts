/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import Math2 from '../../share/lib/math2';

describe('math2.ts', () => {
  describe('Math2.mul', () => {
    it('1.1 * 2.2 === 2.42', () => {
      expect(1.1 * 2.2).equal(2.4200000000000004);
      expect(Math2.mul(1.1, 2.2)).equal(2.42);
      expect(Math2.mul(2.2, 1.1)).equal(2.42);
    });

    it('-1.1 * 2.2 === -2.42', () => {
      expect(-1.1 * 2.2).equal(-2.4200000000000004);
      expect(Math2.mul(-1.1, 2.2)).equal(-2.42);
      expect(Math2.mul(-2.2, 1.1)).equal(-2.42);
    });

    it('0 * 2.2 === 0', () => {
      expect(Math2.mul(0, 2.2)).equal(0);
      expect(Math2.mul(2.2, 0)).equal(0);
    });

    it('NaN * 2.2 === NaN', () => {
      expect(Math2.mul(NaN, 2.2)).to.be.NaN;
      expect(Math2.mul(2.2, NaN)).to.be.NaN;
    });
  });

  describe('Math2.add', () => {
    it('1.1 + 2.2 === 3.3', () => {
      expect(Math2.add(1.1, 2.2)).equal(3.3);
      expect(Math2.add(2.2, 1.1)).equal(3.3);
    });

    it('Infinity + 2.2 === Infinity', () => {
      expect(Math2.add(Infinity, 2.2)).equal(Infinity);
      expect(Math2.add(2.2, Infinity)).equal(Infinity);
    });

    it('-1.1 + 2.2 === 1.1', () => {
      expect(Math2.add(-1.1, 2.2)).equal(1.1);
      expect(Math2.add(2.2, -1.1)).equal(1.1);
    });

    it('-1.1 + NaN === NaN', () => {
      expect(Math2.add(-1.1, NaN)).to.be.NaN;
      expect(Math2.add(NaN, -1.1)).to.be.NaN;
    });
  });
});
