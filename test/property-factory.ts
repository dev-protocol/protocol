import {
	PropertyInstance,
	PropertyFactoryInstance,
	StateTestInstance
} from '../types/truffle-contracts'

contract('PropertyFactory', ([deployer]) => {
	const propertyFactoryContract = artifacts.require('PropertyFactory')
	const propertyContract = artifacts.require('Property')
	const stateContract = artifacts.require('StateTest')

	describe('createProperty', () => {
		var propertyFactory: PropertyFactoryInstance
		var state: StateTestInstance
		var expectedPropertyAddress: any
		var deployedProperty: PropertyInstance

		beforeEach(async () => {
			state = await stateContract.new({from: deployer})
			propertyFactory = await propertyFactoryContract.new({from: deployer})
			await state.setPropertyFactory(propertyFactory.address, {from: deployer})
			await propertyFactory.changeStateAddress(state.address, {from: deployer})

			const result = await propertyFactory.createProperty('sample', 'SAMPLE', {
				from: deployer
			})

			expectedPropertyAddress = await result.logs.filter(
				e => e.event === 'Create'
			)[0].args._property
		})

		it('Create a new Property Contract and emit Create Event telling created property address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			deployedProperty = await propertyContract.at(expectedPropertyAddress)
			const name = await deployedProperty.name({from: deployer})
			const symbol = await deployedProperty.symbol({from: deployer})
			const decimals = await deployedProperty.decimals({from: deployer})
			const totalSupply = await deployedProperty.totalSupply({from: deployer})

			expect(name).to.be.equal('sample')
			expect(symbol).to.be.equal('SAMPLE')
			expect(decimals.toNumber()).to.be.equal(18)
			expect(totalSupply.toNumber()).to.be.equal(10000000)
		})

		it('Adds a new Property Contract address to State Contract', async () => {
			const isProperty = await state.isProperty(expectedPropertyAddress, {
				from: deployer
			})

			expect(isProperty).to.be.equal(true)
		})
	})
})
