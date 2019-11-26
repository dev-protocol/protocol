contract('Property', ([deployer, ui]) => {
	const lockupContract = artifacts.require('Lockup')
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyContract = artifacts.require('property/Property')
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
		var property: any
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
				from: ui
			})
			propertyAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._property
		})
		it('only lockup', async () => {
			property = await propertyContract.at(propertyAddress)
			const result = await property
				.withdrawDev(ui, {from: deployer})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only lockup contract -- Reason given: only lockup contract.'
			)
		})
		it('value is 0', async () => {})
		it('success', async () => {})
	})
})
