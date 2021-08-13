/* eslint-disable @typescript-eslint/await-thenable */
import { IPolicyInstance } from '../../../types/truffle-contracts'
import { DevCommonInstance } from './common'

export class Policy {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<IPolicyInstance> {
		const address = await this._dev.addressConfig.policy()
		const policy = await this._dev.artifacts.require('IPolicy').at(address)
		console.log('load Policy contract', policy.address)
		return policy
	}
}
