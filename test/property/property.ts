contract('PropertyTest', ([deployer, ui]) => {
	const lockupContract = artifacts.require('Lockup')
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyContract = artifacts.require('property/Property')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const policyVoteCounterContract = artifacts.require(
		'policy/PolicyVoteCounter'
	)
	describe('Property; withdrawDev', () => {
		let propertyFactory: any
		let propertyGroup: any
		let addressConfig: any
		let propertyAddress: any
		let policyVoteCounter: any
		let lockup: any
		let property: any
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
		it('When executed from other than the lockup address', async () => {
			property = await propertyContract.at(propertyAddress)
			const result = await property
				.withdrawDev(ui, {from: deployer})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only lockup contract -- Reason given: only lockup contract.'
			)
		})
		it('When lockup value is 0', async () => {})
		it('When withdrawn successfully', async () => {})
	})
})
