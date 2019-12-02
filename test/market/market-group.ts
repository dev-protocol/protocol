contract('MarketGroupTest', ([deployer, u1, dummyMarket]) => {
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const addressConfigContract = artifacts.require('common/config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	const voteTimesContract = artifacts.require('vote/VoteTimes')
	describe('MarketGroup validateMarketAddress', () => {
		let marketGroup: any
		let expectedMarketAddress: any
		let policy: any
		let policyFactory: any
		let voteTimes: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			voteTimes = await voteTimesContract.new({from: deployer})
			await voteTimes.createStorage()
			const marketFactory = await marketFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			const result = await marketFactory.createMarket(u1, {from: deployer})
			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
		})
		it('When a market address is specified', async () => {
			await marketGroup.validateMarketAddress(expectedMarketAddress)
		})
		it('When the market address is not specified', async () => {
			const result = await marketGroup
				.validateMarketAddress(dummyMarket)
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only market contract'
			)
		})
	})
})
