contract('PropertyFactoryTest', ([deployer]) => {
	const propertyFactoryContract = artifacts.require('property/PropertyFactory')
	const propertyContract = artifacts.require('property/Property')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')
	const addressConfigContract = artifacts.require('common/config/AddressConfig')
	const policyContract = artifacts.require('policy/PolicyTest')
	const policyFactoryContract = artifacts.require('policy/PolicyFactory')
	const voteTimesContract = artifacts.require('vote/VoteTimes')
	describe('PropertyFactory; createProperty', () => {
		let propertyFactory: any
		let propertyGroup: any
		let addressConfig: any
		let expectedPropertyAddress: any
		let deployedProperty: any
		let policy: any
		let policyFactory: any
		let voteTimes: any

		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			policy = await policyContract.new({from: deployer})
			policyFactory = await policyFactoryContract.new(addressConfig.address, {
				from: deployer
			})
			voteTimes = await voteTimesContract.new({from: deployer})
			await voteTimes.createStorage()
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
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
			const isProperty = await propertyGroup.isProperty(
				expectedPropertyAddress,
				{
					from: deployer
				}
			)
			expect(isProperty).to.be.equal(true)
		})
	})
})
