import {DevProtocolInstance} from '../test-lib/instance'
import {validateAddressErrorMessage} from '../test-lib/utils/error'
import {toBigNumber} from '../test-lib/utils/common'

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
				await dev.lockupStorage.setValue(property, sender, 30, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getValue(property, sender, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setValue(property, sender, 30, {from: dummyLockup})
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
				await dev.lockupStorage.setPropertyValue(property, 300, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getPropertyValue(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(300)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setPropertyValue(property, 300, {from: dummyLockup})
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
				await dev.lockupStorage.setWithdrawalStatus(property, user, 3000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getWithdrawalStatus(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(3000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setWithdrawalStatus(property, user, 3000, {from: dummyLockup})
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
				await dev.lockupStorage.setInterestPrice(property, 30000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getInterestPrice(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setInterestPrice(property, 30000, {from: dummyLockup})
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
				await dev.lockupStorage.setLastInterestPrice(property, user, 300000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastInterestPrice(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(300000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastInterestPrice(property, user, 300000, {from: dummyLockup})
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
					3000000,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getPendingInterestWithdrawal(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(3000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setPendingInterestWithdrawal(property, user, 3000000, {
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
				await dev.lockupStorage.setLastBlockNumber(property, 30000000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getLastBlockNumber(property, {
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(30000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastBlockNumber(property, 30000000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastSameRewardsAmountAndBlock, getLastSameRewardsAmountAndBlock', () => {
			it('Initial value is 0 and 0.', async () => {
				const result = await dev.lockupStorage.getLastSameRewardsAmountAndBlock(
					{
						from: lockup,
					}
				)
				expect(result[0].toNumber()).to.be.equal(0)
				expect(result[1].toNumber()).to.be.equal(0)
			})
			it('Save two values combine to one value.', async () => {
				const amount = toBigNumber(
					'99999999999999999999.999999999999999999'
				).times(1e18)
				const block = '888888888888888888'
				await dev.lockupStorage.setLastSameRewardsAmountAndBlock(
					amount,
					block,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getLastSameRewardsAmountAndBlock(
					{
						from: lockup,
					}
				)
				expect(toBigNumber(result[0]).toFixed()).to.be.equal(amount.toFixed())
				expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastSameRewardsAmountAndBlock(1, 1, {
						from: dummyLockup,
					})
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
				await dev.lockupStorage.setCumulativeGlobalRewards(3000000000, {
					from: lockup,
				})
				const result = await dev.lockupStorage.getCumulativeGlobalRewards({
					from: lockup,
				})
				expect(result.toNumber()).to.be.equal(3000000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setCumulativeGlobalRewards(3000000000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setLastCumulativeGlobalInterest, getLastCumulativeGlobalInterest', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getLastCumulativeGlobalInterest(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setLastCumulativeGlobalInterest(
					property,
					user,
					30000000000,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getLastCumulativeGlobalInterest(
					property,
					user,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(30000000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setLastCumulativeGlobalInterest(property, user, 30000000000, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setCumulativeLockedUpUnitAndBlock, getCumulativeLockedUpUnitAndBlock', () => {
			it('Initial value is 0 and 0.', async () => {
				const result = await dev.lockupStorage.getCumulativeLockedUpUnitAndBlock(
					property,
					{
						from: lockup,
					}
				)
				expect(result[0].toNumber()).to.be.equal(0)
				expect(result[1].toNumber()).to.be.equal(0)
			})
			it('Save two values combine to one value.', async () => {
				const unit = toBigNumber(
					'99999999999999999999.999999999999999999'
				).times(1e18)
				const block = '888888888888888888'
				await dev.lockupStorage.setCumulativeLockedUpUnitAndBlock(
					property,
					unit,
					block,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getCumulativeLockedUpUnitAndBlock(
					property,
					{
						from: lockup,
					}
				)
				expect(toBigNumber(result[0]).toFixed()).to.be.equal(unit.toFixed())
				expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setCumulativeLockedUpUnitAndBlock(property, 1, 1, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('LockupStorageStorage; setCumulativeLockedUpValue, getCumulativeLockedUpValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getCumulativeLockedUpValue(
					property,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setCumulativeLockedUpValue(
					property,
					300000000000,
					{
						from: lockup,
					}
				)
				const result = await dev.lockupStorage.getCumulativeLockedUpValue(
					property,
					{from: lockup}
				)
				expect(result.toNumber()).to.be.equal(300000000000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setCumulativeLockedUpValue(property, 300000000000, {
						from: dummyLockup,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
