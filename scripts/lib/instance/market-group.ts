/* eslint-disable @typescript-eslint/await-thenable */
import { MarketGroupInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class MarketGroup {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<MarketGroupInstance> {
		const address = await this._dev.addressConfig.marketGroup()
		const marketGroup = await this._dev.artifacts
			.require('MarketGroup')
			.at(address)
		console.log('load MarketGroup contract', marketGroup.address)
		return marketGroup
	}

	public async create(): Promise<MarketGroupInstance> {
		const marketGroup = await this._dev.artifacts
			.require('MarketGroup')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new MarketGroup contract', marketGroup.address)
		return marketGroup
	}

	public async set(marketGroup: MarketGroupInstance): Promise<void> {
		await this._dev.addressConfig.setMarketGroup(
			marketGroup.address,
			await this._dev.gasInfo
		)
		console.log('set MarketGroup contract', marketGroup.address)
	}

	public async changeOwner(
		before: MarketGroupInstance,
		after: MarketGroupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
