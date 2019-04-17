// tslint:disable:no-unsafe-any
const useState = artifacts.require('UseState')
const stateContract = artifacts.require('State')
const securityContractUseState = artifacts.require('Security')

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

	describe('Security token', () => {
		it('Get a security address of a package')

		it('Add a security address of a package')

		it('Get all securities address')
	})

	describe('Balance', () => {
		it(
			'Get the utility tokens balance of all holders from a security address stored in the state'
		)
	})
})
