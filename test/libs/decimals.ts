contract('DecimalsTest', ([deployer]) => {
	const decimalsTestContract = artifacts.require('DecimalsTest')
	describe('Decimals; outOf', () => {
		it('outOf returns ratio of the first args out of second args', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer
			})
			const {0: resultBN, 1: basisBN} = await decimalsTest.outOf(28, 70)
			const result = Number(resultBN.toString())
			const basis = Number(basisBN.toString())
			const answer = 28 / 70
			expect(result / basis).to.be.equal(answer)
		})
	})
})
