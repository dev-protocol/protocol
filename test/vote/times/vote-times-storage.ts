contract(
	'VoteTimesStorageTest',
	([deployer, voteTimes, property, property2]) => {
		const voteTimesStorageContract = artifacts.require('VoteTimesStorage')
		const addressConfigContract = artifacts.require('AddressConfig')
		let voteTimesStorage: any
		let addressConfig: any
		before(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			voteTimesStorage = await voteTimesStorageContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await voteTimesStorage.createStorage()
			await addressConfig.setVoteTimes(voteTimes, {from: deployer})
		})
		describe('VoteTimesStorage; getVoteTimes, setVoteTimes', () => {
			it('Initial value is 0.', async () => {
				const result = await voteTimesStorage.getVoteTimes({from: voteTimes})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await voteTimesStorage.setVoteTimes(3, {from: voteTimes})
				const result = await voteTimesStorage.getVoteTimes({from: voteTimes})
				expect(result.toNumber()).to.be.equal(3)
			})
		})
		describe('VoteTimesStorage; getVoteTimesByProperty, setVoteTimesByProperty', () => {
			it('Initial value is 0.', async () => {
				const result = await voteTimesStorage.getVoteTimesByProperty(property, {
					from: voteTimes
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await voteTimesStorage.setVoteTimesByProperty(property, 3, {
					from: voteTimes
				})
				const result = await voteTimesStorage.getVoteTimesByProperty(property, {
					from: voteTimes
				})
				expect(result.toNumber()).to.be.equal(3)
			})
			it('If not set, initial value can be taken.', async () => {
				const result = await voteTimesStorage.getVoteTimesByProperty(
					property2,
					{from: voteTimes}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
		})
		describe('VoteTimesStorage; getStorageAddress, setStorage, changeOwner', () => {
			it('Value is inherited.', async () => {
				const newVoteTimesStorage = await voteTimesStorageContract.new(
					addressConfig.address,
					{
						from: deployer
					}
				)
				const storageAddress = await voteTimesStorage.getStorageAddress()
				await newVoteTimesStorage.setStorage(storageAddress, {from: deployer})
				await voteTimesStorage.changeOwner(newVoteTimesStorage.address, {
					from: deployer
				})
				const result = await newVoteTimesStorage.getVoteTimesByProperty(
					property,
					{from: voteTimes}
				)
				expect(result.toNumber()).to.be.equal(3)
			})
		})
	}
)
