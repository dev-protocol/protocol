contract('Market', ([deployer, u1, u2]) => {
	const marketContract = artifacts.require('Market')
	const dummyDEVContract = artifacts.require('DummyDEV')

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
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000,{from: deployer})
			await dummyDEV.transfer(u2, 1000, {from: deployer})

			const market = await marketContract.new(u1, false, {from: deployer})
			await market.setDEVtokenAddress(dummyDEV.address, {from: deployer})

			await market.vote(10, {from: u2})
			const firstTotalVotes = await market.getTotalVotes({from: u2})

			expect(firstTotalVotes.toNumber()).to.be.equal(10)

			await market.vote(20, {from: u2})
			const secondTotalVotes = await market.getTotalVotes({from: u2})
			expect(secondTotalVotes.toNumber()).to.be.equal(30)
		})

		it(
			'When total votes for more than 10% of the total supply of DEV are obtained, this Market Contract is enabled', async () => {
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000,{from: deployer})
			await dummyDEV.transfer(u2, 5000, {from: deployer})

			const market = await marketContract.new(u1, false, {from: deployer})
			await market.setDEVtokenAddress(dummyDEV.address, {from: deployer})

			await market.vote(1000, {from: u2})
			const isEnable = await market.enabled({from: u1})

			expect(isEnable).to.be.true
		})

		it('Should fail to vote when already determined enabled', async () => {
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000,{from: deployer})
			await dummyDEV.transfer(u2, 1000, {from: deployer})

			const market = await marketContract.new(u1, false, {from: deployer})
			await market.setDEVtokenAddress(dummyDEV.address, {from: deployer})
			await market.activateMarket({from: deployer})

			const result = await market.vote(100, {from: u2}).catch((err: Error) => err)
			expect(result).to.instanceOf(Error)
		})

		it ('Vote decrease the number of sent DEVs from voter owned DEVs', async () => {
			const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {from: deployer})
			await dummyDEV.transfer(u1, 1000, {from: deployer})

			const market = await marketContract.new(u1, false, {from: deployer})
			await market.setDEVtokenAddress(dummyDEV.address, {from: deployer})

			await market.vote(100, {from: u1})
			const ownedDEVs = await dummyDEV.balanceOf(u1, {from: u1})

			expect(ownedDEVs.toNumber()).to.be.equal(900)
		})
	})
})
