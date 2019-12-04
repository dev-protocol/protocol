contract('VoteTimesTest', ([deployer, property1, property2]) => {
	const voteTimesTestContract = artifacts.require('VoteTimes')
	describe('VoteTimes; addVoteTimes, addVoteTimesByProperty', () => {
		let voteTimes: any
		beforeEach(async () => {
			voteTimes = await voteTimesTestContract.new({from: deployer})
			await voteTimes.createStorage()
			await voteTimes.addVoteCount()
			await voteTimes.addVoteCount()
			await voteTimes.addVoteTimesByProperty(property1)
		})
		it('If the vote was held twice, but the vote was held only once, the number of abstentions will be 1.', async () => {
			const result = await voteTimes.getAbstentionTimes(property1)
			expect(result.toNumber()).to.be.equal(1)
		})
		it('Storage information can be taken over.', async () => {
			const storageAddress = await voteTimes.getStorageAddress()
			const newVoteTimes = await voteTimesTestContract.new({
				from: deployer
			})
			await newVoteTimes.setStorage(storageAddress)
			await voteTimes.changeOwner(newVoteTimes.address)
			await newVoteTimes.addVoteCount()
			const result = await newVoteTimes.getAbstentionTimes(property1)
			expect(result.toNumber()).to.be.equal(2)
		})
		it('When reset, the number of abstentions becomes 0.', async () => {
			await voteTimes.resetVoteTimesByProperty(property1)
			const result = await voteTimes.getAbstentionTimes(property1)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('If the number of votes is 0, the number of votes cast is the number of abstentions.', async () => {
			const result = await voteTimes.getAbstentionTimes(property2)
			expect(result.toNumber()).to.be.equal(2)
		})
	})
})
