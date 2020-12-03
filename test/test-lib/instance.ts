import {
	AddressConfigInstance,
	AllocatorInstance,
	VoteCounterInstance,
	PropertyGroupInstance,
	DevInstance,
	LockupInstance,
	PropertyFactoryInstance,
	PolicyFactoryInstance,
	PolicyGroupInstance,
	MarketFactoryInstance,
	MarketGroupInstance,
	MetricsFactoryInstance,
	MetricsGroupTestInstance,
	IPolicyInstance,
	IMarketInstance,
	WithdrawInstance,
	WithdrawTestInstance,
	MetricsInstance,
	TreasuryTestInstance,
} from '../../types/truffle-contracts'
import { getBlock } from './utils/common'

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
	private _policyGroup!: PolicyGroupInstance
	private _marketFactory!: MarketFactoryInstance
	private _marketGroup!: MarketGroupInstance
	private _metricsFactory!: MetricsFactoryInstance
	private _metricsGroup!: MetricsGroupTestInstance
	private _withdraw!: WithdrawInstance
	private _withdrawTest!: WithdrawTestInstance
	private _treasury!: TreasuryTestInstance

	constructor(deployer: string) {
		this._deployer = deployer
	}

	public get fromDeployer(): { from: string } {
		return { from: this._deployer }
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

	public get withdraw(): WithdrawInstance {
		return this._withdraw
	}

	public get withdrawTest(): WithdrawTestInstance {
		return this._withdrawTest
	}

	public get treasury(): TreasuryTestInstance {
		return this._treasury
	}

	public get activeWithdraw(): WithdrawInstance | WithdrawTestInstance {
		if (typeof this._withdraw === 'undefined') {
			return this._withdrawTest
		}

		return this._withdraw
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
		await this._propertyGroup.createStorage({ from: this._deployer })
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

	public async generatePolicyGroup(): Promise<void> {
		this._policyGroup = await contract('PolicyGroup').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._policyGroup.createStorage({ from: this._deployer })
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
		this._withdraw = await contract('Withdraw').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setWithdraw(
			this._withdraw.address,
			this.fromDeployer
		)
		await this._withdraw.createStorage(this.fromDeployer)
	}

	public async generateWithdrawTest(): Promise<void> {
		this._withdrawTest = await contract('WithdrawTest').new(
			this.addressConfig.address,
			this.fromDeployer
		)
		await this._addressConfig.setWithdraw(
			this._withdrawTest.address,
			this.fromDeployer
		)
		await this._withdrawTest.createStorage(this.fromDeployer)
	}

	public async generatePolicy(
		policyContractName = 'PolicyTestBase'
	): Promise<void> {
		const policy = await contract(policyContractName).new()
		this._treasury = await contract('TreasuryTest').new()
		await policy.setTreasury(this._treasury.address)
		await this._policyFactory.create(policy.address)
	}

	public async getPolicy(
		contractName: string,
		user: string
	): Promise<IPolicyInstance> {
		const tmp = await contract(contractName).new({ from: user })
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
