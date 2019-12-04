contract('AddressConfigTest', ([deployer, other, setAddress1, setAddress2]) => {
	const addressConfigTestContract = artifacts.require('AddressConfig')
	describe('AddressConfig; getter/setter', () => {
		let addressConfigTest: any
		beforeEach(async () => {
			addressConfigTest = await addressConfigTestContract.new({
				from: deployer
			})
		})
		it('Value set by owner(allocator)', async () => {
			await addressConfigTest.setAllocator(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.allocator()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(allocator)', async () => {
			const result = await addressConfigTest
				.setAllocator(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(marketFactory)', async () => {
			await addressConfigTest.setMarketFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.marketFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(marketFactory)', async () => {
			const result = await addressConfigTest
				.setMarketFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(marketGroup)', async () => {
			await addressConfigTest.setMarketGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.marketGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(marketGroup)', async () => {
			const result = await addressConfigTest
				.setMarketGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(propertyFactory)', async () => {
			await addressConfigTest.setPropertyFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.propertyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by onon-wner(propertyFactory)', async () => {
			const result = await addressConfigTest
				.setPropertyFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(propertyGroup)', async () => {
			await addressConfigTest.setPropertyGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.propertyGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(propertyGroup)', async () => {
			const result = await addressConfigTest
				.setPropertyGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(metricsGroup)', async () => {
			await addressConfigTest.setMetricsGroup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.metricsGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(metricsGroup)', async () => {
			const result = await addressConfigTest
				.setMetricsGroup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(policyFactory)', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.policyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(policyFactory)', async () => {
			const result = await addressConfigTest
				.setPolicyFactory(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(token)', async () => {
			await addressConfigTest.setToken(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.token()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(token)', async () => {
			const result = await addressConfigTest
				.setToken(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(lockup)', async () => {
			await addressConfigTest.setLockup(setAddress1, {from: deployer})
			const addresss = await addressConfigTest.lockup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(lockup)', async () => {
			const result = await addressConfigTest
				.setLockup(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(voteTimes)', async () => {
			await addressConfigTest.setVoteTimes(setAddress1, {
				from: deployer
			})
			const addresss = await addressConfigTest.voteTimes()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(voteTimes)', async () => {
			const result = await addressConfigTest
				.setVoteTimes(setAddress1, {
					from: other
				})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
			)
		})
		it('Value set by owner(lockupValue)', async () => {})
		it('Value set by non-owner(lockupValue)', async () => {})
		it('Value set by owner(lockupPropertyValue)', async () => {})
		it('Value set by non-owner(lockupPropertyValue)', async () => {})
		it('Value set by owner(lockupWithdrawalStatus)', async () => {})
		it('Value set by non-owner(lockupWithdrawalStatus)', async () => {})
		it('Value set by owner(policyGroup)', async () => {})
		it('Value set by non-owner(policyGroup)', async () => {})
	})
	describe('AddressConfig; setPolicy', () => {
		let addressConfigTest: any
		beforeEach(async () => {
			addressConfigTest = await addressConfigTestContract.new({
				from: deployer
			})
		})
		it('Value set by PolicyFactory', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			await addressConfigTest.setPolicy(setAddress2, {from: setAddress1})
			const addresss = await addressConfigTest.policy()
			expect(addresss).to.be.equal(setAddress2)
		})
		it('Value set by owner', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const result = await addressConfigTest
				.setPolicy(setAddress2, {from: deployer})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only policy factory contract -- Reason given: only policy factory contract.'
			)
		})
		it('Value set by non-owner', async () => {
			await addressConfigTest.setPolicyFactory(setAddress1, {from: deployer})
			const result = await addressConfigTest
				.setPolicy(setAddress2, {from: other})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert only policy factory contract -- Reason given: only policy factory contract.'
			)
		})
	})
})
