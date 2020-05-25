import BigNumber from 'bignumber.js'

contract('DecimalsTest', ([deployer]) => {
	const decimalsTestContract = artifacts.require('DecimalsTest')
	describe('Decimals; outOf', () => {
		it('outOf returns ratio of the first args out of second args', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer,
			})
			const resultBN = await decimalsTest.outOf(28, 70)
			const result = new BigNumber(resultBN.toString())
			const answer = 28 / 70
			expect(result.div(1000000000000000000).toNumber()).to.be.equal(answer)
		})
		it('outOf returns error if the denominator is 10^36 times greater than the numerator', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer,
			})
			const result = await decimalsTest.outOf(
				28,
				'700000000000000000000000000000000000000'
			)
			expect(result.toNumber()).to.be.equal(0)
		})
	})
})
