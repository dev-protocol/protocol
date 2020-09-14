/* eslint-disable @typescript-eslint/await-thenable */
import {PolicyFactoryInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class PolicyFactory {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<PolicyFactoryInstance> {
		const address = await this._dev.addressConfig.policyFactory()
		const policyFactory = await this._dev.artifacts
			.require('PolicyFactory')
			.at(address)
		console.log('load PolicyFactory contract', policyFactory.address)
		return policyFactory
	}

	public async create(): Promise<PolicyFactoryInstance> {
		const policyFactory = await this._dev.artifacts
			.require('PolicyFactory')
			.new(this._dev.addressConfig.address, this._dev.gasInfo)
		console.log('new PolicyFactory contract', policyFactory.address)
		return policyFactory
	}

	public async set(policyFactory: PolicyFactoryInstance): Promise<void> {
		await this._dev.addressConfig.setPolicyFactory(
			policyFactory.address,
			this._dev.gasInfo
		)
		console.log('set PolicyFactory contract', policyFactory.address)
	}
}
