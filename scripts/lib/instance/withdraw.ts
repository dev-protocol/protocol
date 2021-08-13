/* eslint-disable @typescript-eslint/await-thenable */
import {
	WithdrawInstance,
	WithdrawStorageInstance,
} from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

type InstanceOfWithdraw = WithdrawInstance

export class Withdraw {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<WithdrawInstance> {
		const address = await this._dev.addressConfig.withdraw()
		const withdraw = await this._dev.artifacts.require('Withdraw').at(address)
		console.log('load Withdraw contract', withdraw.address)
		return withdraw
	}

	public async create(devMinter = ''): Promise<WithdrawInstance> {
		if (devMinter === '') {
			const tmp = await this.load()
			devMinter = await tmp.devMinter()
		}

		const withdraw = await this._dev.artifacts
			.require('Withdraw')
			.new(this._dev.addressConfig.address, devMinter, await this._dev.gasInfo)
		console.log('new Withdraw contract', withdraw.address)
		return withdraw
	}

	public async set(withdraw: InstanceOfWithdraw): Promise<void> {
		await this._dev.addressConfig.setWithdraw(
			withdraw.address,
			await this._dev.gasInfo
		)
		console.log('set Withdraw contract', withdraw.address)
	}

	public async changeOwner(
		before: WithdrawStorageInstance | InstanceOfWithdraw,
		after: InstanceOfWithdraw
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
