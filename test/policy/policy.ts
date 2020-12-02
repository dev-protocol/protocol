contract('Policy', () => {
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
	describe('PolicyTest1; assetValue', () => {
		it('Returns the asset value when the value of index calculated by Market and the number of lockups is passed', async () => {
			const result = await policy.assetValue(858, 2345)
			expect(result.toNumber()).to.be.equal(2012010)
		})
	})
	describe('PolicyTest1; authenticationFee', () => {
		it('Returns the authentication fee when the total number of assets and the number of lockups is passed', async () => {
			const result = await policy.authenticationFee(1000, 100)
			expect(result.toNumber()).to.be.equal(1099)
		})
	})
	describe('PolicyTest1; marketApproval', () => {
		it('Returns whether the next new Market can be approved when the number of agreements and the number of protests is passed', async () => {
			const result = await policy.marketApproval(9000, 2000)
			expect(result).to.be.equal(true)
		})
	})
	describe('PolicyTest1; policyApproval', () => {
		it('Returns whether the next new Policy can be approved when the number of agreements and the number of protests is passed', async () => {
			const result = await policy.policyApproval(9000, 2000)
			expect(result).to.be.equal(true)
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
	describe('PolicyTest1; lockUpBlocks', () => {
		it('Returns the minimum number of lockup blocks.', async () => {
			const result = await policy.lockUpBlocks()
			expect(result.toNumber()).to.be.equal(1)
		})
	})
})
