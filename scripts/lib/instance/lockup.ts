/* eslint-disable @typescript-eslint/await-thenable */
import {LockupInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class Lockup {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<LockupInstance> {
		const address = await this._dev.addressConfig.lockup()
		const lockup = await this._dev.artifacts.require('Lockup').at(address)
		console.log('load Lockup contract', lockup.address)
		return lockup
	}

	public async create(): Promise<LockupInstance> {
		const lockup = await this._dev.artifacts
			.require('Lockup')
			.new(this._dev.addressConfig.address, this._dev.gasInfo)
		console.log('new Lockup contract', lockup.address)
		await this._addMinter(lockup)
		return lockup
	}

	public async set(lockup: LockupInstance): Promise<void> {
		await this._dev.addressConfig.setLockup(lockup.address, this._dev.gasInfo)
		console.log('set Lockup contract', lockup.address)
	}

	public async changeOwner(
		before: LockupInstance,
		after: LockupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress)
		await before.changeOwner(after.address)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}

	private async _addMinter(lockup: LockupInstance): Promise<void> {
		await this._dev.dev.addMinter(lockup.address, this._dev.gasInfo)

		console.log(`add minter ${lockup.address}`)
	}
}
