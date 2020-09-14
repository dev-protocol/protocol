/* eslint-disable @typescript-eslint/await-thenable */
import {PolicySetInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class PolicySet {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
		console.log('PolicySet will be removed.')
	}

	public async load(): Promise<PolicySetInstance> {
		const address = await this._dev.addressConfig.policySet()
		const policySet = await this._dev.artifacts.require('PolicySet').at(address)
		console.log('load PolicySet contract', policySet.address)
		return policySet
	}

	public async create(): Promise<PolicySetInstance> {
		const policySet = await this._dev.artifacts
			.require('PolicySet')
			.new(this._dev.addressConfig.address, this._dev.gasInfo)
		console.log('new PolicySet contract', policySet.address)
		return policySet
	}

	public async set(policySet: PolicySetInstance): Promise<void> {
		await this._dev.addressConfig.setPolicySet(
			policySet.address,
			this._dev.gasInfo
		)
		console.log('set PolicySet contract', policySet.address)
	}

	public async changeOwner(
		before: PolicySetInstance,
		after: PolicySetInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress)
		await before.changeOwner(after.address)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
