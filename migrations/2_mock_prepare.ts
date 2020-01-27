const handler = function(deployer, _) {
	const {address} = artifacts.require('AddressConfig')

	// Library
	deployer.deploy(artifacts.require('Decimals'))

	// Allocator
	deployer.link(artifacts.require('Decimals'), artifacts.require('Allocator'))
	deployer.deploy(artifacts.require('Allocator'), address)
	deployer.deploy(artifacts.require('AllocatorStorage'), address)

	// Withdraw
	deployer.link(artifacts.require('Decimals'), artifacts.require('Withdraw'))
	deployer.deploy(artifacts.require('Withdraw'), address)
	deployer.deploy(artifacts.require('WithdrawStorage'), address)

	// Lockup
	deployer.link(artifacts.require('Decimals'), artifacts.require('Lockup'))
	deployer.deploy(artifacts.require('Lockup'), address)
	deployer.deploy(artifacts.require('LockupStorage'), address)

	// Market
	deployer.deploy(artifacts.require('MarketFactory'), address)
	deployer.deploy(artifacts.require('MarketGroup'), address)

	// Metrics
	deployer.deploy(artifacts.require('MetricsFactory'), address)
	deployer.deploy(artifacts.require('MetricsGroup'), address)

	// Policy
	deployer.deploy(artifacts.require('PolicyFactory'), address)
	deployer.deploy(artifacts.require('PolicyGroup'), address)
	deployer.deploy(artifacts.require('PolicySet'), address)
	deployer.link(artifacts.require('Decimals'), artifacts.require('PolicyTest1'))
	deployer.deploy(artifacts.require('PolicyTest1')) // First policy

	// Property
	deployer.deploy(artifacts.require('PropertyFactory'), address)
	deployer.deploy(artifacts.require('PropertyGroup'), address)

	// Vote
	deployer.deploy(artifacts.require('VoteCounter'), address)
	deployer.deploy(artifacts.require('VoteCounterStorage'), address)
	deployer.deploy(artifacts.require('VoteTimes'), address)
	deployer.deploy(artifacts.require('VoteTimesStorage'), address)

	// Dev
	deployer.deploy(artifacts.require('Dev'), address)

	// Market
	deployer.deploy(artifacts.require('MarketTest1'), address)
	deployer.deploy(artifacts.require('MarketTest2'), address)
	deployer.deploy(artifacts.require('MarketTest3'), address)
} as Truffle.Migration

export = handler
