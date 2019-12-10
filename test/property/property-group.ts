contract(
	'PrpertyGroupTest',
	([deployer, propertyFactory, property, dummyProperty]) => {
		const propertyGroupContract = artifacts.require('PropertyGroup')
		const addressConfigContract = artifacts.require('AddressConfig')
		describe('PrpertyGroup; createProperty', () => {
			let propertyGroup: any
			beforeEach(async () => {
				const addressConfig = await addressConfigContract.new({from: deployer})
				propertyGroup = await propertyGroupContract.new(addressConfig.address, {
					from: deployer
				})
				await propertyGroup.createStorage()
				await addressConfig.setPropertyGroup(propertyGroup.address, {
					from: deployer
				})
				await addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer
				})
				await propertyGroup.addGroup(property, {
					from: propertyFactory
				})
			})

			it('Create a new Property Contract and emit Create Event telling created property address', async () => {
				const result = await propertyGroup.isGroup(property)
				expect(result).to.be.equal(true)
			})

			it('Adds a new Property Contract address to State Contract', async () => {
				const result = await propertyGroup.isGroup(dummyProperty)
				expect(result).to.be.equal(false)
			})
		})
	}
)
