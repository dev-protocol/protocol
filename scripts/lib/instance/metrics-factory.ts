/* eslint-disable @typescript-eslint/await-thenable */
import { MetricsFactoryInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class MetricsFactory {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<MetricsFactoryInstance> {
		const address = await this._dev.addressConfig.metricsFactory()
		const metricsFactory = await this._dev.artifacts
			.require('MetricsFactory')
			.at(address)
		console.log('load MetricsFactory contract', metricsFactory.address)
		return metricsFactory
	}

	public async create(): Promise<MetricsFactoryInstance> {
		const metricsFactory = await this._dev.artifacts
			.require('MetricsFactory')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new MetricsFactory contract', metricsFactory.address)
		return metricsFactory
	}

	public async set(metricsFactory: MetricsFactoryInstance): Promise<void> {
		await this._dev.addressConfig.setMetricsFactory(
			metricsFactory.address,
			await this._dev.gasInfo
		)
		console.log('set MetricsFactory contract', metricsFactory.address)
	}
}
