contract('PropertyFactoryTest', ([deployer]) => {
	const propertyContract = artifacts.require('Property')
	const propertyGroupContract = artifacts.require('PropertyGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const propertyFactoryContract = artifacts.require('PropertyFactory')
	const voteTimesContract = artifacts.require('VoteTimes')
	const voteTimesStorageContract = artifacts.require('VoteTimesStorage')
	describe('PropertyFactory; createProperty', () => {
		let propertyFactory: any
		let propertyGroup: any
		let expectedPropertyAddress: any
		beforeEach(async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
			propertyGroup.createStorage()
			await addressConfig.setPropertyGroup(propertyGroup.address, {
				from: deployer
			})
			const voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			const voteTimesStorage = await voteTimesStorageContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await voteTimesStorage.createStorage()
			await addressConfig.setVoteTimesStorage(voteTimesStorage.address, {
				from: deployer
			})
			propertyFactory = await propertyFactoryContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await addressConfig.setPropertyFactory(propertyFactory.address, {
				from: deployer
			})
			const result = await propertyFactory.createProperty('sample', 'SAMPLE')
			expectedPropertyAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._property
		})

		it('Create a new Property Contract and emit Create Event telling created property address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedProperty = await propertyContract.at(
				expectedPropertyAddress
			)
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
			const isProperty = await propertyGroup.isGroup(expectedPropertyAddress)
			expect(isProperty).to.be.equal(true)
		})
	})
})
