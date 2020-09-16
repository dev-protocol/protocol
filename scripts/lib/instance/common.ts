/* eslint-disable @typescript-eslint/await-thenable */

import {
	AddressConfigInstance,
	DevInstance,
} from '../../../types/truffle-contracts'

export class DevCommonInstance {
	// eslint-disable-next-line no-undef
	private readonly _artifacts: Truffle.Artifacts
	private readonly _gasFetcher: () => Promise<number | string>
	private readonly _gasPriceFetcher: () => Promise<number | string>
	private readonly _configAddress: string

	private _addressConfig!: AddressConfigInstance
	private _dev!: DevInstance

	constructor(
		// eslint-disable-next-line no-undef
		_artifacts: Truffle.Artifacts,
		_configAddress: string,
		_gasFetcher: () => Promise<number | string>,
		_gasPriceFetcher: () => Promise<number | string>
	) {
		this._artifacts = _artifacts
		this._configAddress = _configAddress
		this._gasFetcher = _gasFetcher
		this._gasPriceFetcher = _gasPriceFetcher
	}

	// eslint-disable-next-line no-undef
	public get artifacts(): Truffle.Artifacts {
		return this._artifacts
	}

	public get gasInfo(): Promise<{
		gas: number | string
		gasPrice: number | string
	}> {
		return Promise.all([this._gasFetcher(), this._gasPriceFetcher()])
			.then(([gas, gasPrice]) => ({gas, gasPrice}))
			.catch((err: Error) => {
				console.error(err)
				return {
					gas: 0,
					gasPrice: 0,
				}
			})
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
			.at(this._configAddress)
		console.log('load AddressConfig contract', this._addressConfig.address)
	}

	private async _loadDev(): Promise<void> {
		const address = await this._addressConfig.token()
		this._dev = await this._artifacts.require('Dev').at(address)
		console.log('load Dev contract', this._dev.address)
	}
}
