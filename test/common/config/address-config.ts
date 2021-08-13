import { DevProtocolInstance } from '../../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../../test-lib/utils/error'

contract('AddressConfigTest', ([deployer, other, setAddress1, setAddress2]) => {
	const dev = new DevProtocolInstance(deployer)
	describe('AddressConfig; getter/setter', () => {
		before(async () => {
			await dev.generateAddressConfig()
		})
		it('Value set by owner(allocator)', async () => {
			await dev.addressConfig.setAllocator(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.allocator()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(allocator)', async () => {
			const result = await dev.addressConfig
				.setAllocator(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(allocatorStorage)', async () => {
			await dev.addressConfig.setAllocatorStorage(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.allocatorStorage()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(allocatorStorage)', async () => {
			const result = await dev.addressConfig
				.setAllocatorStorage(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(withdraw)', async () => {
			await dev.addressConfig.setWithdraw(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.withdraw()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(withdraw)', async () => {
			const result = await dev.addressConfig
				.setWithdraw(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(withdrawStorage)', async () => {
			await dev.addressConfig.setWithdrawStorage(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.withdrawStorage()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(withdrawStorage)', async () => {
			const result = await dev.addressConfig
				.setWithdrawStorage(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(marketFactory)', async () => {
			await dev.addressConfig.setMarketFactory(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.marketFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(marketFactory)', async () => {
			const result = await dev.addressConfig
				.setMarketFactory(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(marketGroup)', async () => {
			await dev.addressConfig.setMarketGroup(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.marketGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(marketGroup)', async () => {
			const result = await dev.addressConfig
				.setMarketGroup(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(propertyFactory)', async () => {
			await dev.addressConfig.setPropertyFactory(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.propertyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by onon-wner(propertyFactory)', async () => {
			const result = await dev.addressConfig
				.setPropertyFactory(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(propertyGroup)', async () => {
			await dev.addressConfig.setPropertyGroup(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.propertyGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(propertyGroup)', async () => {
			const result = await dev.addressConfig
				.setPropertyGroup(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(metricsFactory)', async () => {
			await dev.addressConfig.setMetricsFactory(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.metricsFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(metricsFactory)', async () => {
			const result = await dev.addressConfig
				.setMetricsFactory(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(metricsGroup)', async () => {
			await dev.addressConfig.setMetricsGroup(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.metricsGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(metricsGroup)', async () => {
			const result = await dev.addressConfig
				.setMetricsGroup(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(policyFactory)', async () => {
			await dev.addressConfig.setPolicyFactory(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.policyFactory()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(policyFactory)', async () => {
			const result = await dev.addressConfig
				.setPolicyFactory(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(policyGroup)', async () => {
			await dev.addressConfig.setPolicyGroup(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.policyGroup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(policyGroup)', async () => {
			const result = await dev.addressConfig
				.setPolicyGroup(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(policySet)', async () => {
			await dev.addressConfig.setPolicySet(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.policySet()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(policySet)', async () => {
			const result = await dev.addressConfig
				.setPolicySet(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(token)', async () => {
			await dev.addressConfig.setToken(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.token()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(token)', async () => {
			const result = await dev.addressConfig
				.setToken(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(lockup)', async () => {
			await dev.addressConfig.setLockup(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.lockup()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(lockup)', async () => {
			const result = await dev.addressConfig
				.setLockup(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(lockupStorage)', async () => {
			await dev.addressConfig.setLockupStorage(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.lockupStorage()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(lockupStorage)', async () => {
			const result = await dev.addressConfig
				.setLockupStorage(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(voteTimes)', async () => {
			await dev.addressConfig.setVoteTimes(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.voteTimes()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(voteTimes)', async () => {
			const result = await dev.addressConfig
				.setVoteTimes(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(voteTimesStorage)', async () => {
			await dev.addressConfig.setVoteTimesStorage(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.voteTimesStorage()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(voteTimesStorage)', async () => {
			const result = await dev.addressConfig
				.setVoteTimesStorage(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(voteCounter)', async () => {
			await dev.addressConfig.setVoteCounter(setAddress1, { from: deployer })
			const addresss = await dev.addressConfig.voteCounter()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(voteCounter)', async () => {
			const result = await dev.addressConfig
				.setVoteCounter(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
		it('Value set by owner(voteCounterStorage)', async () => {
			await dev.addressConfig.setVoteCounterStorage(setAddress1, {
				from: deployer,
			})
			const addresss = await dev.addressConfig.voteCounterStorage()
			expect(addresss).to.be.equal(setAddress1)
		})
		it('Value set by non-owner(voteCounterStorage)', async () => {
			const result = await dev.addressConfig
				.setVoteCounterStorage(setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
	})
	describe('AddressConfig; setPolicy', () => {
		before(async () => {
			await dev.generateAddressConfig()
		})
		it('Value set by PolicyFactory', async () => {
			await dev.addressConfig.setPolicyFactory(setAddress1, { from: deployer })
			await dev.addressConfig.setPolicy(setAddress2, { from: setAddress1 })
			const addresss = await dev.addressConfig.policy()
			expect(addresss).to.be.equal(setAddress2)
		})
		it('Value set by owner', async () => {
			await dev.addressConfig.setPolicyFactory(setAddress1, { from: deployer })
			const result = await dev.addressConfig
				.setPolicy(setAddress2, { from: deployer })
				.catch((err: Error) => err)
			validateAddressErrorMessage(result)
		})
		it('Value set by non-owner', async () => {
			await dev.addressConfig.setPolicyFactory(setAddress1, { from: deployer })
			const result = await dev.addressConfig
				.setPolicy(setAddress2, { from: other })
				.catch((err: Error) => err)
			validateAddressErrorMessage(result)
		})
	})
})
