contract('WithdrawableTest', ([deployer]) => {
	const withdrawableTestContract = artifacts.require('WithdrawableTest')
	const dummyDEVContract = artifacts.require('DummyDEV')
	describe('Withdrawable; t_increment', () => {
		it('Incrementing normally', async () => {
			const withdrawableTest = await withdrawableTestContract.new({
				from: deployer
			})
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {
				from: deployer
			})
			await withdrawableTest.t_increment(dummyDEV.address, 5)
			const total = await withdrawableTest.t_total(dummyDEV.address)
			expect(total.toNumber()).to.be.equal(5)
			const price = await withdrawableTest.t_price(dummyDEV.address)
			expect(price.toNumber()).to.be.equal(0)
		})
	})
})
