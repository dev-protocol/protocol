import {
	AddressConfigInstance,
	VoteTimesInstance,
	VoteTimesStorageInstance,
	PropertyGroupInstance,
	DevInstance,
	LockupInstance,
	LockupStorageInstance,
	PropertyFactoryInstance,
	DecimalsInstance,
	PolicyFactoryInstance,
	PolicySetInstance,
	PolicyGroupInstance,
	MarketFactoryInstance,
	MarketGroupInstance,
	MetricsGroupInstance
} from '../../types/truffle-contracts'

const contract = artifacts.require

export class DevProtocolInstance {
	private readonly _deployer: string

	private _addressConfig!: AddressConfigInstance
	private _dev!: DevInstance
	private _lockup!: LockupInstance
	private _lockupStorage!: LockupStorageInstance
	private _propertyFactory!: PropertyFactoryInstance
	private _voteTimes!: VoteTimesInstance
	private _voteTimesStorage!: VoteTimesStorageInstance
	private _propertyGroup!: PropertyGroupInstance
	private _policyFactory!: PolicyFactoryInstance
	private _policySet!: PolicySetInstance
	private _policyGroup!: PolicyGroupInstance
	private _marketFactory!: MarketFactoryInstance
	private _marketGroup!: MarketGroupInstance
	private _metricsGroup!: MetricsGroupInstance

	constructor(deployer: string) {
		this._deployer = deployer
	}

	public get fromDeployer(): {from: string} {
		return {from: this._deployer}
	}

	public get addressConfig(): AddressConfigInstance {
		return this._addressConfig
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

	public get policyFactory(): PolicyFactoryInstance {
		return this._policyFactory
	}

	public get policySet(): PolicySetInstance {
		return this._policySet
	}

	public get policyGroup(): PolicyGroupInstance {
		return this._policyGroup
	}

	public get marketFactory(): MarketFactoryInstance {
		return this._marketFactory
	}

	public get marketGroup(): MarketGroupInstance {
		return this._marketGroup
	}

	public get metricsGroup(): MetricsGroupInstance {
		return this._metricsGroup
	}

	public async generateAddressConfig(): Promise<void> {
		const instance = contract('AddressConfig')
		this._addressConfig = await instance.new(this.fromDeployer)
	}

	public async generateDev(): Promise<void> {
		this._dev = await contract('Dev').new(
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
		})(contract('Lockup'))
		await this._addressConfig.setLockup(this._lockup.address, this.fromDeployer)
	}

	public async generateLockupStorage(): Promise<void> {
		this._lockupStorage = await contract('LockupStorage').new(
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
		this._propertyFactory = await contract('PropertyFactory').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setPropertyFactory(
			this._propertyFactory.address,
			this.fromDeployer
		)
	}

	public async generateVoteTimes(): Promise<void> {
		this._voteTimes = await contract('VoteTimes').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setVoteTimes(
			this._voteTimes.address,
			this.fromDeployer
		)
	}

	public async generateVoteTimesStorage(): Promise<void> {
		this._voteTimesStorage = await contract('VoteTimesStorage').new(
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
		this._propertyGroup = await contract('PropertyGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._propertyGroup.createStorage({from: this._deployer})
		await this._addressConfig.setPropertyGroup(
			this._propertyGroup.address,
			this.fromDeployer
		)
	}

	public async generatePolicyFactory(): Promise<void> {
		this._policyFactory = await contract('PolicyFactory').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setPolicyFactory(
			this._policyFactory.address,
			this.fromDeployer
		)
	}

	public async generatePolicySet(): Promise<void> {
		this._policySet = await contract('PolicySet').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._policySet.createStorage({from: this._deployer})
		await this._addressConfig.setPolicySet(
			this._policySet.address,
			this.fromDeployer
		)
		await this._policySet.createStorage(this.fromDeployer)
	}

	public async generatePolicyGroup(): Promise<void> {
		this._policyGroup = await contract('PolicyGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._policyGroup.createStorage({from: this._deployer})
		await this._addressConfig.setPolicyGroup(
			this._policyGroup.address,
			this.fromDeployer
		)
	}

	public async generateMarketFactory(): Promise<void> {
		this._marketFactory = await contract('MarketFactory').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setMarketFactory(
			this._marketFactory.address,
			this.fromDeployer
		)
	}

	public async generateMarketGroup(): Promise<void> {
		this._marketGroup = await contract('MarketGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setMarketGroup(
			this._marketGroup.address,
			this.fromDeployer
		)
		await this._marketGroup.createStorage(this.fromDeployer)
	}

	public async generateMetricsGroup(): Promise<void> {
		this._metricsGroup = await contract('MetricsGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setMetricsGroup(
			this._metricsGroup.address,
			this.fromDeployer
		)
		await this._metricsGroup.createStorage(this.fromDeployer)
	}

	public async generateDecimals(): Promise<DecimalsInstance> {
		return artifacts.require('Decimals').new(this.fromDeployer)
	}
}
