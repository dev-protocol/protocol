contract('PrpertyGroupTest', ([deployer]) => {
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	const policyVoteCounterContract = artifacts.require(
		'policy/PolicyVoteCounter'
	)
	describe('createProperty', () => {
		var propertyFactory: any
		var propertyGroup: any
		var addressConfig: any
		var expectedPropertyAddress: any
		var policy: any
		var policyFactory: any
		var policyVoteCounter: any

		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			policyVoteCounter = await policyVoteCounterContract.new({from: deployer})
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await addressConfig.setPropertyGroup(propertyGroup.address, {
				from: deployer
			})
			await addressConfig.setPolicyVoteCounter(policyVoteCounter.address, {
				from: deployer
			})
			await policyFactory.createPolicy(policy.address)
			propertyFactory = await propertyFactoryContract.new(
				addressConfig.address,
				{from: deployer}
			)
			await addressConfig.setPropertyFactory(propertyFactory.address, {
				from: deployer
			})
			const result = await propertyFactory.createProperty('sample', 'SAMPLE', {
				from: deployer
			})
			expectedPropertyAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._property
		})

		it('Create a new Property Contract and emit Create Event telling created property address', async () => {
			const result = await propertyGroup.isProperty(expectedPropertyAddress)
			expect(result).to.be.equal(true)
		})

		it('Adds a new Property Contract address to State Contract', async () => {
			const result = await propertyGroup.isProperty(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167'
			)
			expect(result).to.be.equal(false)
		})
	})
})
