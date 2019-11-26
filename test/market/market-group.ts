contract('MarketGroupTest', ([deployer, u1]) => {
	const marketGroupContract = artifacts.require('market/MarketGroup')
	const marketFactoryContract = artifacts.require('market/MarketFactory')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	describe('MarketGroupTest', () => {
		var marketGroup: any
		var expectedMarketAddress: any
		var policy: any
		var policyFactory: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({
				from: deployer
			})
			marketGroup = await marketGroupContract.new(addressConfig.address, {
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
			await addressConfig.setMarketGroup(marketGroup.address, {from: deployer})
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
		it('validateMarketAddress', async () => {
			await marketGroup.validateMarketAddress(expectedMarketAddress)
		})
		it('validateMarketAddress error', async () => {
			let err = null
			try {
				await marketGroup.validateMarketAddress(
					'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
				)
			} catch (error) {
				err = error
			}

			expect(err.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only market contract'
			)
		})
	})
})
