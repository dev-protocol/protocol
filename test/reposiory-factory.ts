// tslint:disable:no-unsafe-any
const reposioryFactory = artifacts.require('ReposioryFactory')
const stateContractFactory = artifacts.require('State')

contract('ReposioryFactory', ([deployer]) => {
	describe('Create new repository', () => {
		it('Create new repository of a package')

		it('Fail to create new repository of a package when the package already has repository.', async () => {
			const contract = await reposioryFactory.new({ from: deployer })
			const state = await stateContractFactory.new({ from: deployer })
			await state.addOperator(contract.address, { from: deployer })
			await contract.changeStateAddress(state.address, { from: deployer })
			await contract.createRepository('pkg', { from: deployer })
			const results = await contract
				.createRepository('pkg', { from: deployer })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
			expect((results as any).reason).to.be.equal(
				'Repository is already created'
			)
		})
	})

	describe('Destroy', () => {
		it('Destruct this contract')

		it('Fail to destruct this contract from a non-owner account')
	})
})
