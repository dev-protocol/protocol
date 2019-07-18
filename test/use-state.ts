contract('UseState', ([deployer, u1, u2]) => {
	const useStateContract = artifacts.require('UseStateTest')
	const stateContract = artifacts.require('State')
	const repositoryContract = artifacts.require('Repository')

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

	describe('Repository token; addRepository', () => {
		it('Add Repository Contract token address', async () => {
			const repository = await repositoryContract.new(
				'pkg',
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
			await state.addOperator(useState.address, {from: deployer})
			await useState.t_addRepository('pkg', repository.address, {
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
	})

	describe('Repository token; getRepository', () => {
		it('Get the repository address by package name')
	})

	describe('Repository token; isRepository', () => {
		it('Verifying the passed address is a Repository Contract address')

		it(
			'Should fail to verify the passed address is a Repository Contract address when not exists Repository Contract'
		)
	})

	describe('Distributor; getDistributor', () => {
		it('Get a Distributor Contract address', async () => {
			const state = await stateContract.new({from: deployer})
			await state.setDistributor('0x111122223333444455556666777788889999aAaa', {
				from: deployer
			})
			const useState = await useStateContract.new({from: deployer})
			await useState.changeStateAddress(state.address, {
				from: deployer
			})
			const results = await useState.t_getDistributor()
			expect(results).to.be.equal('0x111122223333444455556666777788889999aAaa')
		})
	})
})
