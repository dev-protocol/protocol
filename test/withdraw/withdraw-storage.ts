import {WithdrawStorageTestInstance} from '../../types/truffle-contracts'

contract('WithdrawStorageTest', ([withdraw, property, user]) => {
	let storage: WithdrawStorageTestInstance
	before(async () => {
		storage = await artifacts.require('WithdrawStorageTest').new()
		await storage.createStorage()
	})
	describe('WithdrawStorageTest; setRewardsAmount, getRewardsAmount', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getRewardsAmount(property, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setRewardsAmountTest(property, 5, {
				from: withdraw,
			})
			const result = await storage.getRewardsAmount(property, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(5)
		})
	})
	describe('WithdrawStorageTest; setCumulativePrice, getCumulativePrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getCumulativePrice(property, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setCumulativePriceTest(property, 50, {
				from: withdraw,
			})
			const result = await storage.getCumulativePrice(property, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(50)
		})
	})
	describe('WithdrawStorageTest; setWithdrawalLimitTotal, getWithdrawalLimitTotal', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getWithdrawalLimitTotal(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setWithdrawalLimitTotalTest(property, user, 500, {
				from: withdraw,
			})
			const result = await storage.getWithdrawalLimitTotal(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(500)
		})
	})
	describe('WithdrawStorageTest; setWithdrawalLimitBalance, getWithdrawalLimitBalance', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getWithdrawalLimitBalance(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setWithdrawalLimitBalanceTest(property, user, 5000, {
				from: withdraw,
			})
			const result = await storage.getWithdrawalLimitBalance(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(5000)
		})
	})
	describe('WithdrawStorageTest; setLastWithdrawalPrice, getLastWithdrawalPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getLastWithdrawalPrice(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setLastWithdrawalPriceTest(property, user, 50000, {
				from: withdraw,
			})
			const result = await storage.getLastWithdrawalPrice(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(50000)
		})
	})
	describe('WithdrawStorageTest; setPendingWithdrawal, getPendingWithdrawal', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getPendingWithdrawal(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setPendingWithdrawalTest(property, user, 500000, {
				from: withdraw,
			})
			const result = await storage.getPendingWithdrawal(property, user, {
				from: withdraw,
			})
			expect(result.toNumber()).to.be.equal(500000)
		})
	})
	describe('WithdrawStorageTest; setLastCumulativeGlobalHoldersPrice, getLastCumulativeGlobalHoldersPrice', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getLastCumulativeGlobalHoldersPrice(
				property,
				user,
				{
					from: withdraw,
				}
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setLastCumulativeGlobalHoldersPriceTest(
				property,
				user,
				50000000,
				{
					from: withdraw,
				}
			)
			const result = await storage.getLastCumulativeGlobalHoldersPrice(
				property,
				user,
				{
					from: withdraw,
				}
			)
			expect(result.toNumber()).to.be.equal(50000000)
		})
	})
})
