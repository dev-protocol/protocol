/* eslint-disable @typescript-eslint/await-thenable */
import { MarketFactoryInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class MarketFactry {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<MarketFactoryInstance> {
		const address = await this._dev.addressConfig.marketFactory()
		const marketFactory = await this._dev.artifacts
			.require('MarketFactory')
			.at(address)
		console.log('load MarketFactory contract', marketFactory.address)
		return marketFactory
	}

	public async create(): Promise<MarketFactoryInstance> {
		const marketFactory = await this._dev.artifacts
			.require('MarketFactory')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new MarketFactory contract', marketFactory.address)
		return marketFactory
	}

	public async set(marketFactory: MarketFactoryInstance): Promise<void> {
		await this._dev.addressConfig.setMarketFactory(
			marketFactory.address,
			await this._dev.gasInfo
		)
		console.log('set MarketFactory contract', marketFactory.address)
	}
}
