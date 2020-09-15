/* eslint-disable @typescript-eslint/await-thenable */
import {WithdrawInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

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

	public async create(): Promise<WithdrawInstance> {
		const withdraw = await this._dev.artifacts
			.require('Withdraw')
			.new(this._dev.addressConfig.address, this._dev.gasInfo)
		console.log('new Withdraw contract', withdraw.address)
		await this._addMinter(withdraw)
		return withdraw
	}

	public async set(withdraw: WithdrawInstance): Promise<void> {
		await this._dev.addressConfig.setWithdraw(
			withdraw.address,
			this._dev.gasInfo
		)
		console.log('set Withdraw contract', withdraw.address)
	}

	private async _addMinter(withdraw: WithdrawInstance): Promise<void> {
		await this._dev.dev.addMinter(withdraw.address, this._dev.gasInfo)

		console.log(`add minter ${withdraw.address}`)
	}

	// TODO add change storage method
}
