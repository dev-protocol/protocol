import {AddressConfigInstance} from '../../types/truffle-contracts'
import {createInstance} from './common'

export async function setAddressConfig(
	artifacts: Truffle.Artifacts
): Promise<void> {
	const addressConfig = await createInstance<AddressConfigInstance>(
		'AddressConfig',
		artifacts
	)
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
