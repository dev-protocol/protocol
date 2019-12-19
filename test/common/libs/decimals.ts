import BigNumber from 'bignumber.js'

contract('DecimalsTest', ([deployer]) => {
	const decimalsTestContract = artifacts.require('DecimalsTest')
	describe('Decimals; outOf', () => {
		it('outOf returns ratio of the first args out of second args', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer
			})
			const resultBN = await decimalsTest.outOf(28, 70)
			const result = new BigNumber(resultBN.toString())
			const answer = 28 / 70
			expect(
				result.div(1000000000000000000000000000000000000).toNumber()
			).to.be.equal(answer)
		})
		it('outOf returns error if the denominator is 10^36 times greater than the numerator', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer
			})
			const err = await decimalsTest
				.outOf(28, '700000000000000000000000000000000000000')
				.catch((err: Error) => err)
			expect(err).to.be.an.instanceof(Error)
			expect((err as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert the denominator is too big'
			)
		})
	})
})
