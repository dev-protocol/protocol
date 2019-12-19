contract('MarketFactoryTest', ([deployer, policyFactory]) => {
	const marketFactoryContract = artifacts.require('MarketFactory')
	const marketContract = artifacts.require('Market')
	const marketGroupContract = artifacts.require('MarketGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const marketTest1Contract = artifacts.require('MarketTest1')
	const policyContract = artifacts.require('Policy')
	const policyTest1Contract = artifacts.require('PolicyTest1')
	const voteTimesContract = artifacts.require('VoteTimes')
	const voteTimesStorageContract = artifacts.require('VoteTimesStorage')
	const decimalsLibrary = artifacts.require('Decimals')
	describe('MarketFactory; createMarket', () => {
		let market: any
		let marketGroup: any
		let expectedMarketAddress: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			await addressConfig.setPolicyFactory(policyFactory, {
				from: deployer
			})
			const marketFactory = await marketFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await marketGroup.createStorage()
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			const voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			const voteTimesStorage = await voteTimesStorageContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await voteTimesStorage.createStorage()
			await addressConfig.setVoteTimesStorage(voteTimesStorage.address, {
				from: deployer
			})
			const decimals = await decimalsLibrary.new({from: deployer})
			await policyTest1Contract.link('Decimals', decimals.address)
			const policyTest1 = await policyTest1Contract.new({
				from: deployer
			})
			const policy = await policyContract.new(
				addressConfig.address,
				policyTest1.address,
				{
					from: policyFactory
				}
			)
			await addressConfig.setPolicy(policy.address, {
				from: policyFactory
			})
			market = await marketTest1Contract.new(addressConfig.address, {
				from: deployer
			})
			const result = await marketFactory.create(market.address, {
				from: deployer
			})
			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
		})

		it('Create a new Market Contract and emit C Reate Event telling created mark Et address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedMarket = await marketContract.at(expectedMarketAddress)
			const behaviorAddress = await deployedMarket.behavior({from: deployer})

			expect(behaviorAddress).to.be.equal(market.address)
		})

		it('Adds a new Market Contract address to State Contract', async () => {
			const result = await marketGroup.isGroup(expectedMarketAddress, {
				from: deployer
			})
			expect(result).to.be.equal(true)
		})
	})
})
