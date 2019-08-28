contract('Market', ([deployer, u1, u2]) => {
	const marketContract = artifacts.require('Market')

	describe('schema', () => {
		it('Get Schema of mapped Behavior Contract')
	})

	describe('authenticate', () => {
		it('Proxy to mapped Behavior Contract')

		it(
			'Should fail to run when sent from other than the owner of Property Contract'
		)

		it(
			'Should fail to the transaction if the second argument as ID and a Metrics Contract exists with the same ID.'
		)
	})

	describe('authenticatedCallback', () => {
		it('Create a new Metrics Contract')

		it(
			'Market Contract address and Property Contract address are mapped to the created Metrics Contract'
		)

		it(
			'Should fail to create a new Metrics Contract when sent from non-Behavior Contract'
		)
	})

	describe('calculate', () => {
		it('Proxy to mapped Behavior Contract')
	})

	describe('vote', () => {
		it('Vote as a positive vote, votes are the number of sent DEVs', async () => {
			const market = await marketContract.new(u1, false, {from: deployer})

			await market.vote(10, {from: u2})
			const firstTotalVotes = await market.getTotalVotes({from: u2})

			expect(firstTotalVotes.toNumber()).to.be.equal(10)

			await market.vote(20, {from: u2})
			const secondTotalVotes = await market.getTotalVotes({from: u2})
			expect(secondTotalVotes.toNumber()).to.be.equal(30)
		})

		it(
			'When total votes for more than 10% of the total supply of DEV are obtained, this Market Contract is enabled'
		)

		it('Should fail to vote when already determined enabled')
	})
})
