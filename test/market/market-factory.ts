contract('MarketFactoryTest', ([deployer, policyFactory]) => {
	const marketFactoryContract = artifacts.require('MarketFactory')
	const marketContract = artifacts.require('Market')
	const marketGroupContract = artifacts.require('MarketGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const marketTest1Contract = artifacts.require('MarketTest1')
	const policyContract = artifacts.require('Policy')
	const policyTest1Contract = artifacts.require('PolicyTest1')
	// Const policyGroupContract = artifacts.require('PolicyGroup')
	const voteTimesContract = artifacts.require('VoteTimes')
	describe('MarketFactory; createMarket', () => {
		let market: any
		let marketGroup: any
		// Let addressConfig: any
		let expectedMarketAddress: any
		// Let deployedMarket: any
		// let policy: any
		// let policyFactory: any
		// let voteTimes: any
		// let policySet: any
		// let policyGroup: any
		beforeEach(async () => {
			console.log(1)
			const addressConfig = await addressConfigContract.new({from: deployer})
			await addressConfig.setPolicyFactory(policyFactory, {
				from: deployer
			})
			console.log(2)
			const marketFactory = await marketFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			console.log(3)
			await addressConfig.setMarketFactory(marketFactory.address, {
				from: deployer
			})
			console.log(4)
			marketGroup = await marketGroupContract.new(addressConfig.address, {
				from: deployer
			})
			console.log(5)
			await marketGroup.createStorage()
			console.log(6)
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
			console.log(7)
			const voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			console.log(8)
			await voteTimes.createStorage()
			console.log(9)
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			console.log(10)
			// Policy = await policyContract.new({from: deployer})
			// policyGroup = await policyGroupContract.new(addressConfig.address, {
			// 	from: deployer
			// })
			// policyGroup.createStorage()
			// await addressConfig.setPolicyGroup(policyGroup.address, {
			// 	from: deployer
			// })
			// policySet = await policySetContract.new({from: deployer})
			// policySet.createStorage()
			// await addressConfig.setPolicySet(policySet.address, {
			// 	from: deployer
			// })
			// policyFactory = await policyFactoryContract.new(addressConfig.address, {
			// 	from: deployer
			// })
			// await addressConfig.setPolicyFactory(policyFactory.address, {
			// 	from: deployer
			// })
			// await policyFactory.createPolicy(policy.address)
			const policyTest1 = await policyTest1Contract.new({
				from: deployer
			})
			const policy = await policyContract.new(
				addressConfig.address,
				policyTest1.address,
				{
					from: deployer
				}
			)
			await addressConfig.setPolicy(policy.address, {
				from: policyFactory
			})
			market = await marketTest1Contract.new({
				from: deployer
			})
			const result = await marketFactory.createMarket(market.address, {
				from: deployer
			})
			console.log(11)
			expectedMarketAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._market
			console.log(12)
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
