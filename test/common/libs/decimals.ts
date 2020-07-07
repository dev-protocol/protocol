// Import BigNumber from 'bignumber.js'
// import {toBigNumber} from '../../test-lib/utils/common'
// import {validateErrorMessage} from '../../test-lib/utils/error'
// contract('DecimalsTest', ([deployer]) => {
// 	const decimalsTestContract = artifacts.require('DecimalsTest')
// 	describe('Decimals; outOf', () => {
// 		it('outOf returns ratio of the first args out of second args', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const resultBN = await decimalsTest.outOf(28, 70)
// 			const result = new BigNumber(resultBN.toString())
// 			const answer = 28 / 70
// 			expect(result.div(1000000000000000000).toNumber()).to.be.equal(answer)
// 		})
// 		it('outOf returns error if the denominator is 10^36 times greater than the numerator', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const result = await decimalsTest.outOf(
// 				28,
// 				'700000000000000000000000000000000000000'
// 			)
// 			expect(result.toNumber()).to.be.equal(0)
// 		})
// 	})
// 	describe('Decimals; mulBasis', () => {
// 		it('The value multiplied by basis is returned.', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const resultBN = await decimalsTest.mulBasis(28).then(toBigNumber)
// 			expect(resultBN.toString()).to.be.equal('28000000000000000000')
// 		})
// 		it('Whatever you multiply 0 by 0, you get 0.', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const resultBN = await decimalsTest.mulBasis(0).then(toBigNumber)
// 			expect(resultBN.toString()).to.be.equal('0')
// 		})
// 		it('Large numbers cause overflow.', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const res = await decimalsTest
// 				.mulBasis(toBigNumber(2 ** 255))
// 				.catch((err: Error) => err)
// 			validateErrorMessage(res, 'SafeMath: multiplication overflow', false)
// 		})
// 	})
// 	describe('Decimals; divBasis', () => {
// 		it('The value divided by basis comes back.', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const resultBN = await decimalsTest
// 				.divBasis(toBigNumber(28000000000000000000))
// 				.then(toBigNumber)
// 			expect(resultBN.toString()).to.be.equal('28')
// 		})
// 		it('Zero is zero divided by whatever.', async () => {
// 			const decimalsTest = await decimalsTestContract.new({
// 				from: deployer,
// 			})
// 			const resultBN = await decimalsTest.divBasis(0).then(toBigNumber)
// 			expect(resultBN.toString()).to.be.equal('0')
// 		})
// 	})
// })
