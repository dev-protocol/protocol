const handler = async function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	await setAddressConfig()
} as Truffle.Migration

export = handler

async function setAddressConfig(): Promise<void> {
	const AddressConfigContract = artifacts.require('AddressConfig')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const AddressConfig = await AddressConfigContract.at(
		AddressConfigContract.address
	)
	await AddressConfig.setAllocator(artifacts.require('Allocator').address)
	await AddressConfig.setAllocatorStorage(
		artifacts.require('AllocationBlockNumber').address
	)
	await AddressConfig.setWithdraw(artifacts.require('Withdraw').address)
	await AddressConfig.setWithdrawStorage(
		artifacts.require('WithdrawStorage').address
	)
	await AddressConfig.setLockup(artifacts.require('Lockup').address)
	await AddressConfig.setLockupStorage(
		artifacts.require('LockupStorage').address
	)

	await AddressConfig.setMarketFactory(
		artifacts.require('MarketFactory').address
	)
	await AddressConfig.setMarketGroup(artifacts.require('MarketGroup').address)
	await AddressConfig.setMetricsFactory(
		artifacts.require('MetricsFactory').address
	)
	await AddressConfig.setMetricsGroup(artifacts.require('MetricsGroup').address)

	await AddressConfig.setPolicyFactory(
		artifacts.require('PolicyFactory').address
	)
	await AddressConfig.setPolicyGroup(artifacts.require('PolicyGroup').address)
	await AddressConfig.setPolicySet(artifacts.require('PolicySet').address)

	// eslint-disable-next-line no-warning-comments
	// TODO DummyDev
	// Await AddressConfig.setToken(artifacts.require('Withdraw').address)
	await AddressConfig.setPropertyFactory(
		artifacts.require('PropertyFactory').address
	)

	await AddressConfig.setPropertyGroup(
		artifacts.require('PropertyGroup').address
	)

	await AddressConfig.setVoteTimes(artifacts.require('VoteTimes').address)
	await AddressConfig.setVoteTimesStorage(
		artifacts.require('VoteTimesStorage').address
	)
	await AddressConfig.setVoteCounter(artifacts.require('VoteCounter').address)
	await AddressConfig.setVoteCounterStorage(
		artifacts.require('VoteCounterStorage').address
	)
}
