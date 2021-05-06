/* eslint-disable @typescript-eslint/await-thenable */
import {
	LockupInstance,
	LockupMigrationInstance,
} from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class LockupMigration {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<LockupMigrationInstance> {
		const address = await this._dev.addressConfig.lockup()
		const lockup = await this._dev.artifacts
			.require('LockupMigration')
			.at(address)
		console.log('load LockupMigration contract', lockup.address)
		return lockup
	}

	public async create(devMinter = ''): Promise<LockupMigrationInstance> {
		if (devMinter === '') {
			const tmp = await this.load()
			devMinter = await tmp.devMinter()
		}

		const lockupMigration = await this._dev.artifacts
			.require('LockupMigration')
			.new(this._dev.addressConfig.address, devMinter, await this._dev.gasInfo)
		console.log('new Lockup contract', lockupMigration.address)
		await this._addMinter(lockupMigration)
		return lockupMigration
	}

	public async set(lockupMigration: LockupMigrationInstance): Promise<void> {
		await this._dev.addressConfig.setLockup(
			lockupMigration.address,
			await this._dev.gasInfo
		)
		console.log('set Lockup contract', lockupMigration.address)
	}

	public async changeOwnerToMigrationContract(
		before: LockupInstance,
		after: LockupMigrationInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}

	public async changeOwner(
		before: LockupMigrationInstance,
		after: LockupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}

	private async _addMinter(
		lockupMigration: LockupMigrationInstance
	): Promise<void> {
		await this._dev.dev.addMinter(
			lockupMigration.address,
			await this._dev.gasInfo
		)

		console.log(`add minter ${lockupMigration.address}`)
	}
}
