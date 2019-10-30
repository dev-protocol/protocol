contract('WithdrawableTest', ([deployer, u1, u2]) => {
	const withdrawableTestContract = artifacts.require('libs/WithdrawableTest')
	const testErc20TokenContract = artifacts.require('TestErc20Token')
	describe('WithdrawableTest; t_increment', () => {
		it('t_increment', async () => {
			const withdrawableTest = await withdrawableTestContract.new({
				from: deployer
			})
			const erc20 = await testErc20TokenContract.new()
			withdrawableTest.t_increment(erc20.address, 5)
			// WithdrawableTest.t_increment()
			// Await state.setToken(u1, {from: deployer})
			// const useState = await useStateContract.new({from: deployer})
			// const token = await useState.t_getToken().catch((err: Error) => err)
			// expect(token).to.instanceOf(Error)

			// await useState.changeStateAddress(state.address, {
			// 	from: deployer
			// })
			// const results = await useState.t_getToken()
			// expect(results.toString()).to.be.equal(u1)
		})

		// It('Should fail to change state address when sent from the non-owner account', async () => {
		// 	const state = await stateContract.new({from: deployer})
		// 	await state.setToken(u1, {from: deployer})
		// 	const useState = await useStateContract.new({from: deployer})
		// 	const results = await useState
		// 		.changeStateAddress(state.address, {
		// 			from: u2
		// 		})
		// 		.catch((err: Error) => err)
		// 	expect(results).to.instanceOf(Error)
		// })
	})
})
