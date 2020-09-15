/* eslint-disable @typescript-eslint/await-thenable */

import {
	AddressConfigInstance,
	DevInstance,
} from '../../../types/truffle-contracts'

export class DevCommonInstance {
	// eslint-disable-next-line no-undef
	private readonly _artifacts: Truffle.Artifacts
	private readonly _gasInfo: {gas: number; gasPrice: number}
	private _addressConfig!: AddressConfigInstance
	private _dev!: DevInstance

	// eslint-disable-next-line no-undef
	constructor(_artifacts: Truffle.Artifacts, _gas: number, _gasPrice: number) {
		this._artifacts = _artifacts
		this._gasInfo = {gas: _gas, gasPrice: _gasPrice}
	}

	// eslint-disable-next-line no-undef
	public get artifacts(): Truffle.Artifacts {
		return this._artifacts
	}

	public get gasInfo(): {gas: number; gasPrice: number} {
		return this._gasInfo
	}

	public get addressConfig(): AddressConfigInstance {
		return this._addressConfig
	}

	public get dev(): DevInstance {
		return this._dev
	}

	public async prepare(): Promise<void> {
		await this._loadAddressConfig()
		await this._loadDev()
	}

	private async _loadAddressConfig(): Promise<void> {
		this._addressConfig = await this._artifacts
			.require('AddressConfig')
			.at(process.env.CONFIG!)
		console.log('load AddressConfig contract', this._addressConfig.address)
	}

	private async _loadDev(): Promise<void> {
		const address = await this._addressConfig.token()
		this._dev = await this._artifacts.require('Dev').at(address)
		console.log('load Dev contract', this._dev.address)
	}
}
