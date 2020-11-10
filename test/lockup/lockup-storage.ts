import {LockupStorageTestInstance} from '../../types/truffle-contracts'
import {toBigNumber} from '../test-lib/utils/common'

contract('LockupStorageTest', ([property, user]) => {
	let storage: LockupStorageTestInstance
	before(async () => {
		storage = await artifacts.require('LockupStorageTest').new()
		await storage.createStorage()
	})
	describe('LockupStorage; setAllValue, getAllValue', () => {
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
	describe('LockupStorage; setValue, getValue', () => {
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
	describe('LockupStorage; setInterestPrice, getInterestPrice', () => {
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
	describe('LockupStorage; setLastInterestPrice, getLastInterestPrice', () => {
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
	describe('LockupStorage; setPendingInterestWithdrawal, getPendingInterestWithdrawal', () => {
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
	describe('LockupStorage; setLastSameRewardsAmountAndBlock, getLastSameRewardsAmountAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastSameRewardsAmountAndBlock()
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const amount = toBigNumber(
				'999999999999999999999999999.999999999999999999'
			).times(1e18)
			const block = '888888888888888888'

			await storage.setStorageLastSameRewardsAmountAndBlockTest(amount, block)
			const result = await storage.getStorageLastSameRewardsAmountAndBlock()
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(amount.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorage; setCumulativeGlobalRewards, getCumulativeGlobalRewards', () => {
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
	describe('LockupStorage; setLastCumulativeGlobalReward, getLastCumulativeGlobalReward', () => {
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
	describe('LockupStorage; setCumulativeLockedUpUnitAndBlock, getCumulativeLockedUpUnitAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageCumulativeLockedUpUnitAndBlock(
				property
			)
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const unit = toBigNumber(
				'999999999999999999999999999.999999999999999999'
			).times(1e18)
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
	describe('LockupStorage; setCumulativeLockedUpValue, getCumulativeLockedUpValue', () => {
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
	describe('LockupStorage; setStorageDIP4GenesisBlock, getStorageDIP4GenesisBlock', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageDIP4GenesisBlock()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageDIP4GenesisBlockTest(300000000000)
			const result = await storage.getStorageDIP4GenesisBlock()
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastCumulativeLockedUpAndBlock, getStorageLastCumulativeLockedUpAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastCumulativeLockedUpAndBlock(
				property,
				user
			)
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const cLocked = toBigNumber(
				'999999999999999999999999999.999999999999999999'
			).times(1e18)
			const block = '888888888888888888'

			await storage.setStorageLastCumulativeLockedUpAndBlockTest(
				property,
				user,
				cLocked,
				block
			)
			const result = await storage.getStorageLastCumulativeLockedUpAndBlock(
				property,
				user
			)
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(cLocked.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorage; setStorageLastCumulativePropertyInterest, getStorageLastCumulativePropertyInterest', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastCumulativePropertyInterest(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativePropertyInterestTest(
				property,
				user,
				300000000000
			)
			const result = await storage.getStorageLastCumulativePropertyInterest(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastStakedInterestPrice, getStorageLastStakedInterestPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastStakedInterestPrice(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastStakedInterestPriceTest(
				property,
				user,
				300000000000
			)
			const result = await storage.getStorageLastStakedInterestPrice(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastStakesChangedCumulativeReward, getStorageLastStakesChangedCumulativeReward', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastStakesChangedCumulativeReward()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastStakesChangedCumulativeRewardTest(
				300000000000
			)
			const result = await storage.getStorageLastStakesChangedCumulativeReward()
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastCumulativeHoldersRewardPrice, getStorageLastCumulativeHoldersRewardPrice', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastCumulativeHoldersRewardPrice()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativeHoldersRewardPriceTest(300000000000)
			const result = await storage.getStorageLastCumulativeHoldersRewardPrice()
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastCumulativeInterestPrice, getStorageLastCumulativeInterestPrice', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastCumulativeInterestPrice()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativeInterestPriceTest(300000000000)
			const result = await storage.getStorageLastCumulativeInterestPrice()
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastCumulativeHoldersRewardAmountPerProperty, getStorageLastCumulativeHoldersRewardAmountPerProperty', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastCumulativeHoldersRewardAmountPerProperty(
				property
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativeHoldersRewardAmountPerPropertyTest(
				property,
				300000000000
			)
			const result = await storage.getStorageLastCumulativeHoldersRewardAmountPerProperty(
				property
			)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
	describe('LockupStorage; setStorageLastCumulativeHoldersRewardPricePerProperty, getStorageLastCumulativeHoldersRewardPricePerProperty', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await storage.getStorageLastCumulativeHoldersRewardPricePerProperty(
				property
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastCumulativeHoldersRewardPricePerPropertyTest(
				property,
				300000000000
			)
			const result = await storage.getStorageLastCumulativeHoldersRewardPricePerProperty(
				property
			)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
})
