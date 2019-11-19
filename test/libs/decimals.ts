contract('Decimals', ([deployer]) => {
	const decimalsTestContract = artifacts.require('DecimalsTest')
	describe('ratioInto', () => {
		it('ratioInto returns ratio into between two numbers', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer
			})
			const {0: resultBN, 1: basisBN} = await decimalsTest.ratioInto(28, 70)
			const result = Number(resultBN.toString())
			const basis = Number(basisBN.toString())
			const answer = 28 / 70
			expect(result / basis).to.be.equal(answer)
		})
	})

	describe('percentOf', () => {
		it('percentOf returns first agrs percent of second args', async () => {
			const decimalsTest = await decimalsTestContract.new({
				from: deployer
			})
			const {0: resultBN, 1: basisBN} = await decimalsTest.percentOf(70, 40)
			const result = Number(resultBN.toString())
			const basis = Number(basisBN.toString())
			const answer = 70 * 0.4
			expect(result / basis).to.be.equal(answer)
		})
	})
})
