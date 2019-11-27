contract('MarketTest', ([deployer, behavior]) => {
	const marketContract = artifacts.require('merket/Market')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const dummyDEVContract = artifacts.require('DummyDEV')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')

	describe('Market; schema', () => {
		it('Get Schema of mapped Behavior Contract')
	})

	describe('Market; authenticate', () => {
		it('Proxy to mapped Behavior Contract')

		it(
			'Should fail to run when sent from other than the owner of Property Contract'
		)

		it(
			'Should fail to the transaction if the second argument as ID and a Metrics Contract exists with the same ID.'
		)
	})

	describe('Market; authenticatedCallback', () => {
		it('Create a new Metrics Contract')

		it(
			'Market Contract address and Property Contract address are mapped to the created Metrics Contract'
		)

		it(
			'Should fail to create a new Metrics Contract when sent from non-Behavior Contract'
		)
	})

	describe('Market; calculate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('Market; vote', () => {
		let marketFactory: any
		let marketGroup: any
		let dummyDEV: any
		let market: any
		let addressConfig: any
		let policy: any
		let policyFactory: any
		let expectedMarketAddress: any
		beforeEach(async () => {
			dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {
				from: deployer
			})
			addressConfig = await addressConfigContract.new({from: deployer})
			await addressConfig.setToken(dummyDEV.address, {from: deployer})
			marketFactory = await marketFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			const result = await marketFactory.createMarket(behavior)
			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
			market = await marketContract.at(expectedMarketAddress)
		})

		it('Total value of votes for and against, votes are the number of sent DEVs', async () => {})
		it('Creating a market contract from other than a factory results in an error', async () => {})

		it('When total votes for more than 10% of the total supply of DEV are obtained, this Market Contract is enabled', async () => {
			await dummyDEV.approve(market.address, 1000, {from: deployer})

			await market.vote(1000, {from: deployer})
			const isEnable = await market.enabled({from: deployer})

			expect(isEnable).to.be.equal(true)
		})

		it('Should fail to vote when already determined enabled', async () => {
			await dummyDEV.approve(market.address, 1000, {from: deployer})

			await market.vote(900, {from: deployer})
			const isEnable = await market.enabled({from: deployer})

			expect(isEnable).to.be.equal(true)

			const result = await market
				.vote(100, {from: deployer})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert market is already enabled -- Reason given: market is already enabled.'
			)
		})

		it('Vote decrease the number of sent DEVs from voter owned DEVs', async () => {
			await dummyDEV.approve(market.address, 100, {from: deployer})

			await market.vote(100, {from: deployer})
			const ownedDEVs = await dummyDEV.balanceOf(deployer, {from: deployer})

			expect(ownedDEVs.toNumber()).to.be.equal(9900)
		})

		it('Vote decrease the number of sent DEVs from DEVtoken totalSupply', async () => {
			await dummyDEV.approve(market.address, 100, {from: deployer})

			await market.vote(100, {from: deployer})
			const DEVsTotalSupply = await dummyDEV.totalSupply({from: deployer})

			expect(DEVsTotalSupply.toNumber()).to.be.equal(9900)
		})
		it('voting deadline is over', async () => {})
	})
})
