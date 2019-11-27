contract('Policy', () => {
	const policyContract = artifacts.require('PolicyTest')
	describe('PolicyTest; rewards', () => {
		it('Returns the total number of mint per block when the total number of lockups and the total number of assets are passed', async () => {
			const policy = await policyContract.new()
			const result = await policy.rewards(45, 76)
			expect(result.toNumber()).to.be.equal(121)
		})
	})
})
