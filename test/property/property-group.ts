import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage
} from '../test-lib/utils/error'

contract(
	'PrpertyGroupTest',
	([
		deployer,
		propertyFactory,
		dummyPropertyFactory,
		property,
		dummyProperty
	]) => {
		const dev = new DevProtocolInstance(deployer)
		describe('PrpertyGroup; addGroup, isGroup', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generatePropertyGroup()
				await dev.addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer
				})
				await dev.propertyGroup.addGroup(property, {from: propertyFactory})
			})

			it('Create a new Property Contract and emit Create Event telling created property address', async () => {
				const result = await dev.propertyGroup.isGroup(property)
				expect(result).to.be.equal(true)
			})

			it('Adds a new Property Contract address to State Contract', async () => {
				const result = await dev.propertyGroup.isGroup(dummyProperty)
				expect(result).to.be.equal(false)
			})
			it('Existing property cannot be added', async () => {
				const result = await dev.propertyGroup
					.addGroup(property, {
						from: propertyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already enabled')
			})
			it('Can not execute addGroup without propertyFactory address', async () => {
				const result = await dev.propertyGroup
					.addGroup(dummyProperty, {
						from: dummyPropertyFactory
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
