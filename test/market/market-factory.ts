contract('MarketFactoryTest', ([deployer, u1]) => {
	const marketFactoryContract = artifacts.require('MarketFactory')
	const marketContract = artifacts.require('Market')
	const marketGroupContract = artifacts.require('MarketGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const policyContract = artifacts.require('PolicyTest1')
	const policyFactoryContract = artifacts.require('PolicyFactory')
	const policyGroupContract = artifacts.require('PolicyGroup')
	const voteTimesContract = artifacts.require('VoteTimes')
	describe('MarketFactory; createMarket', () => {
		let marketFactory: any
		let marketGroup: any
		let addressConfig: any
		let expectedMarketAddress: any
		let deployedMarket: any
		let policy: any
		let policyFactory: any
		let voteTimes: any
		let policyGroup: any
		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			marketFactory = await marketFactoryContract.new(addressConfig.address, {
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

		it('Create a new Market Contract and emit C Reate Event telling created mark Et address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			deployedMarket = await marketContract.at(expectedMarketAddress)
			const behaviorAddress = await deployedMarket.behavior({from: deployer})

			expect(behaviorAddress).to.be.equal(u1)
		})

		it('Adds a new Market Contract address to State Contract', async () => {
			const result = await marketGroup.isMarket(expectedMarketAddress, {
				from: deployer
			})
			expect(result).to.be.equal(true)
		})
	})
})
