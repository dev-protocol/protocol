import {use} from 'chai'
import {Contract, Wallet} from 'ethers'
import {deployContract, solidity, link} from 'ethereum-waffle'
import {ContractJSON} from 'ethereum-waffle/dist/esm/ContractJSON'
import * as AddressConfig from '../../build/contracts/AddressConfig.json'
import * as Allocator from '../../build/contracts/Allocator.json'
import * as Dev from '../../build/contracts/Dev.json'
import * as Decimals from '../../build/contracts/Decimals.json'
import * as Lockup from '../../build/contracts/Lockup.json'
import * as LockupStorage from '../../build/contracts/LockupStorage.json'
import * as PropertyFactory from '../../build/contracts/PropertyFactory.json'
import * as VoteCounter from '../../build/contracts/VoteCounter.json'
import * as VoteCounterStorage from '../../build/contracts/VoteCounterStorage.json'
import * as VoteTimes from '../../build/contracts/VoteTimes.json'
import * as VoteTimesStorage from '../../build/contracts/VoteTimesStorage.json'
import * as PropertyGroup from '../../build/contracts/PropertyGroup.json'
import * as PolicyFactory from '../../build/contracts/PolicyFactory.json'
import * as PolicySet from '../../build/contracts/PolicySet.json'
import * as PolicyGroup from '../../build/contracts/PolicyGroup.json'
import * as MarketFactory from '../../build/contracts/MarketFactory.json'
import * as MarketGroup from '../../build/contracts/MarketGroup.json'
import * as MetricsFactory from '../../build/contracts/MetricsFactory.json'
import * as MetricsGroup from '../../build/contracts/MetricsGroup.json'
import * as Withdraw from '../../build/contracts/Withdraw.json'
import * as WithdrawStorage from '../../build/contracts/WithdrawStorage.json'

use(solidity)

export class DevProtocolInstance {
	private readonly _deployer: Wallet
	private _addressConfig!: Contract
	private _allocator!: Contract
	private _dev!: Contract
	private _lockup!: Contract
	private _lockupStorage!: Contract
	private _propertyFactory!: Contract
	private _voteCounter!: Contract
	private _voteCounterStorage!: Contract
	private _voteTimes!: Contract
	private _voteTimesStorage!: Contract
	private _propertyGroup!: Contract
	private _policyFactory!: Contract
	private _policySet!: Contract
	private _policyGroup!: Contract
	private _marketFactory!: Contract
	private _marketGroup!: Contract
	private _metricsFactory!: Contract
	private _metricsGroup!: Contract
	private _withdraw!: Contract
	private _withdrawStorage!: Contract

	constructor(deployer: Wallet) {
		this._deployer = deployer
	}

	public get addressConfig(): Contract {
		return this._addressConfig
	}

	public get allocator(): Contract {
		return this._allocator
	}

	public get dev(): Contract {
		return this._dev
	}

	public get lockup(): Contract {
		return this._lockup
	}

	public get lockupStorage(): Contract {
		return this._lockupStorage
	}

	public get propertyFactory(): Contract {
		return this._propertyFactory
	}

	public get voteCounter(): Contract {
		return this._voteCounter
	}

	public get voteCounterStorage(): Contract {
		return this._voteCounterStorage
	}

	public get voteTimes(): Contract {
		return this._voteTimes
	}

	public get voteTimesStorage(): Contract {
		return this._voteTimesStorage
	}

	public get propertyGroup(): Contract {
		return this._propertyGroup
	}

	public get policyFactory(): Contract {
		return this._policyFactory
	}

	public get policySet(): Contract {
		return this._policySet
	}

	public get policyGroup(): Contract {
		return this._policyGroup
	}

	public get marketFactory(): Contract {
		return this._marketFactory
	}

	public get marketGroup(): Contract {
		return this._marketGroup
	}

	public get metricsFactory(): Contract {
		return this._metricsFactory
	}

	public get metricsGroup(): Contract {
		return this._metricsGroup
	}

	public get withdraw(): Contract {
		return this._withdraw
	}

	public get withdrawStorage(): Contract {
		return this._withdrawStorage
	}

	public async generateAddressConfig(): Promise<void> {
		this._addressConfig = await deployContract(this._deployer, AddressConfig)
	}

	public async generateAllocator(): Promise<void> {
		this._allocator = await deployContract(this._deployer, Allocator, [
			this._addressConfig.address,
		])
		await this._addressConfig.setAllocator(this._allocator.address)
	}

	public async generateDev(): Promise<void> {
		this._dev = await deployContract(this._deployer, Dev, [
			this._addressConfig.address,
		])
		await this._addressConfig.setToken(this._dev.address)
	}

	public async generateLockup(): Promise<void> {
		const decimals = await deployContract(this._deployer, Decimals)
		link(
			Lockup,
			'contracts/src/common/libs/Decimals.sol:Decimals',
			decimals.address
		)
		this._lockup = await deployContract(
			this._deployer,
			Lockup,
			[this._addressConfig.address],
			{gasLimit: 6000000}
		)
		await this._addressConfig.setLockup(this._lockup.address)
	}

	public async generateLockupStorage(): Promise<void> {
		this._lockupStorage = await deployContract(
			this._deployer,
			LockupStorage,
			[this._addressConfig.address],
			{gasLimit: 6700000}
		)
		await this._addressConfig.setLockupStorage(this._lockupStorage.address)
		await this._lockupStorage.createStorage()
	}

	public async generatePropertyFactory(): Promise<void> {
		this._propertyFactory = await deployContract(
			this._deployer,
			PropertyFactory,
			[this._addressConfig.address]
		)
		await this._addressConfig.setPropertyFactory(this._propertyFactory.address)
	}

	public async generateVoteCounter(): Promise<void> {
		this._voteCounter = await deployContract(this._deployer, VoteCounter, [
			this._addressConfig.address,
		])
		await this._addressConfig.setVoteCounter(this._voteCounter.address)
	}

	public async generateVoteCounterStorage(): Promise<void> {
		this._voteCounterStorage = await deployContract(
			this._deployer,
			VoteCounterStorage,
			[this._addressConfig.address]
		)
		await this._addressConfig.setVoteCounterStorage(
			this._voteCounterStorage.address
		)
		await this._voteCounterStorage.createStorage()
	}

	public async generateVoteTimes(): Promise<void> {
		this._voteTimes = await deployContract(this._deployer, VoteTimes, [
			this._addressConfig.address,
		])
		await this._addressConfig.setVoteTimes(this._voteTimes.address)
	}

	public async generateVoteTimesStorage(): Promise<void> {
		this._voteTimesStorage = await deployContract(
			this._deployer,
			VoteTimesStorage,
			[this._addressConfig.address]
		)
		await this._addressConfig.setVoteTimesStorage(
			this._voteTimesStorage.address
		)
		await this._voteTimesStorage.createStorage()
	}

	public async generatePropertyGroup(): Promise<void> {
		this._propertyGroup = await deployContract(this._deployer, PropertyGroup, [
			this._addressConfig.address,
		])
		await this._propertyGroup.createStorage()
		await this._addressConfig.setPropertyGroup(this._propertyGroup.address)
	}

	public async generatePolicyFactory(): Promise<void> {
		this._policyFactory = await deployContract(this._deployer, PolicyFactory, [
			this._addressConfig.address,
		])
		await this._addressConfig.setPolicyFactory(this._policyFactory.address)
	}

	public async generatePolicySet(): Promise<void> {
		this._policySet = await deployContract(this._deployer, PolicySet, [
			this._addressConfig.address,
		])
		await this._policySet.createStorage()
		await this._addressConfig.setPolicySet(this._policySet.address)
	}

	public async generatePolicyGroup(): Promise<void> {
		this._policyGroup = await deployContract(this._deployer, PolicyGroup, [
			this._addressConfig.address,
		])
		await this._policyGroup.createStorage()
		await this._addressConfig.setPolicyGroup(this._policyGroup.address)
	}

	public async generateMarketFactory(): Promise<void> {
		this._marketFactory = await deployContract(
			this._deployer,
			MarketFactory,
			[this._addressConfig.address],
			{gasLimit: 5000000}
		)
		await this._addressConfig.setMarketFactory(this._marketFactory.address)
	}

	public async generateMarketGroup(): Promise<void> {
		this._marketGroup = await deployContract(this._deployer, MarketGroup, [
			this._addressConfig.address,
		])
		await this._addressConfig.setMarketGroup(this._marketGroup.address)
		await this._marketGroup.createStorage()
	}

	public async generateMetricsFactory(): Promise<void> {
		this._metricsFactory = await deployContract(
			this._deployer,
			MetricsFactory,
			[this._addressConfig.address]
		)
		await this._addressConfig.setMetricsFactory(this._metricsFactory.address)
	}

	public async generateMetricsGroup(): Promise<void> {
		this._metricsGroup = await deployContract(this._deployer, MetricsGroup, [
			this._addressConfig.address,
		])
		await this._addressConfig.setMetricsGroup(this._metricsGroup.address)
		await this._metricsGroup.createStorage()
	}

	public async generateWithdraw(): Promise<void> {
		const decimals = await deployContract(this._deployer, Decimals)
		link(
			Withdraw,
			'contracts/src/common/libs/Decimals.sol:Decimals',
			decimals.address
		)
		this._withdraw = await deployContract(this._deployer, Withdraw, [
			this._addressConfig.address,
		])
		await this._addressConfig.setWithdraw(this._withdraw.address)
	}

	public async generateWithdrawStorage(): Promise<void> {
		this._withdrawStorage = await deployContract(
			this._deployer,
			WithdrawStorage,
			[this._addressConfig.address]
		)
		await this._addressConfig.setWithdrawStorage(this._withdrawStorage.address)
		await this._withdrawStorage.createStorage()
	}

	public async createPolicy(contractJSON: ContractJSON): Promise<void> {
		const policyInstance = await deployContract(this._deployer, contractJSON, [
			this._addressConfig.address,
		])
		const result = await this._policyFactory.create(policyInstance.address)
		console.log(result)
	}
}
