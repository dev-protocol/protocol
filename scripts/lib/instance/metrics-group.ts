/* eslint-disable @typescript-eslint/await-thenable */
import { MetricsGroupInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class MetricsGroup {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<MetricsGroupInstance> {
		const address = await this._dev.addressConfig.metricsGroup()
		const metricsGroup = await this._dev.artifacts
			.require('MetricsGroup')
			.at(address)
		console.log('load MetricsGroup contract', metricsGroup.address)
		return metricsGroup
	}

	public async create(): Promise<MetricsGroupInstance> {
		const metricsGroup = await this._dev.artifacts
			.require('MetricsGroup')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new MetricsGroup contract', metricsGroup.address)
		return metricsGroup
	}

	public async set(metricsGroup: MetricsGroupInstance): Promise<void> {
		await this._dev.addressConfig.setMetricsGroup(
			metricsGroup.address,
			await this._dev.gasInfo
		)
		console.log('set MetricsGroup contract', metricsGroup.address)
	}

	public async changeOwner(
		before: MetricsGroupInstance,
		after: MetricsGroupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
