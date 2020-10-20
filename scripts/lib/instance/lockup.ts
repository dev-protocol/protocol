/* eslint-disable @typescript-eslint/await-thenable */
import {LockupInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

type InstanceOfLockup = LockupInstance

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
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new Lockup contract', lockup.address)
		await this._addMinter(lockup)
		return lockup
	}

	public async set(lockup: InstanceOfLockup): Promise<void> {
		await this._dev.addressConfig.setLockup(
			lockup.address,
			await this._dev.gasInfo
		)
		console.log('set Lockup contract', lockup.address)
	}

	public async changeOwner(
		before: InstanceOfLockup,
		after: InstanceOfLockup
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}

	private async _addMinter(lockup: InstanceOfLockup): Promise<void> {
		await this._dev.dev.addMinter(lockup.address, await this._dev.gasInfo)

		console.log(`add minter ${lockup.address}`)
	}
}
