/* eslint-disable @typescript-eslint/await-thenable */
import {PolicyGroupInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class PolicyGroup {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<PolicyGroupInstance> {
		const address = await this._dev.addressConfig.policyGroup()
		const policyGroup = await this._dev.artifacts
			.require('PolicyGroup')
			.at(address)
		console.log('load PolicyGroup contract', policyGroup.address)
		return policyGroup
	}

	public async create(): Promise<PolicyGroupInstance> {
		const policyGroup = await this._dev.artifacts
			.require('PolicyGroup')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new PolicyGroup contract', policyGroup.address)
		return policyGroup
	}

	public async set(policyGroup: PolicyGroupInstance): Promise<void> {
		await this._dev.addressConfig.setPolicyGroup(
			policyGroup.address,
			await this._dev.gasInfo
		)
		console.log('set PolicyGroup contract', policyGroup.address)
	}

	public async changeOwner(
		before: PolicyGroupInstance,
		after: PolicyGroupInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
