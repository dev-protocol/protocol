const useState = artifacts.require('UseStateTest')
const stateContract = artifacts.require('State')
const repositoryContractUseState = artifacts.require('Repository')

contract('UseState', ([deployer, u1, u2]) => {
	describe('State', () => {
		it('Change state address', async () => {
			const state1 = await stateContract.new({ from: deployer })
			await state1.setToken(u1, { from: deployer })
			const contract = await useState.new({ from: deployer })
			const token = await contract.t_getToken().catch((err: Error) => err)
			expect(token).to.instanceOf(Error)

			await contract.changeStateAddress(state1.address, {
				from: deployer
			})
			const results = await contract.t_getToken()
			expect(results.toString()).to.be.equal(u1)
		})

		it('Should fail to change state address when sent from the non-owner account', async () => {
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
			const results = await contract.t_state({
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
			const prev = await contract.t_getToken()
			expect(prev.toString()).to.be.equal(u1)

			await contract.changeStateAddress(state2.address, {
				from: deployer
			})
			const next = await contract.t_getToken()
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
			const results = await contract.t_getToken()
			expect(results.toString()).to.be.equal(u1)
		})
	})

	describe('Repository token', () => {
		it('Add Repository Contract token address', async () => {
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
			await contract.t_addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await state.getRepository('pkg', {
				from: deployer
			})
			expect(results.toString()).to.be.equal(repository.address)
		})

		it(
			'Should fail to add Repository Contract token address when sent from the non-operator account'
		)

		it(
			'Should fail to add Repository Contract token address when the exists same package name'
		)

		it('Get the repository address by package name')

		it('Verifying the passed address is a Repository Contract address')

		it(
			'Should fail to verify the passed address is a Repository Contract address when not exists Repository Contract'
		)
	})

	describe('Distributor', () => {
		it('Get a Distributor Contract address')
	})
})
