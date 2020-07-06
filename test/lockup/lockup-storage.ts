import {LockupStorageTestInstance} from '../../types/truffle-contracts'
import {toBigNumber} from '../test-lib/utils/common'

contract('LockupStorageStorageTest', ([property, user]) => {
	let storage: LockupStorageTestInstance
	before(async () => {
		storage = await artifacts.require('LockupStorageTest').new()
		await storage.createStorage()
	})
	describe('LockupStorageStorage; setAllValue, getAllValue', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageAllValue()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageAllValueTest(3)
			const result = await storage.getStorageAllValue()
			expect(result.toNumber()).to.be.equal(3)
		})
	})
	describe('LockupStorageStorage; setValue, getValue', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageValue(property, user)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageValueTest(property, user, 30)
			const result = await storage.getStorageValue(property, user)
			expect(result.toNumber()).to.be.equal(30)
		})
	})
	describe('LockupStorageStorage; setPropertyValue, getPropertyValue', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStoragePropertyValue(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStoragePropertyValueTest(property, 300)
			const result = await storage.getStoragePropertyValue(property)
			expect(result.toNumber()).to.be.equal(300)
		})
	})
	describe('LockupStorageStorage; setWithdrawalStatus, getWithdrawalStatus', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageWithdrawalStatus(property, user)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageWithdrawalStatusTest(property, user, 3000)
			const result = await storage.getStorageWithdrawalStatus(property, user)
			expect(result.toNumber()).to.be.equal(3000)
		})
	})
	describe('LockupStorageStorage; setInterestPrice, getInterestPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageInterestPrice(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageInterestPriceTest(property, 30000)
			const result = await storage.getStorageInterestPrice(property)
			expect(result.toNumber()).to.be.equal(30000)
		})
	})
	describe('LockupStorageStorage; setLastInterestPrice, getLastInterestPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastInterestPrice(property, user)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastInterestPriceTest(property, user, 300000)
			const result = await storage.getStorageLastInterestPrice(property, user)
			expect(result.toNumber()).to.be.equal(300000)
		})
	})
	describe('LockupStorageStorage; setPendingInterestWithdrawal, getPendingInterestWithdrawal', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStoragePendingInterestWithdrawal(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStoragePendingInterestWithdrawalTest(
				property,
				user,
				3000000
			)
			const result = await storage.getStoragePendingInterestWithdrawal(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(3000000)
		})
	})
	describe('LockupStorageStorage; setLastBlockNumber, getLastBlockNumber', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastBlockNumber(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastBlockNumberTest(property, 30000000)
			const result = await storage.getStorageLastBlockNumber(property)
			expect(result.toNumber()).to.be.equal(30000000)
		})
	})
	describe('LockupStorageStorage; setLastSameRewardsAmountAndBlock, getLastSameRewardsAmountAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastSameRewardsAmountAndBlock()
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const amount = toBigNumber(
				'99999999999999999999.999999999999999999'
			).times(1e18)
			const block = '888888888888888888'

			await storage.setStorageLastSameRewardsAmountAndBlockTest(amount, block)
			const result = await storage.getStorageLastSameRewardsAmountAndBlock()
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(amount.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorageStorage; setCumulativeGlobalRewards, getCumulativeGlobalRewards', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageCumulativeGlobalRewards()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageCumulativeGlobalRewardsTest(3000000000)
			const result = await storage.getStorageCumulativeGlobalRewards()
			expect(result.toNumber()).to.be.equal(3000000000)
		})
	})
	describe('LockupStorageStorage; setLastCumulativeGlobalReward, getLastCumulativeGlobalReward', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastCumulativeGlobalReward(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativeGlobalRewardTest(
				property,
				user,
				30000000000
			)
			const result = await storage.getStorageLastCumulativeGlobalReward(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(30000000000)
		})
	})
	describe('LockupStorageStorage; setCumulativeLockedUpUnitAndBlock, getCumulativeLockedUpUnitAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageCumulativeLockedUpUnitAndBlock(
				property
			)
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const unit = toBigNumber('99999999999999999999.999999999999999999').times(
				1e18
			)
			const block = '888888888888888888'
			await storage.setStorageCumulativeLockedUpUnitAndBlockTest(
				property,
				unit,
				block
			)
			const result = await storage.getStorageCumulativeLockedUpUnitAndBlock(
				property
			)
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(unit.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorageStorage; setCumulativeLockedUpValue, getCumulativeLockedUpValue', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageCumulativeLockedUpValue(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageCumulativeLockedUpValueTest(
				property,
				300000000000
			)
			const result = await storage.getStorageCumulativeLockedUpValue(property)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
})
