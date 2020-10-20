/* eslint-disable @typescript-eslint/await-thenable */
import {VoteCounterInstance} from '../../../types/truffle-contracts'
import {DevCommonInstance} from './common'

export class VoteCounter {
	private readonly _dev: DevCommonInstance
	constructor(dev: DevCommonInstance) {
		this._dev = dev
	}

	public async load(): Promise<VoteCounterInstance> {
		const address = await this._dev.addressConfig.voteCounter()
		const voteCounter = await this._dev.artifacts
			.require('VoteCounter')
			.at(address)
		console.log('load VoteCounter contract', voteCounter.address)
		return voteCounter
	}

	public async create(): Promise<VoteCounterInstance> {
		const voteCounter = await this._dev.artifacts
			.require('VoteCounter')
			.new(this._dev.addressConfig.address, await this._dev.gasInfo)
		console.log('new VoteCounter contract', voteCounter.address)
		return voteCounter
	}

	public async set(voteCounter: VoteCounterInstance): Promise<void> {
		await this._dev.addressConfig.setVoteCounter(
			voteCounter.address,
			await this._dev.gasInfo
		)
		console.log('set VoteCounter contract', voteCounter.address)
	}

	public async changeOwner(
		before: VoteCounterInstance,
		after: VoteCounterInstance
	): Promise<void> {
		const storageAddress = await before.getStorageAddress()
		console.log(`storage address ${storageAddress}`)
		await after.setStorage(storageAddress, await this._dev.gasInfo)
		await before.changeOwner(after.address, await this._dev.gasInfo)

		console.log(`change owner from ${before.address} to ${after.address}`)
	}
}
