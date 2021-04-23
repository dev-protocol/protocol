/* eslint-disable @typescript-eslint/await-thenable */
import {
	AddressConfigInstance,
	UpgraderInstance,
	PatchPlaneInstance,
} from '../../../types/truffle-contracts'
import { validateErrorMessage } from '../../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../../test-lib/const'

contract('DevProtocolAccess', ([admin, operator, user1, dummy]) => {
	const getTestInstance = async (
		patchName = 'PatchPlane',
		patchSetter = admin
	): Promise<[UpgraderInstance, AddressConfigInstance, PatchPlaneInstance]> => {
		const addressConfig = await artifacts.require('AddressConfig').new()
		const upgrader = await artifacts
			.require('Upgrader')
			.new(addressConfig.address)
		const patch = await artifacts.require(patchName).new(upgrader.address)
		await upgrader.addOperator(operator)
		await upgrader.setPatch(patch.address, { from: patchSetter })
		return [upgrader, addressConfig, patch]
	}

	describe('execute', () => {
		describe('success', () => {
			it('devMinterからmit roleを削除する', async () => {
				const [upgrader, addressConfig, patch] = await getTestInstance(
					'PatchLockup'
				)
				const dev = await artifacts.require('Dev').new(addressConfig.address)
				const devMinter = await artifacts
					.require('DevMinter')
					.new(addressConfig.address)
				await dev.addMinter(devMinter.address)
				await dev.addMinter(upgrader.address)
				const lockup = await artifacts
					.require('Lockup')
					.new(addressConfig.address, devMinter.address)
				await lockup.createStorage()
				await lockup.transferOwnership(upgrader.address)
				await addressConfig.setLockup(lockup.address)
				await addressConfig.setToken(dev.address)
				await addressConfig.transferOwnership(upgrader.address)
				await devMinter.transferOwnership(upgrader.address)

				expect(await patch.paused()).to.be.equal(false)
				expect(await dev.isMinter(devMinter.address)).to.be.equal(true)
				expect(await addressConfig.owner()).to.be.equal(upgrader.address)
				const tx = await upgrader.exexute(true, { from: operator })
				const nextLockup = tx.logs.filter((log) => {
					return log.event === 'Upgrade' && log.args._name === 'Lockup'
				})[0].args._next
				expect(await addressConfig.lockup()).to.be.equal(nextLockup)
				expect(await patch.paused()).to.be.equal(true)
				expect(await addressConfig.owner()).to.be.equal(upgrader.address)
				expect(await dev.isMinter(devMinter.address)).to.be.equal(false)
				const nextLockupInstance = await artifacts
					.require('Lockup')
					.at(nextLockup)
				const nextDevMinterAddress = await nextLockupInstance.devMinter()
				expect(await dev.isMinter(nextDevMinterAddress)).to.be.equal(true)
			})
			it('devMinterからmit roleを削除しない', async () => {
				const [upgrader, addressConfig, patch] = await getTestInstance(
					'PatchPlane2'
				)
				await addressConfig.transferOwnership(upgrader.address)
				expect(await addressConfig.allocator()).to.be.equal(DEFAULT_ADDRESS)
				expect(await patch.paused()).to.be.equal(false)
				expect(await addressConfig.owner()).to.be.equal(upgrader.address)
				const tx = await upgrader.exexute(false, { from: operator })
				const nextAllocator = tx.logs.filter((log) => {
					return log.event === 'Upgrade' && log.args._name === 'Allocator'
				})[0].args._next
				expect(await addressConfig.allocator()).to.be.equal(nextAllocator)
				expect(await patch.paused()).to.be.equal(true)
				expect(await addressConfig.owner()).to.be.equal(upgrader.address)
			})
			it.only('Can be run by admin and operator', async () => {
				const testFunc = async (
					setPatcher: string,
					executer: string
				): Promise<void> => {
					const [upgrader, addressConfig, patch] = await getTestInstance(
						'PatchPlane2',
						setPatcher
					)
					await upgrader.addOperator(admin)
					await addressConfig.transferOwnership(upgrader.address)
					await upgrader.exexute(false, { from: executer })
				}

				await testFunc(admin, operator)
				await testFunc(operator, admin)
			})
		})
		describe('fail', () => {
			it('patchSetter == msg.sender', async () => {
				const [upgrader] = await getTestInstance()
				const result = await upgrader.exexute(false).catch((err: Error) => err)
				validateErrorMessage(result, 'not another operator')
			})
			it('patchがpause', async () => {
				const [upgrader, , patch] = await getTestInstance()
				await patch.pause()
				const result = await upgrader
					.exexute(false, { from: operator })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already executed')
			})
			it('patchがpause', async () => {
				const [upgrader, , patch] = await getTestInstance()
				const result = await upgrader
					.exexute(false, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})

	describe('addUpgradeEvent', () => {
		describe('fail', () => {
			it('patch以外からのアクセス', async () => {
				const [upgrader] = await getTestInstance()
				const result = await upgrader
					.addUpgradeEvent('dummy', dummy, dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
	})
})
