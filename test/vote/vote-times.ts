contract(
	'VoteTimesTest',
	([deployer, marketFactory, propertyFactory, property, voteCounter]) => {
		// Const propertyFactoryContract = artifacts.require('PropertyFactory')
		const voteTimesTestContract = artifacts.require('VoteTimes')
		const addressConfigContract = artifacts.require('AddressConfig')
		const propertyGroupContract = artifacts.require('PropertyGroup')
		describe('VoteTimes; addVoteTimes, addVoteTimesByProperty', () => {
			let voteTimes: any
			let addressConfig: any
			let propertyGroup: any
			beforeEach(async () => {
				console.log(1)
				addressConfig = await addressConfigContract.new({from: deployer})
				console.log(addressConfig.address)
				console.log(addressConfig)
				voteTimes = await voteTimesTestContract.new(addressConfig.addrres, {
					from: deployer
				})
				await addressConfig.setMarketFactory(marketFactory, {
					from: deployer
				})
				await addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer
				})
				await addressConfig.setVoteCounter(voteCounter, {
					from: deployer
				})

				propertyGroup = await propertyGroupContract.new(addressConfig.address, {
					from: deployer
				})
				await propertyGroup.createStorage()
				await propertyGroup.addProperty(property, {from: propertyFactory})

				await voteTimes.createStorage({from: deployer})
				await voteTimes.addVoteCount({from: marketFactory})
				await voteTimes.addVoteCount({from: marketFactory})
				await voteTimes.addVoteTimesByProperty(property, {
					from: voteCounter
				})
			})
			it('If the vote was held twice, but the vote was held only once, the number of abstentions will be 1.', async () => {
				// Const result = await voteTimes.getAbstentionTimes(property)
				// expect(result.toNumber()).to.be.equal(1)
			})
			// It('Storage information can be taken over.', async () => {
			// 	const storageAddress = await voteTimes.getStorageAddress()
			// 	const newVoteTimes = await voteTimesTestContract.new({
			// 		from: deployer
			// 	})
			// 	await newVoteTimes.setStorage(storageAddress, {
			// 		from: deployer
			// 	})
			// 	await voteTimes.changeOwner(newVoteTimes.address, {
			// 		from: deployer
			// 	})
			// 	await newVoteTimes.addVoteCount({from: policyFactory})
			// 	const result = await newVoteTimes.getAbstentionTimes(propertyAddress)
			// 	expect(result.toNumber()).to.be.equal(2)
			// })
			// it('When reset, the number of abstentions becomes 0.', async () => {
			// 	await voteTimes.resetVoteTimesByProperty(propertyAddress)
			// 	const result = await voteTimes.getAbstentionTimes(propertyAddress)
			// 	expect(result.toNumber()).to.be.equal(0)
			// })
			// it('If the number of votes is 0, the number of votes cast is the number of abstentions.', async () => {
			// 	const result = await voteTimes.getAbstentionTimes(dummyProperty)
			// 	expect(result.toNumber()).to.be.equal(2)
			// })
		})
	}
)
