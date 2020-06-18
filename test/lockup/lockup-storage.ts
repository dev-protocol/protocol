import {DevProtocolInstance} from '../test-lib/instance'
import {validateAddressErrorMessage} from '../test-lib/utils/error'

contract(
	'LockupStorageStorageTest',
	([deployer, lockup, dummyLockup, sender, property, user]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateLockupStorage()
			await dev.addressConfig.setLockup(lockup, {from: deployer})
		})
		describe('LockupStorageStorage; setAllValue, getAllValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getAllValue({from: lockup})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setAllValue(3, {from: lockup})
				const result = await dev.lockupStorage.getAllValue({from: lockup})
				expect(result.toNumber()).to.be.equal(3)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setAllValue(3, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setValue, getValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getValue(property, sender, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setValue(property, sender, 3, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getValue(property, sender, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(3)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setValue(property, sender, 3, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setPropertyValue, getPropertyValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getPropertyValue(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setPropertyValue(property, 30, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getPropertyValue(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setPropertyValue(property, 30, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setWithdrawalStatus, getWithdrawalStatus', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getWithdrawalStatus(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setWithdrawalStatus(property, user, 300, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getWithdrawalStatus(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(300)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setWithdrawalStatus(property, user, 30, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setInterestPrice, getInterestPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getInterestPrice(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setInterestPrice(property, 3000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getInterestPrice(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(3000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setInterestPrice(property, 3000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastInterestPrice, getLastInterestPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastInterestPrice(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastInterestPrice(property, user, 30000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastInterestPrice(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(30000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastInterestPrice(property, user, 30000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setPendingInterestWithdrawal, getPendingInterestWithdrawal', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getPendingInterestWithdrawal(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setPendingInterestWithdrawal(
					property,
					user,
					300000,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getPendingInterestWithdrawal(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(300000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setPendingInterestWithdrawal(property, user, 300000, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastBlockNumber, getLastBlockNumber', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastBlockNumber(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastBlockNumber(property, 30000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastBlockNumber(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastBlockNumber(property, 30000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastMaxRewardsPrice, getLastMaxRewardsPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastMaxRewardsPrice({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastMaxRewardsPrice(300000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastMaxRewardsPrice({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(300000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastMaxRewardsPrice(300000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastSameRewardsPriceBlock, getLastSameRewardsPriceBlock', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastSameRewardsPriceBlock({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastSameRewardsPriceBlock(3000000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastSameRewardsPriceBlock({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(3000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastSameRewardsPriceBlock(3000000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setCumulativeGlobalRewards, getCumulativeGlobalRewards', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getCumulativeGlobalRewards({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setCumulativeGlobalRewards(30000000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getCumulativeGlobalRewards({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setCumulativeGlobalRewards(30000000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastCumulativeGlobalInterestPrice, getLastCumulativeGlobalInterestPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastCumulativeGlobalInterestPrice(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastCumulativeGlobalInterestPrice(
					property,
					user,
					300000000,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getLastCumulativeGlobalInterestPrice(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(300000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastCumulativeGlobalInterestPrice(property, user, 300000000, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
