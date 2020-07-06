import {DevProtocolInstance} from '../test-lib/instance'
import {EternalStorageInstance} from '../../types/truffle-contracts'
import {toBigNumber, keccak256} from '../test-lib/utils/common'

contract('LockupStorageStorageTest', ([deployer, property, user]) => {
	const dev = new DevProtocolInstance(deployer)
	let storage: EternalStorageInstance
	before(async () => {
		await dev.generateAddressConfig()
		await dev.generateLockupStorage()
		await dev.lockupStorage.changeOwner(deployer)
		storage = await dev.lockupStorage
			.getStorageAddress()
			.then((x) => artifacts.require('EternalStorage').at(x))
	})
	describe('LockupStorageStorage; setAllValue, getAllValue', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageAllValue()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_allValue'), 3)
			const result = await dev.lockupStorage.getStorageAllValue()
			expect(result.toNumber()).to.be.equal(3)
		})
	})
	describe('LockupStorageStorage; setValue, getValue', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageValue(property, user)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_value', property, user), 30)
			const result = await dev.lockupStorage.getStorageValue(property, user)
			expect(result.toNumber()).to.be.equal(30)
		})
	})
	describe('LockupStorageStorage; setPropertyValue, getPropertyValue', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStoragePropertyValue(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_propertyValue', property), 300)
			const result = await dev.lockupStorage.getStoragePropertyValue(property)
			expect(result.toNumber()).to.be.equal(300)
		})
	})
	describe('LockupStorageStorage; setWithdrawalStatus, getWithdrawalStatus', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageWithdrawalStatus(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(
				keccak256('_withdrawalStatus', property, user),
				3000
			)
			const result = await dev.lockupStorage.getStorageWithdrawalStatus(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(3000)
		})
	})
	describe('LockupStorageStorage; setInterestPrice, getInterestPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageInterestPrice(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_interestTotals', property), 30000)
			const result = await dev.lockupStorage.getStorageInterestPrice(property)
			expect(result.toNumber()).to.be.equal(30000)
		})
	})
	describe('LockupStorageStorage; setLastInterestPrice, getLastInterestPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageLastInterestPrice(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(
				keccak256('_lastLastInterestPrice', property, user),
				300000
			)
			const result = await dev.lockupStorage.getStorageLastInterestPrice(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(300000)
		})
	})
	describe('LockupStorageStorage; setPendingInterestWithdrawal, getPendingInterestWithdrawal', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStoragePendingInterestWithdrawal(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(
				keccak256('_pendingInterestWithdrawal', property, user),
				3000000
			)
			const result = await dev.lockupStorage.getStoragePendingInterestWithdrawal(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(3000000)
		})
	})
	describe('LockupStorageStorage; setLastBlockNumber, getLastBlockNumber', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageLastBlockNumber(property)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_lastBlockNumber', property), 30000000)
			const result = await dev.lockupStorage.getStorageLastBlockNumber(property)
			expect(result.toNumber()).to.be.equal(30000000)
		})
	})
	describe('LockupStorageStorage; setLastSameRewardsAmountAndBlock, getLastSameRewardsAmountAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await dev.lockupStorage.getStorageLastSameRewardsAmountAndBlock()
			expect(result[0].toNumber()).to.be.equal(0)
			expect(result[1].toNumber()).to.be.equal(0)
		})
		it('Save two values combine to one value.', async () => {
			const amount = toBigNumber(
				'99999999999999999999.999999999999999999'
			).times(1e18)
			const block = '888888888888888888'

			const tmp = amount.times(await dev.lockupStorage.basis()).plus(block)

			await storage.setUint(keccak256('_LastSameRewardsAmountAndBlock'), tmp)

			const result = await dev.lockupStorage.getStorageLastSameRewardsAmountAndBlock()
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(amount.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorageStorage; setCumulativeGlobalRewards, getCumulativeGlobalRewards', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageCumulativeGlobalRewards()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(keccak256('_cumulativeGlobalRewards'), 3000000000)
			const result = await dev.lockupStorage.getStorageCumulativeGlobalRewards()
			expect(result.toNumber()).to.be.equal(3000000000)
		})
	})
	describe('LockupStorageStorage; setLastCumulativeGlobalReward, getLastCumulativeGlobalReward', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageLastCumulativeGlobalReward(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(
				keccak256('_LastCumulativeGlobalReward', property, user),
				30000000000
			)
			const result = await dev.lockupStorage.getStorageLastCumulativeGlobalReward(
				property,
				user
			)
			expect(result.toNumber()).to.be.equal(30000000000)
		})
	})
	describe('LockupStorageStorage; setCumulativeLockedUpUnitAndBlock, getCumulativeLockedUpUnitAndBlock', () => {
		it('Initial value is 0 and 0.', async () => {
			const result = await dev.lockupStorage.getStorageCumulativeLockedUpUnitAndBlock(
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
			const tmp = unit.times(await dev.lockupStorage.basis()).plus(block)
			await storage.setUint(
				keccak256('_cumulativeLockedUpUnitAndBlock', property),
				tmp
			)
			const result = await dev.lockupStorage.getStorageCumulativeLockedUpUnitAndBlock(
				property
			)
			expect(toBigNumber(result[0]).toFixed()).to.be.equal(unit.toFixed())
			expect(toBigNumber(result[1]).toFixed()).to.be.equal(block)
		})
	})
	describe('LockupStorageStorage; setCumulativeLockedUpValue, getCumulativeLockedUpValue', () => {
		it('Initial value is 0.', async () => {
			const result = await dev.lockupStorage.getStorageCumulativeLockedUpValue(
				property
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setUint(
				keccak256('_cumulativeLockedUpValue', property),
				300000000000
			)
			const result = await dev.lockupStorage.getStorageCumulativeLockedUpValue(
				property
			)
			expect(result.toNumber()).to.be.equal(300000000000)
		})
	})
})
