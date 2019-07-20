contract('UseState', ([deployer, u1, u2]) => {
	const useStateContract = artifacts.require('UseStateTest')
	const stateContract = artifacts.require('State')
	const propertyContract = artifacts.require('Property')
	const propertyFactoryContract = artifacts.require('PropertyFactory')

	describe('State; changeStateAddress', () => {
		it('Change state address', async () => {
			const state = await stateContract.new({from: deployer})
			await state.setToken(u1, {from: deployer})
			const useState = await useStateContract.new({from: deployer})
			const token = await useState.t_getToken().catch((err: Error) => err)
			expect(token).to.instanceOf(Error)

			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			const results = await useState.t_getToken()
			expect(results.toString()).to.be.equal(u1)
		})

		it('Should fail to change state address when sent from the non-owner account', async () => {
			const state = await stateContract.new({from: deployer})
			await state.setToken(u1, {from: deployer})
			const useState = await useStateContract.new({from: deployer})
			const results = await useState
				.changeStateAddress(state.address, {
					from: u2
				})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('State; state', () => {
		it('Get a State instance', async () => {
			const state = await stateContract.new({from: deployer})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			const results = await useState.t_state({
				from: deployer
			})
			expect(results).to.be.deep.equal(state.address)
		})

		it('After the state address has changed, returns a new State instance', async () => {
			const state1 = await stateContract.new({from: deployer})
			await state1.setToken(u1, {from: deployer})
			const state2 = await stateContract.new({from: deployer})
			await state2.setToken(u2, {from: deployer})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state1.address, {
				from: deployer
			})
			const prev = await useState.t_getToken()
			expect(prev.toString()).to.be.equal(u1)

			await useState.changeStateAddress(state2.address, {
				from: deployer
			})
			const next = await useState.t_getToken()
			expect(next.toString()).to.be.equal(u2)
		})
	})

	describe('Utility token; getToken', () => {
		it('Get a token address', async () => {
			const state = await stateContract.new({from: deployer})
			await state.setToken(u1, {from: deployer})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			const results = await useState.t_getToken()
			expect(results.toString()).to.be.equal(u1)
		})
	})

	describe('Property token; addProperty', () => {
		it('Add Property Contract token address', async () => {
			const propertyFactory = await propertyFactoryContract.new({
				from: deployer
			})
			const property = await propertyContract.new(
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const state = await stateContract.new({from: deployer})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			await state.setPropertyFactory(propertyFactory.address, {from: deployer})
			await useState.t_addProperty(property.address, {
				from: propertyFactory.address
			})
			const results = await state.isProperty(property.address, {
				from: deployer
			})
			expect(results.toString()).to.be.equal(property.address)
		})

		it(
			'Should fail to add Property Contract token address when sent from the non-Market Factory account'
		)

		it(
			'Should fail to add Property Contract token address when the exists same id'
		)
	})

	describe('Property token; isProperty', () => {
		it('Verifying the passed address is a Property Contract address')

		it(
			'Should fail to verify the passed address is a Property Contract address when not exists Property Contract'
		)
	})

	describe('Allocator; get allocator', () => {
		it('Get a Allocator Contract address', async () => {
			const state = await stateContract.new({from: deployer})
			await state.setAllocator('0x111122223333444455556666777788889999aAaa', {
				from: deployer
			})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			const results = await useState.t_allocator()
			expect(results).to.be.equal('0x111122223333444455556666777788889999aAaa')
		})
	})

	describe('Metrics Contract; addMetrics', () => {
		it('Add Metrics Contract token address')

		it(
			'Should fail to add Metrics Contract address when sent from the non-Market Contract'
		)
	})

	describe('Metrics Contract; isMetrics', () => {
		it('Verifying the passed address is a Metrics Contract address')

		it(
			'Should fail to verify the passed address is a Metrics Contract address when not exists Metrics Contract'
		)
	})
})
