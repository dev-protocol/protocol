contract('PrpertyGroupTest', ([deployer]) => {
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')
	const stateContract = artifacts.require('State')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')

	describe('createProperty', () => {
		var propertyFactory: any
		var propertyGroup: any
		var state: any
		var expectedPropertyAddress: any
		var policy: any
		var policyFactory: any

		beforeEach(async () => {
			state = await stateContract.new({from: deployer})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new({from: deployer})
			propertyGroup = await propertyGroupContract.new({from: deployer})
			await state.setPolicyFactory(policyFactory.address, {from: deployer})
			await state.setPropertyGroup(propertyGroup.address, {from: deployer})
			await propertyGroup.changeStateAddress(state.address, {from: deployer})
			await policyFactory.changeStateAddress(state.address, {from: deployer})
			await policyFactory.createPolicy(policy.address)
			propertyFactory = await propertyFactoryContract.new({from: deployer})
			await state.setPropertyFactory(propertyFactory.address, {from: deployer})
			await propertyFactory.changeStateAddress(state.address, {from: deployer})
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
