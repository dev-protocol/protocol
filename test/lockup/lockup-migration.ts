import { LockupMigrationTestInstance } from '../../types/truffle-contracts'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('LockupMigrationTest', ([from, property, user]) => {
	const err = (error: Error): Error => error

	const init = async (): Promise<LockupMigrationTestInstance> => {
		const config = await artifacts.require('AddressConfig').new()
		const lockup = await artifacts
			.require('LockupMigrationTest')
			.new(config.address)
		await lockup.createStorage()
		await lockup.prepare()
		return lockup
	}

	describe('LockupMigration; lockup', () => {
		it('There will always be an error.', async () => {
			const lockup = await init()
			const res = await lockup.lockup(from, property, 10).catch(err)
			validateErrorMessage(res, 'under maintenance')
		})
	})
	describe('LockupMigration; withdraw', () => {
		it('There will always be an error.', async () => {
			const lockup = await init()
			const res = await lockup.withdraw(property, 10).catch(err)
			validateErrorMessage(res, 'under maintenance')
		})
	})
	describe('LockupMigration; setInitialCumulativeHoldersRewardCap', () => {
		describe('success', () => {
			it('The value of cap will be set..', async () => {
				const lockup = await init()
				const before = await lockup.getStorageInitialCumulativeHoldersRewardCap(
					property
				)
				expect(before.toNumber()).to.be.equal(0)
				await lockup.setInitialCumulativeHoldersRewardCap(property)
				const after = await lockup.getStorageInitialCumulativeHoldersRewardCap(
					property
				)
				expect(after.toNumber()).to.be.equal(10)
			})
		})
		describe('fail', () => {
			it('An error will occur if anyone other than the owner runs it.', async () => {
				const lockup = await init()
				const res = await lockup
					.setInitialCumulativeHoldersRewardCap(property, { from: user })
					.catch(err)
				validateErrorMessage(res, 'Ownable: caller is not the owner')
			})
			it('If it has already been executed, it will result in an error..', async () => {
				const lockup = await init()
				await lockup.setInitialCumulativeHoldersRewardCap(property)
				const res = await lockup
					.setInitialCumulativeHoldersRewardCap(property)
					.catch(err)
				validateErrorMessage(res, 'already set the value')
			})
		})
	})
})
