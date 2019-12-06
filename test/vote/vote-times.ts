contract(
	'VoteTimesTest',
	([deployer, dummyProperty, policyFactory, voteCounter]) => {
		const propertyFactoryContract = artifacts.require('PropertyFactory')
		const voteTimesTestContract = artifacts.require('VoteTimes')
		const addressConfigContract = artifacts.require('AddressConfig')
		const propertyGroupContract = artifacts.require('PropertyGroup')
		describe('VoteTimes; addVoteTimes, addVoteTimesByProperty', () => {
			let voteTimes: any
			let addressConfig: any
			let propertyGroup: any
			let propertyFactory: any
			let propertyAddress: any
			beforeEach(async () => {
				console.log(1)
				addressConfig = await addressConfigContract.new({from: deployer})
				console.log(addressConfig.addrres)
				console.log(2)
				await addressConfig.setPolicyFactory(policyFactory, {from: deployer})
				console.log(addressConfig.addrres)
				console.log(3)
				await addressConfig.setVoteCounter(voteCounter, {from: deployer})
				console.log(addressConfig.addrres)
				console.log(4)
				console.log(addressConfig.addrres)
				voteTimes = await voteTimesTestContract.new(addressConfig.addrres, {
					from: deployer
				})
				console.log(5)
				await addressConfig.setVoteTimes(voteTimes, {from: deployer})
				propertyGroup = await propertyGroupContract.new(addressConfig.address, {
					from: deployer
				})
				await propertyGroup.createStorage()
				await addressConfig.setPropertyGroup(propertyGroup.address, {
					from: deployer
				})

				propertyFactory = await propertyFactoryContract.new(
					addressConfig.address,
					{from: deployer}
				)
				await addressConfig.setPropertyFactory(propertyFactory.address, {
					from: deployer
				})

				const result = await propertyFactory.createProperty(
					'sample',
					'SAMPLE',
					{
						from: deployer
					}
				)

				propertyAddress = await result.logs.filter(
					(e: {event: string}) => e.event === 'Create'
				)[0].args._property
				await voteTimes.createStorage({from: deployer})
				await voteTimes.addVoteCount({from: policyFactory})
				await voteTimes.addVoteCount({from: policyFactory})
				await voteTimes.addVoteTimesByProperty(propertyAddress, {
					from: voteCounter
				})
			})
			it('If the vote was held twice, but the vote was held only once, the number of abstentions will be 1.', async () => {
				const result = await voteTimes.getAbstentionTimes(propertyAddress)
				expect(result.toNumber()).to.be.equal(1)
			})
			it('Storage information can be taken over.', async () => {
				const storageAddress = await voteTimes.getStorageAddress()
				const newVoteTimes = await voteTimesTestContract.new({
					from: deployer
				})
				await newVoteTimes.setStorage(storageAddress, {
					from: deployer
				})
				await voteTimes.changeOwner(newVoteTimes.address, {
					from: deployer
				})
				await newVoteTimes.addVoteCount({from: policyFactory})
				const result = await newVoteTimes.getAbstentionTimes(propertyAddress)
				expect(result.toNumber()).to.be.equal(2)
			})
			it('When reset, the number of abstentions becomes 0.', async () => {
				await voteTimes.resetVoteTimesByProperty(propertyAddress)
				const result = await voteTimes.getAbstentionTimes(propertyAddress)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('If the number of votes is 0, the number of votes cast is the number of abstentions.', async () => {
				const result = await voteTimes.getAbstentionTimes(dummyProperty)
				expect(result.toNumber()).to.be.equal(2)
			})
		})
	}
)
