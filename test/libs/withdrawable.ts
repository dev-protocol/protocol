contract('WithdrawableTest', ([deployer]) => {
	const withdrawableTestContract = artifacts.require('libs/WithdrawableTest')
	const testErc20TokenContract = artifacts.require('TestErc20Token')
	describe('WithdrawableTest; t_increment', () => {
		it('t_increment', async () => {
			const withdrawableTest = await withdrawableTestContract.new({
				from: deployer
			})
			const erc20 = await testErc20TokenContract.new()
			await withdrawableTest.t_increment(erc20.address, 5)
			const total = await withdrawableTest.t_total(erc20.address)
			expect(total.toNumber()).to.be.equal(5)
			const price = await withdrawableTest.t_price(erc20.address)
			expect(price.toNumber()).to.be.equal(0)
		})
	})
})
