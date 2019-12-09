contract('PrpertyGroupTest', ([deployer, dummyProperty]) => {
	const propertyFactoryContract = artifacts.require('PropertyFactory')
	const propertyGroupContract = artifacts.require('PropertyGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const policyContract = artifacts.require('PolicyTest1')
	const policyFactoryContract = artifacts.require('PolicyFactory')
	const policyGroupContract = artifacts.require('PolicyGroup')
	const voteTimesContract = artifacts.require('VoteTimes')
	describe('PrpertyGroup; createProperty', () => {
		let propertyFactory: any
		let propertyGroup: any
		let addressConfig: any
		let expectedPropertyAddress: any
		let policy: any
		let policyFactory: any
		let voteTimes: any
		let policyGroup: any
		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			policy = await policyContract.new({from: deployer})
			policyGroup = await policyGroupContract.new({from: deployer})
			policyGroup.createStorage()
			await addressConfig.setPolicyGroup(policyGroup.address, {
				from: deployer
			})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			await voteTimes.createStorage()
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
			propertyGroup.createStorage()
			await addressConfig.setPolicyFactory(policyFactory.address, {
				from: deployer
			})
			await addressConfig.setPropertyGroup(propertyGroup.address, {
				from: deployer
			})
			await addressConfig.setVoteTimes(voteTimes.address, {
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
			const result = await propertyGroup.isProperty(dummyProperty)
			expect(result).to.be.equal(false)
		})
	})
})
