/* eslint-disable @typescript-eslint/await-thenable */
import {WithdrawStorageInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class WithdrawStorage {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
		console.log('WithdrawStorage will be removed.')
	}

	public async load(): Promise<WithdrawStorageInstance> {
		const address = await this._dev.addressConfig.withdrawStorage()
		const withdrawStorage = await this._dev.artifacts
			.require('WithdrawStorage')
			.at(address)
		console.log('load WithdrawStorage contract', withdrawStorage.address)
		return withdrawStorage
	}

	public async create(): Promise<WithdrawStorageInstance> {
		const withdrawStorage = await this._dev.artifacts
			.require('WithdrawStorage')
			.new(this._dev.gasInfo)
		console.log('new WithdrawStorage contract', withdrawStorage.address)
		return withdrawStorage
	}

	public async set(withdrawStorage: WithdrawStorageInstance): Promise<void> {
		await this._dev.addressConfig.setWithdrawStorage(
			withdrawStorage.address,
			this._dev.gasInfo
		)
		console.log('set WithdrawStorage contract', withdrawStorage.address)
	}

	public async changeOwner(
		before: WithdrawStorageInstance,
		after: WithdrawStorageInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress)
		await before.changeOwner(after.address)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
