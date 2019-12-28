import {
	AddressConfigInstance,
	VoteTimesInstance,
	VoteTimesStorageInstance,
	PropertyGroupInstance,
	EternalStorageInstance,
	StringValidatorInstance,
	DevInstance,
	LockupInstance,
	LockupStorageInstance,
	PropertyFactoryInstance,
	DecimalsInstance
} from '../../types/truffle-contracts'
import {ReturnTypeArtifactsRequire, ArtifactsName} from './artifacts-require'

const generateContract = <T extends ArtifactsName>(
	name: T
): ReturnTypeArtifactsRequire<T> => {
	const contract = artifacts.require<ReturnTypeArtifactsRequire<T>>(name)
	return contract
}

export class DevProtpcolInstance {
	private readonly _deployer: string

	private _addressConfig!: AddressConfigInstance
	private _eternalStorage!: EternalStorageInstance
	private _stringValidator!: StringValidatorInstance
	private _dev!: DevInstance
	private _lockup!: LockupInstance
	private _lockupStorage!: LockupStorageInstance
	private _propertyFactory!: PropertyFactoryInstance
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

	public get stringValidator(): StringValidatorInstance {
		return this._stringValidator
	}

	public get dev(): DevInstance {
		return this._dev
	}

	public get lockup(): LockupInstance {
		return this._lockup
	}

	public get lockupStorage(): LockupStorageInstance {
		return this._lockupStorage
	}

	public get propertyFactory(): PropertyFactoryInstance {
		return this._propertyFactory
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

	public get fromDeployer(): {from: string} {
		return {from: this._deployer}
	}

	public async generateAddressConfig(): Promise<void> {
		const contract = artifacts.require('AddressConfig')
		this._addressConfig = await contract.new(this.fromDeployer)
	}

	public async generateEternalStorage(): Promise<void> {
		const contract = artifacts.require('EternalStorage')
		this._eternalStorage = await contract.new(this.fromDeployer)
	}

	public async generateStringValidator(): Promise<void> {
		const contract = artifacts.require('StringValidator')
		this._stringValidator = await contract.new(this.fromDeployer)
	}

	public async generateDev(): Promise<void> {
		this._dev = await generateContract('Dev').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setToken(this._dev.address, this.fromDeployer)
	}

	public async generateLockup(): Promise<void> {
		this._lockup = await (async x => {
			;(x as any).link(
				'Decimals',
				await this.generateDecimals().then(x => x.address)
			)
			return x.new(this.addressConfig.address, this.fromDeployer)
		})(generateContract('Lockup'))
		await this._addressConfig.setLockup(this._lockup.address, this.fromDeployer)
	}

	public async generateLockupStorage(): Promise<void> {
		this._lockupStorage = await generateContract('LockupStorage').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setLockupStorage(
			this._lockupStorage.address,
			this.fromDeployer
		)
		await this._lockupStorage.createStorage(this.fromDeployer)
	}

	public async generatePropertyFactory(): Promise<void> {
		this._propertyFactory = await generateContract('PropertyFactory').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setPropertyFactory(
			this._propertyFactory.address,
			this.fromDeployer
		)
	}

	public async generateVoteTimes(): Promise<void> {
		this._voteTimes = await generateContract('VoteTimes').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setVoteTimes(
			this._voteTimes.address,
			this.fromDeployer
		)
	}

	public async generateVoteTimesStorage(): Promise<void> {
		this._voteTimesStorage = await generateContract('VoteTimesStorage').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setVoteTimesStorage(
			this._voteTimesStorage.address,
			this.fromDeployer
		)
		await this._voteTimesStorage.createStorage(this.fromDeployer)
	}

	public async generatePropertyGroup(): Promise<void> {
		this._propertyGroup = await generateContract('PropertyGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._propertyGroup.createStorage({from: this._deployer})
		await this._addressConfig.setPropertyGroup(
			this._propertyGroup.address,
			this.fromDeployer
		)
	}

	public async generateDecimals(): Promise<DecimalsInstance> {
		return artifacts.require('Decimals').new(this.fromDeployer)
	}
}
