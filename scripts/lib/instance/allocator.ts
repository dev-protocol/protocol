/* eslint-disable @typescript-eslint/await-thenable */
import {AllocatorInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class Allocator {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<AllocatorInstance> {
		const address = await this._dev.addressConfig.allocator()
		const allocator = await this._dev.artifacts.require('Allocator').at(address)
		console.log('load Allocator contract', allocator.address)
		return allocator
	}

	public async create(): Promise<AllocatorInstance> {
		const allocator = await this._dev.artifacts
			.require('Allocator')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new Allocator contract', allocator.address)
		return allocator
	}

	public async set(allocator: AllocatorInstance): Promise<void> {
		await this._dev.addressConfig.setAllocator(
			allocator.address,
			await this._dev.gasInfo
		)
		console.log('set Allocator contract', allocator.address)
	}
}
