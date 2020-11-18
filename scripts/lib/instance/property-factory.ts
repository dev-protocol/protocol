/* eslint-disable @typescript-eslint/await-thenable */
import { PropertyFactoryInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class PropertyFactory {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<PropertyFactoryInstance> {
		const address = await this._dev.addressConfig.propertyFactory()
		const propertyFactory = await this._dev.artifacts
			.require('PropertyFactory')
			.at(address)
		console.log('load PropertyFactory contract', propertyFactory.address)
		return propertyFactory
	}

	public async create(): Promise<PropertyFactoryInstance> {
		const propertyFactory = await this._dev.artifacts
			.require('PropertyFactory')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new PropertyFactory contract', propertyFactory.address)
		return propertyFactory
	}

	public async set(propertyFactory: PropertyFactoryInstance): Promise<void> {
		await this._dev.addressConfig.setPropertyFactory(
			propertyFactory.address,
			await this._dev.gasInfo
		)
		console.log('set PropertyFactory contract', propertyFactory.address)
	}
}
