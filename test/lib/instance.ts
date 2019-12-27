import {
	AddressConfigInstance,
	VoteTimesInstance,
	VoteTimesStorageInstance,
	PropertyGroupInstance,
	EternalStorageInstance
} from '../../types/truffle-contracts'

export class DevProtpcolInstance {
	private readonly _deployer: string

	private _addressConfig!: AddressConfigInstance
	private _eternalStorage!: EternalStorageInstance
	private _voteTimes!: VoteTimesInstance
	private _voteTimesStorage!: VoteTimesStorageInstance
	private _propertyGroup!: PropertyGroupInstance

	constructor(deployer: string) {
		this._deployer = deployer
	}

	public get addressConfig(): AddressConfigInstance {
		return this._addressConfig
	}

	public get eternalStorage(): EternalStorageInstance {
		return this._eternalStorage
	}

	public get voteTimes(): VoteTimesInstance {
		return this._voteTimes
	}

	public get voteTimesStorage(): VoteTimesStorageInstance {
		return this._voteTimesStorage
	}

	public get propertyGroup(): PropertyGroupInstance {
		return this._propertyGroup
	}

	public async generateAddressConfig(): Promise<void> {
		const contract = artifacts.require('AddressConfig')
		this._addressConfig = await contract.new({from: this._deployer})
	}

	public async generateEternalStorage(): Promise<void> {
		const contract = artifacts.require('EternalStorage')
		this._eternalStorage = await contract.new({from: this._deployer})
	}

	public async generateVoteTimes(): Promise<void> {
		this._voteTimes = await this.generateInstance<VoteTimesInstance>(
			'VoteTimes'
		)
		await this._addressConfig.setVoteTimes(this._voteTimes.address, {
			from: this._deployer
		})
	}

	public async generateVoteTimesStorage(): Promise<void> {
		this._voteTimesStorage = await this.generateInstance<
			VoteTimesStorageInstance
		>('VoteTimesStorage')
		await this._addressConfig.setVoteTimesStorage(
			this._voteTimesStorage.address,
			{from: this._deployer}
		)
		await this._voteTimesStorage.createStorage({from: this._deployer})
	}

	public async generatePropertyGroup(): Promise<void> {
		this._propertyGroup = await this.generateInstance<PropertyGroupInstance>(
			'PropertyGroup'
		)
		await this._propertyGroup.createStorage({from: this._deployer})
		await this._addressConfig.setPropertyGroup(this._propertyGroup.address, {
			from: this._deployer
		})
	}

	public async generateInstance<T>(name: string): Promise<T> {
		const contract = artifacts.require(name)
		const instance = await contract.new(this._addressConfig.address, {
			from: this._deployer
		})
		return instance
	}
}
