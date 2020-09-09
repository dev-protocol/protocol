import {
	AddressConfigInstance,
	AllocatorInstance,
	VoteCounterInstance,
	PropertyGroupInstance,
	DevInstance,
	LockupInstance,
	PropertyFactoryInstance,
	PolicyFactoryInstance,
	PolicySetInstance,
	PolicyGroupInstance,
	MarketFactoryInstance,
	MarketGroupInstance,
	MetricsFactoryInstance,
	MetricsGroupTestInstance,
	WithdrawStorageInstance,
	IPolicyInstance,
	IMarketInstance,
	NextWithdrawInstance,
	MetricsInstance,
} from '../../types/truffle-contracts'
import {getBlock} from './utils/common'

const contract = artifacts.require

export class DevProtocolInstance {
	private readonly _deployer: string

	private _addressConfig!: AddressConfigInstance
	private _allocator!: AllocatorInstance
	private _dev!: DevInstance
	private _lockup!: LockupInstance
	private _propertyFactory!: PropertyFactoryInstance
	private _voteCounter!: VoteCounterInstance
	private _propertyGroup!: PropertyGroupInstance
	private _policyFactory!: PolicyFactoryInstance
	private _policySet!: PolicySetInstance
	private _policyGroup!: PolicyGroupInstance
	private _marketFactory!: MarketFactoryInstance
	private _marketGroup!: MarketGroupInstance
	private _metricsFactory!: MetricsFactoryInstance
	private _metricsGroup!: MetricsGroupTestInstance
	private _withdraw!: NextWithdrawInstance
	private _withdrawStorage!: WithdrawStorageInstance

	constructor(deployer: string) {
		this._deployer = deployer
	}

	public get fromDeployer(): {from: string} {
		return {from: this._deployer}
	}

	public get addressConfig(): AddressConfigInstance {
		return this._addressConfig
	}

	public get allocator(): AllocatorInstance {
		return this._allocator
	}

	public get dev(): DevInstance {
		return this._dev
	}

	public get lockup(): LockupInstance {
		return this._lockup
	}

	public get propertyFactory(): PropertyFactoryInstance {
		return this._propertyFactory
	}

	public get voteCounter(): VoteCounterInstance {
		return this._voteCounter
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

	public get metricsFactory(): MetricsFactoryInstance {
		return this._metricsFactory
	}

	public get metricsGroup(): MetricsGroupTestInstance {
		return this._metricsGroup
	}

	public get withdraw(): NextWithdrawInstance {
		return this._withdraw
	}

	public get withdrawStorage(): WithdrawStorageInstance {
		return this._withdrawStorage
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

	public async generateAllocator(): Promise<void> {
		this._allocator = await contract('Allocator').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setAllocator(
			this._allocator.address,
			this.fromDeployer
		)
	}

	public async generateLockup(): Promise<void> {
		this._lockup = await contract('Lockup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		const block = await getBlock()
		await this._addressConfig.setLockup(this._lockup.address, this.fromDeployer)
		await this._lockup.createStorage()
		await this._lockup.setDIP4GenesisBlock(block)
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

	public async generateVoteCounter(): Promise<void> {
		this._voteCounter = await contract('VoteCounter').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setVoteCounter(
			this._voteCounter.address,
			this.fromDeployer
		)
		await this._voteCounter.createStorage(this.fromDeployer)
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
		await this._policySet.createStorage(this.fromDeployer)
		await this._addressConfig.setPolicySet(
			this._policySet.address,
			this.fromDeployer
		)
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

	public async generateMetricsFactory(): Promise<void> {
		this._metricsFactory = await contract('MetricsFactory').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setMetricsFactory(
			this._metricsFactory.address,
			this.fromDeployer
		)
	}

	public async generateMetricsGroup(): Promise<void> {
		this._metricsGroup = await contract('MetricsGroupTest').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setMetricsGroup(
			this._metricsGroup.address,
			this.fromDeployer
		)
		await this._metricsGroup.createStorage(this.fromDeployer)
	}

	public async generateWithdraw(): Promise<void> {
		this._withdraw = await contract('NextWithdraw').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setWithdraw(
			this._withdraw.address,
			this.fromDeployer
		)
	}

	public async generateWithdrawStorage(): Promise<void> {
		this._withdrawStorage = await contract('WithdrawStorage').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setWithdrawStorage(
			this._withdrawStorage.address,
			this.fromDeployer
		)
		await this._withdrawStorage.createStorage(this.fromDeployer)
	}

	public async getPolicy(
		contractName: string,
		user: string
	): Promise<IPolicyInstance> {
		const tmp = await contract(contractName).new({from: user})
		return tmp
	}

	public async getMarket(
		contractName: string,
		user: string
	): Promise<IMarketInstance> {
		const tmp = await contract(contractName).new(this.addressConfig.address, {
			from: user,
		})
		return tmp
	}

	public async createMetrics(
		market: string,
		property: string
	): Promise<MetricsInstance> {
		return contract('Metrics').new(market, property)
	}
}
