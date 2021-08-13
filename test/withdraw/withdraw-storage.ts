import { WithdrawStorageTestInstance } from '../../types/truffle-contracts'

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
	describe('WithdrawStorageTest; setStorageLastWithdrawnRewardCap, getStorageLastWithdrawnRewardCap', () => {
		it('Initial value is 0.', async () => {
			const result = await storage.getStorageLastWithdrawnRewardCap(
				property,
				user,
				{
					from: withdraw,
				}
			)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageLastWithdrawnRewardCapTest(
				property,
				user,
				5000000,
				{
					from: withdraw,
				}
			)
			const result = await storage.getStorageLastWithdrawnRewardCap(
				property,
				user,
				{
					from: withdraw,
				}
			)
			expect(result.toNumber()).to.be.equal(5000000)
		})
	})
})
