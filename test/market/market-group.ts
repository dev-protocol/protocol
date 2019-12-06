contract('MarketGroupTest', ([deployer, u1, dummyMarket]) => {
	const marketGroupContract = artifacts.require('MarketGroup')
	const marketFactoryContract = artifacts.require('MarketFactory')
	const addressConfigContract = artifacts.require('AddressConfig')
	const policyContract = artifacts.require('PolicyTest1')
	const policyFactoryContract = artifacts.require('PolicyFactory')
	const policyGroupContract = artifacts.require('PolicyGroup')
	const voteTimesContract = artifacts.require('VoteTimes')
	describe('MarketGroup validateMarketAddress', () => {
		let marketGroup: any
		let expectedMarketAddress: any
		let policy: any
		let policyFactory: any
		let voteTimes: any
		let policyGroup: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await marketGroup.createStorage()
			voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
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
			policyGroup = await policyGroupContract.new({from: deployer})
			policyGroup.createStorage()
			await addressConfig.setPolicyGroup(policyGroup.address, {
				from: deployer
			})
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
			await marketGroup.isMarket(expectedMarketAddress)
		})
		it('When the market address is not specified', async () => {
			const result = await marketGroup.isMarket(dummyMarket)
			expect(result).to.be.equal(false)
		})
	})
})
