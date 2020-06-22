import {DevProtocolInstance} from '../test-lib/instance'
import {validateAddressErrorMessage} from '../test-lib/utils/error'

contract(
	'WithdrawStorageTest',
	([deployer, withdraw, dummyWithdraw, property, user]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateWithdrawStorage()
			await dev.addressConfig.setWithdraw(withdraw, {from: deployer})
		})
		describe('WithdrawStorageTest; setRewardsAmount, getRewardsAmount', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getRewardsAmount(property, {
					from: withdraw,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setRewardsAmount(property, 5, {
					from: withdraw,
				})
				const result = await dev.withdrawStorage.getRewardsAmount(property, {
					from: withdraw,
				})
				expect(result.toNumber()).to.be.equal(5)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setRewardsAmount(property, 5, {from: dummyWithdraw})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setCumulativePrice, getCumulativePrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getCumulativePrice(property, {
					from: withdraw,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setCumulativePrice(property, 50, {
					from: withdraw,
				})
				const result = await dev.withdrawStorage.getCumulativePrice(property, {
					from: withdraw,
				})
				expect(result.toNumber()).to.be.equal(50)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setCumulativePrice(property, 50, {from: dummyWithdraw})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setWithdrawalLimitTotal, getWithdrawalLimitTotal', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getWithdrawalLimitTotal(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setWithdrawalLimitTotal(property, user, 500, {
					from: withdraw,
				})
				const result = await dev.withdrawStorage.getWithdrawalLimitTotal(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(500)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setWithdrawalLimitTotal(property, user, 500, {from: dummyWithdraw})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setWithdrawalLimitBalance, getWithdrawalLimitBalance', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getWithdrawalLimitBalance(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setWithdrawalLimitBalance(
					property,
					user,
					5000,
					{
						from: withdraw,
					}
				)
				const result = await dev.withdrawStorage.getWithdrawalLimitBalance(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(5000)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setWithdrawalLimitBalance(property, user, 5000, {
						from: dummyWithdraw,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setLastWithdrawalPrice, getLastWithdrawalPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getLastWithdrawalPrice(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setLastWithdrawalPrice(
					property,
					user,
					50000,
					{
						from: withdraw,
					}
				)
				const result = await dev.withdrawStorage.getLastWithdrawalPrice(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(50000)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setLastWithdrawalPrice(property, user, 50000, {from: dummyWithdraw})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setPendingWithdrawal, getPendingWithdrawal', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getPendingWithdrawal(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setPendingWithdrawal(property, user, 500000, {
					from: withdraw,
				})
				const result = await dev.withdrawStorage.getPendingWithdrawal(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(500000)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setPendingWithdrawal(property, user, 500000, {from: dummyWithdraw})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('WithdrawStorageTest; setLastCumulativeGlobalHoldersPrice, getLastCumulativeGlobalHoldersPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.withdrawStorage.setLastCumulativeGlobalHoldersPrice(
					property,
					user,
					50000000,
					{
						from: withdraw,
					}
				)
				const result = await dev.withdrawStorage.getLastCumulativeGlobalHoldersPrice(
					property,
					user,
					{
						from: withdraw,
					}
				)
				expect(result.toNumber()).to.be.equal(50000000)
			})
			it('Cannot rewrite data from other than withdraw.', async () => {
				const result = await dev.withdrawStorage
					.setLastCumulativeGlobalHoldersPrice(property, user, 50000000, {
						from: dummyWithdraw,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
