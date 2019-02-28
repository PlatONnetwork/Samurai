/**
 * Created by zjw on 2018/5/4.
 */
import { Decimal } from 'decimal.js';

Decimal.set({ toExpNeg: -99 })
Decimal.set({ toExpPos: 99 })

export default {
	/**
	 *
	 * @description 加
	 * @param {number} arg1
	 * @param {number} arg2
	 * @returns
	 */
	add(arg1, arg2) {
		return new Decimal(arg1).add(new Decimal(arg2)).toString()
	},
	/**
	 *
	 * @description 减
	 * @param {number} arg1
	 * @param {number} arg2
	 * @returns
	 */
	sub(arg1, arg2) {
		return new Decimal(arg1).sub(new Decimal(arg2)).toString()
	},
	/**
	 *
	 * @description 乘
	 * @param {number} arg1
	 * @param {number} arg2
	 * @returns
	 */
	mul(arg1, arg2) {
		return new Decimal(arg1).mul(new Decimal(arg2)).toString()
	},
	/**
	 *
	 * @description 除
	 * @param {number} arg1
	 * @param {number} arg2
	 * @returns
	 */
	div(arg1, arg2) {
		return new Decimal(arg1).div(new Decimal(arg2)).toString()
	},
    toNonExponential(num) {
        var m = Number(num).toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        return Number(num).toFixed(Math.max(0, (m[1] || '').length - m[2]));
    },
    accAdd(arg1, arg2) {
		var r1, r2, m;
		try {
			r1 = arg1.toString().split(".")[1].length
		} catch(e) {
			r1 = 0
		}
		try {
			r2 = arg2.toString().split(".")[1].length
		} catch(e) {
			r2 = 0
		}
		m = Math.pow(10, Math.max(r1, r2));
		return (arg1 * m + arg2 * m) / m;
	}
}
