// tslint:disable:no-unsafe-any
const useState = artifacts.require('UseState')
const stateContract = artifacts.require('State')
const repositoryContractUseState = artifacts.require('Repository')

contract('UseState', ([deployer, u1, u2]) => {
	describe('State', () => {
		it('Change state address', async () => {
			const state1 = await stateContract.new({ from: deployer })
			await state1.setToken(u1, { from: deployer })
			const contract = await useState.new({ from: deployer })
			const token = await contract.getToken().catch((err: Error) => err)
			expect(token).to.instanceOf(Error)

			await contract.changeStateAddress(state1.address, {
				from: deployer
			})
			const results = await contract.getToken()
			expect(results.toString()).to.be.equal(u1)
		})

		it('Fail to change state address from a non-owner account', async () => {
			const state1 = await stateContract.new({ from: deployer })
			await state1.setToken(u1, { from: deployer })
			const contract = await useState.new({ from: deployer })
			const results = await contract
				.changeStateAddress(state1.address, {
					from: u2
				})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Get a State instance', async () => {
			const state1 = await stateContract.new({ from: deployer })
			const contract = await useState.new({ from: deployer })
			await contract.changeStateAddress(state1.address, {
				from: deployer
			})
			const results = await contract.state({
				from: deployer
			})
			expect(results).to.be.deep.equal(state1.address)
		})

		it('After the state address has changed, returns a new State instance', async () => {
			const state1 = await stateContract.new({ from: deployer })
			await state1.setToken(u1, { from: deployer })
			const state2 = await stateContract.new({ from: deployer })
			await state2.setToken(u2, { from: deployer })
			const contract = await useState.new({ from: deployer })
			await contract.changeStateAddress(state1.address, {
				from: deployer
			})
			const prev = await contract.getToken()
			expect(prev.toString()).to.be.equal(u1)

			await contract.changeStateAddress(state2.address, {
				from: deployer
			})
			const next = await contract.getToken()
			expect(next.toString()).to.be.equal(u2)
		})
	})

	describe('Utility token', () => {
		it('Get a token address', async () => {
			const state1 = await stateContract.new({ from: deployer })
			await state1.setToken(u1, { from: deployer })
			const contract = await useState.new({ from: deployer })
			await contract.changeStateAddress(state1.address, {
				from: deployer
			})
			const results = await contract.getToken()
			expect(results.toString()).to.be.equal(u1)
		})
	})

	describe('Repository token', () => {
		it('Add a repository address of a package', async () => {
			const repository = await repositoryContractUseState.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const state = await stateContract.new({ from: deployer })
			const contract = await useState.new({ from: deployer })
			await contract.changeStateAddress(state.address, {
				from: deployer
			})
			await state.addOperator(contract.address, { from: deployer })
			await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await state.getRepository('pkg', {
				from: deployer
			})
			expect(results.toString()).to.be.equal(repository.address)
		})

		it('Get all repositories address')
	})

	describe('Balance', () => {
		it(
			'Get the utility tokens balance of all holders from a repository address stored in the state'
		)
	})
})
