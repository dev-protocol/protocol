contract('Property', ([deployer]) => {
	const lockupContract = artifacts.require('Lockup')
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyVoteCounterContract = artifacts.require(
		'policy/PolicyVoteCounter'
	)
	describe('withdrawDev', () => {
		var propertyFactory: any
		var propertyGroup: any
		var addressConfig: any
		var propertyAddress: any
		var policyVoteCounter: any
		var lockup: any
		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			lockup = await lockupContract.new(addressConfig.address)
			policyVoteCounter = await policyVoteCounterContract.new({from: deployer})
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setPropertyGroup(propertyGroup.address, {
				from: deployer
			})
			await addressConfig.setPolicyVoteCounter(policyVoteCounter.address, {
				from: deployer
			})
			await addressConfig.setLockup(lockup.address, {
				from: deployer
			})
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
			propertyAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._property
		})
		it('only lockup', async () => {
			console.log(propertyAddress)
		})
	})
})
