contract('AddressConfigTest', ([deployer, other, setAddress1, setAddress2]) => {
	const addressConfigTestContract = artifacts.require('config/AddressConfig')
	describe('only owner get/set', () => {
		var addressConfigTest: any
		beforeEach(async () => {
			addressConfigTest = await addressConfigTestContract.new({
				from: deployer
			})
		})
		it('allocator normal', async () => {
			await addressConfigTest.setAllocator(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.allocator()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('allocator only owner', async () => {
			const result = await addressConfigTest
				.setAllocator(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('marketFactory normal', async () => {
			await addressConfigTest.setMarketFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.marketFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('marketFactory only owner', async () => {
			const result = await addressConfigTest
				.setMarketFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('marketGroup normal', async () => {
			await addressConfigTest.setMarketGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.marketGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('marketGroup only owner', async () => {
			const result = await addressConfigTest
				.setMarketGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('propertyFactory normal', async () => {
			await addressConfigTest.setPropertyFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.propertyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('propertyFactory only owner', async () => {
			const result = await addressConfigTest
				.setPropertyFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('propertyGroup normal', async () => {
			await addressConfigTest.setPropertyGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.propertyGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('propertyFactory only owner', async () => {
			const result = await addressConfigTest
				.setPropertyGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('metricsGroup normal', async () => {
			await addressConfigTest.setMetricsGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.metricsGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('metricsGroup only owner', async () => {
			const result = await addressConfigTest
				.setMetricsGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('policyFactory normal', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.policyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('policyFactory only owner', async () => {
			const result = await addressConfigTest
				.setPolicyFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('token normal', async () => {
			await addressConfigTest.setToken(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.token()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('token only owner', async () => {
			const result = await addressConfigTest
				.setToken(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('lockup normal', async () => {
			await addressConfigTest.setLockup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.lockup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('lockup only owner', async () => {
			const result = await addressConfigTest
				.setLockup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('policyVoteCounter normal', async () => {
			await addressConfigTest.setPolicyVoteCounter(setAddress1, {
				from: deployer
			})
			const addresss = await addressConfigTest.policyVoteCounter()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('policyVoteCounter only owner', async () => {
			const result = await addressConfigTest
				.setPolicyVoteCounter(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
	})
	describe('only policyFactory get/set', () => {
		var addressConfigTest: any
		beforeEach(async () => {
			addressConfigTest = await addressConfigTestContract.new({
				from: deployer
			})
		})
		it('policy normal', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			await addressConfigTest.setPolicy(setAddress2, {from: setAddress1})
			const addresss = await addressConfigTest.policy()
			expect(addresss).to.be.equal(setAddress2)
		})
		it('policy set by owner', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const result = await addressConfigTest
				.setPolicy(setAddress2, {from: deployer})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only policy factory contract. -- Reason given: only policy factory contract..'
			)
		})
		it('policy set by other', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const result = await addressConfigTest
				.setPolicy(setAddress2, {from: other})
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only policy factory contract. -- Reason given: only policy factory contract..'
			)
		})
	})
})
