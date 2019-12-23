import {AddressConfigInstance} from '../../types/truffle-contracts'

export async function setAddressConfig(
	artifacts: Truffle.Artifacts
): Promise<void> {
	const addressConfig = await getAddressConfigInstance(artifacts)
	// Allocator
	await addressConfig.setAllocator(artifacts.require('Allocator').address)
	await addressConfig.setAllocatorStorage(
		artifacts.require('AllocatorStorage').address
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

export async function getAddressConfigInstance(
	artifacts: Truffle.Artifacts
): Promise<AddressConfigInstance> {
	const AddressConfigContract = artifacts.require('AddressConfig')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const instance = await AddressConfigContract.at(AddressConfigContract.address)
	return instance
}
