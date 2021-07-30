contract('Policy', ([account1, account2]) => {
	const policyContract = artifacts.require('PolicyTest1')
	let policy: any
	beforeEach(async () => {
		policy = await policyContract.new()
	})
	describe('PolicyTest1; rewards', () => {
		it('Returns the total number of mint per block when the total number of lockups and the total number of assets is passed', async () => {
			const result = await policy.rewards(45, 76)
			expect(result.toNumber()).to.be.equal(121)
		})
	})
	describe('PolicyTest1; holdersShare', () => {
		it('Returns the reward that the Property holders can receive when the reward per Property and the number of locked-ups is passed', async () => {
			const result = await policy.holdersShare(10000, 700)
			expect(result.toNumber()).to.be.equal(9346)
		})
	})
	describe('PolicyTest1; authenticationFee', () => {
		it('Returns the authentication fee when the total number of assets and the number of lockups is passed', async () => {
			const result = await policy.authenticationFee(1000, 100)
			expect(result.toNumber()).to.be.equal(1099)
		})
	})
	describe('PolicyTest1; marketVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Market', async () => {
			const result = await policy.marketVotingBlocks()
			expect(result.toNumber()).to.be.equal(10)
		})
	})
	describe('PolicyTest1; policyVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Policy', async () => {
			const result = await policy.policyVotingBlocks()
			expect(result.toNumber()).to.be.equal(20)
		})
	})
	describe('PolicyTest1; shareOfTreasury', () => {
		it('Returns the number of the share treasury', async () => {
			const result = await policy.shareOfTreasury(100)
			expect(result.toNumber()).to.be.equal(5)
		})
	})
	describe('PolicyTest1; setTreasury', () => {
		it('get the set treasury address', async () => {
			await policy.setTreasury(account1)
			const tmp: string = await policy.treasury()
			expect(tmp).to.be.equal(account1)
		})
	})
	describe('PolicyTest1; setCapSetter', () => {
		it('get the set cap setter address', async () => {
			await policy.setCapSetter(account2)
			const tmp: string = await policy.capSetter()
			expect(tmp).to.be.equal(account2)
		})
	})
})
