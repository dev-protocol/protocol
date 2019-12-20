import {AddressConfigInstance} from '../types/truffle-contracts'

const handler = async function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	console.log('[set contract address to AddressConfig]')
	await setAddressConfig()
	console.log('---finish---')
	console.log('[create storage]')
	await createStorage()
	console.log('---finish---')
	console.log('[create policy]')
	await createPolicy()
	console.log('---finish---')
	console.log('[create property]')
	await createProperty()
	console.log('---finish---')
} as Truffle.Migration

export = handler

async function createProperty(): Promise<void> {
	async function create(address: string, index: number): Promise<void> {
		const propertyFactoryContract = artifacts.require('PropertyFactory')
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const propertyFactory = await propertyFactoryContract.at(
			propertyFactoryContract.address
		)
		const eventLog = await propertyFactory.create(
			`NAME${index}`,
			`SYMBOL${index}`,
			{
				from: address
			}
		)
		const propertyAddress = await eventLog.logs.filter(
			(e: {event: string}) => e.event === 'Create'
		)[0].args._property
		console.log(`property${index}`)
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`contract address:${propertyAddress}`)
		console.log(`account:${address}`)
	}

	// eslint-disable-next-line padding-line-between-statements
	const userAddresses = await web3.eth.getAccounts()
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < userAddresses.length; i++) {
		// eslint-disable-next-line no-await-in-loop
		await create(userAddresses[i], i)
	}
}

async function createStorage(): Promise<void> {
	async function create(contractName: string): Promise<void> {
		const contract = artifacts.require(contractName)
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const contractInstance = await contract.at(contract.address)
		await contractInstance.createStorage()
		const storageAddress = await contractInstance.getStorageAddress()
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`${contractName} address:${storageAddress}`)
	}

	await create('AllocatorStorage')
	await create('WithdrawStorage')
	await create('LockupStorage')
	await create('MarketGroup')
	await create('MetricsGroup')
	await create('PolicyGroup')
	await create('PolicySet')
	await create('PropertyGroup')
	await create('VoteCounterStorage')
	await create('VoteTimesStorage')
}

async function createPolicy(): Promise<void> {
	console.log(1)
	const policyFactoryContract = artifacts.require('PolicyFactory')
	console.log(2)
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const policyFactory = await policyFactoryContract.at(
		policyFactoryContract.address
	)
	const policyContract = artifacts.require('PolicyTest1')
	await policyFactory.create(policyContract.address)
	const addressConfig = await getAddressConfigInstance()
	const policyAddress = await addressConfig.policy()
	console.log(`policy address:${policyAddress}`)
}

async function getAddressConfigInstance(): Promise<AddressConfigInstance> {
	const AddressConfigContract = artifacts.require('AddressConfig')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const instance = await AddressConfigContract.at(AddressConfigContract.address)
	return instance
}

async function setAddressConfig(): Promise<void> {
	const addressConfig = await getAddressConfigInstance()
	// Allocator
	await addressConfig.setAllocator(artifacts.require('Allocator').address)
	await addressConfig.setAllocatorStorage(
		artifacts.require('AllocationBlockNumber').address
	)

	// Withdraw
	await addressConfig.setWithdraw(artifacts.require('Withdraw').address)
	await addressConfig.setWithdrawStorage(
		artifacts.require('WithdrawStorage').address
	)

	// Lockup
	await addressConfig.setLockup(artifacts.require('Lockup').address)
	await addressConfig.setLockupStorage(
		artifacts.require('LockupStorage').address
	)

	// Market
	await addressConfig.setMarketFactory(
		artifacts.require('MarketFactory').address
	)
	await addressConfig.setMarketGroup(artifacts.require('MarketGroup').address)

	// Metrics
	await addressConfig.setMetricsFactory(
		artifacts.require('MetricsFactory').address
	)
	await addressConfig.setMetricsGroup(artifacts.require('MetricsGroup').address)

	// Policy
	await addressConfig.setPolicyFactory(
		artifacts.require('PolicyFactory').address
	)
	await addressConfig.setPolicyGroup(artifacts.require('PolicyGroup').address)
	await addressConfig.setPolicySet(artifacts.require('PolicySet').address)

	// Property
	await addressConfig.setPropertyFactory(
		artifacts.require('PropertyFactory').address
	)
	await addressConfig.setPropertyGroup(
		artifacts.require('PropertyGroup').address
	)

	// Vote
	await addressConfig.setVoteTimes(artifacts.require('VoteTimes').address)
	await addressConfig.setVoteTimesStorage(
		artifacts.require('VoteTimesStorage').address
	)
	await addressConfig.setVoteCounter(artifacts.require('VoteCounter').address)
	await addressConfig.setVoteCounterStorage(
		artifacts.require('VoteCounterStorage').address
	)

	// DummyDev
	await addressConfig.setToken(artifacts.require('DummyDEV').address)
}
