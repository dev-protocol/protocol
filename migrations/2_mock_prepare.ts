const handler = function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	const {address} = artifacts.require('AddressConfig')

	// Allocator
	deployer.deploy(artifacts.require('Allocator'), address)
	deployer.deploy(artifacts.require('AllocationBlockNumber'), address)
	deployer.deploy(artifacts.require('PendingIncrement'), address)

	// Withdraw
	deployer.deploy(
		artifacts.require('Withdraw'),
		address,
		artifacts.require('WithdrawStorageAddressConfig').address
	)
	deployer.deploy(artifacts.require('WithdrawStorage'), address)


	// Lockup
	deployer.deploy(artifacts.require('Lockup'), address)
	deployer.deploy(artifacts.require('LockupPropertyValue'), address)
	deployer.deploy(artifacts.require('LockupValue'), address)
	deployer.deploy(artifacts.require('LockupWithdrawalStatus'), address)

	// Market
	deployer.deploy(artifacts.require('MarketFactory'), address)
	deployer.deploy(artifacts.require('MarketGroup'), address)

	// Metrics
	deployer.deploy(artifacts.require('MetricsGroup'), address)
	deployer.deploy(artifacts.require('MetricsFactory'), address)

	// Policy
	deployer.deploy(artifacts.require('PolicyFactory'), address)
	deployer.deploy(artifacts.require('PolicyGroup'), address)
	deployer.deploy(artifacts.require('PolicySet'), address)

	// Property
	deployer.deploy(artifacts.require('PropertyFactory'), address)
	deployer.deploy(artifacts.require('PropertyGroup'), address)

	// Vote
	deployer.deploy(artifacts.require('VoteCounter'), address)
	deployer.deploy(artifacts.require('VoteTimes'), address)
} as Truffle.Migration

export = handler
