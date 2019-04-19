// tslint:disable:no-unsafe-any
const factory = artifacts.require('Factory')
const stateContractFactory = artifacts.require('State')

contract('Factory', ([deployer]) => {
	describe('Create new security', () => {
		it('Create new security of a package')

		it('Fail to create new security of a package when the package already has security.', async () => {
			const contract = await factory.new({ from: deployer })
			const state = await stateContractFactory.new({ from: deployer })
			await state.addOperator(contract.address, { from: deployer })
			await contract.changeStateAddress(state.address, { from: deployer })
			await contract.createSecurity('pkg', { from: deployer })
			const results = await contract
				.createSecurity('pkg', { from: deployer })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
			expect((results as any).reason).to.be.equal('Security is already created')
		})
	})

	describe('Destroy', () => {
		it('Destruct this contract')

		it('Fail to destruct this contract from a non-owner account')
	})
})
