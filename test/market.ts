contract('Market', ([deployer]) => {
	const marketFactoryContract = artifacts.require('MarketFactory')
	const marketContract = artifacts.require('Market')
	const stateContract = artifacts.require('State')

	describe('createProperty', () => {
		it('Create a new Property Contract', async () => {
			const marketFactory = await marketFactoryContract.new({
				from: deployer
			})
			const market = await marketContract.new({
				from: deployer
			})
			const state = await stateContract.new({from: deployer})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await market.changeStateAddress(state.address, {from: deployer})
			const results = await market.createProperty('pkg', 'PKG', {
				from: deployer
			})
			expect(results).not.to.be.equal(0)
		})

		it('Should fail to create a new Property Contract when the id already has a Property Contract', async () => {
			const marketFactory = await marketFactoryContract.new({
				from: deployer
			})
			const market = await marketContract.new({
				from: deployer
			})
			const state = await stateContract.new({from: deployer})
			await state.setMarketFactory(marketFactory.address, {from: deployer})
			await market.changeStateAddress(state.address, {from: deployer})
			await market.createProperty('pkg', 'PKGA', {from: deployer})
			const results: any = await market
				.createProperty('pkg', 'PKGB', {from: deployer})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
			expect(results.reason).to.be.equal('Property is already created')
		})

		it('Should fail to create a new Property Contract when not enabled')
	})

	describe('schema', () => {
		it('Get Schema of mapped Behavior Contract')
	})

	describe('authenticate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('calculate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('vote', () => {
		it('Vote in favor, votes are the number of DEVs held by the sender')

		it(
			'Vote as a negative vote, votes are the number of DEVs held by the sender'
		)

		it(
			'When votes for more than 10% of the total supply of DEV are obtained, and if there are more positive votes than negative votes, this Market Contract is enabled'
		)

		it(
			'When votes for more than 10% of the total supply of DEV are obtained, and if there are more negative votes than positive votes, this Market Contract is disabled'
		)

		it('Should fail to vote when already determined enabled/ disabled')
	})
})
