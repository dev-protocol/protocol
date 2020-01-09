import {DevProtocolInstance} from '../test-lib/instance'
import {validateErrorMessage} from '../test-lib/utils'

contract(
	'LockupStorageStorageTest',
	([deployer, lockup, dummyLockup, sender, property, user]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateLockupStorage()
			await dev.addressConfig.setLockup(lockup, {from: deployer})
		})
		describe('LockupStorageStorage; setValue, getValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getValue(property, sender, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setValue(property, sender, 3, {
					from: lockup
				})
				const result = await dev.lockupStorage.getValue(property, sender, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(3)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setValue(property, sender, 3, {from: dummyLockup})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('LockupStorageStorage; setPropertyValue, getPropertyValue', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getPropertyValue(property, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setPropertyValue(property, 30, {
					from: lockup
				})
				const result = await dev.lockupStorage.getPropertyValue(property, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(30)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setPropertyValue(property, 30, {from: dummyLockup})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
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
					from: lockup
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
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('LockupStorageStorage; setInterestPrice, getInterestPrice', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.lockupStorage.getInterestPrice(property, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.lockupStorage.setInterestPrice(property, 3000, {
					from: lockup
				})
				const result = await dev.lockupStorage.getInterestPrice(property, {
					from: lockup
				})
				expect(result.toNumber()).to.be.equal(3000)
			})
			it('Cannot rewrite data from other than lockup.', async () => {
				const result = await dev.lockupStorage
					.setInterestPrice(property, 3000, {from: dummyLockup})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
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
					from: lockup
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
				validateErrorMessage(result as Error, 'this address is not proper')
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
						from: lockup
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
						from: dummyLockup
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
	}
)
