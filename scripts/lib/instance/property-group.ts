/* eslint-disable @typescript-eslint/await-thenable */
import { PropertyGroupInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class PropertyGroup {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<PropertyGroupInstance> {
		const address = await this._dev.addressConfig.propertyGroup()
		const propertyGroup = await this._dev.artifacts
			.require('PropertyGroup')
			.at(address)
		console.log('load PropertyGroup contract', propertyGroup.address)
		return propertyGroup
	}

	public async create(): Promise<PropertyGroupInstance> {
		const propertyGroup = await this._dev.artifacts
			.require('PropertyGroup')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new PropertyGroup contract', propertyGroup.address)
		return propertyGroup
	}

	public async set(propertyGroup: PropertyGroupInstance): Promise<void> {
		await this._dev.addressConfig.setPropertyGroup(
			propertyGroup.address,
			await this._dev.gasInfo
		)
		console.log('set PropertyGroup contract', propertyGroup.address)
	}

	public async changeOwner(
		before: PropertyGroupInstance,
		after: PropertyGroupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress)
		await before.changeOwner(after.address)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
