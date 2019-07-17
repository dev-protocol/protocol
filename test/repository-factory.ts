contract('ReposioryFactory', ([deployer]) => {
	const reposioryFactoryContract = artifacts.require('ReposioryFactory')
	const stateContract = artifacts.require('State')

	describe('createRepository', () => {
		it('Create a new Repository Contract of a package', async () => {
			const contract = await reposioryFactoryContract.new({from: deployer})
			const state = await stateContract.new({from: deployer})
			await state.addOperator(contract.address, {from: deployer})
			await contract.changeStateAddress(state.address, {from: deployer})
			const results = await contract.createRepository('pkg', {from: deployer})
			expect(results).not.to.be.equal(0)
		})

		it(
			'Should fail to create a new Repository Contract when failed authorization of npm'
		)

		it('Should fail to create a new Repository Contract of a package when the package already has a Repository Contract', async () => {
			const contract = await reposioryFactoryContract.new({from: deployer})
			const state = await stateContract.new({from: deployer})
			await state.addOperator(contract.address, {from: deployer})
			await contract.changeStateAddress(state.address, {from: deployer})
			await contract.createRepository('pkg', {from: deployer})
			const results = await contract
				.createRepository('pkg', {from: deployer})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
			expect((results as any).reason).to.be.equal(
				'Repository is already created'
			)
		})
	})

	describe('kill', () => {
		it('Destruct this contract')

		it(
			'Should fail to destruct this contract when sent from the non-owner account'
		)
	})
})
