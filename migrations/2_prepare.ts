const handler = function(deployer) {
	const {address} = artifacts.require('AddressConfig')

	// Allocator
	deployer.deploy(artifacts.require('Allocator'), address)
	deployer.deploy(artifacts.require('Allocation'), address)
	deployer.deploy(artifacts.require('LastWithdrawalPrice'), address)
	deployer.deploy(artifacts.require('PendingWithdrawal'), address)

	// lockup
	deployer.deploy(artifacts.require('Lockup'), address)
	deployer.deploy(artifacts.require('LockupPropertyValue'), address)
	deployer.deploy(artifacts.require('LockupValue'), address)
	deployer.deploy(artifacts.require('LockupWithdrawalStatus'), address)

	// market
	deployer.deploy(artifacts.require('MarketFactory'), address)
	deployer.deploy(artifacts.require('MarketGroup'), address)

	//metrics
	deployer.deploy(artifacts.require('MetricsGroup'), address)

	// policy
	deployer.deploy(artifacts.require('PolicyFactory'), address)
	deployer.deploy(artifacts.require('PolicyGroup'))

	// property
	deployer.deploy(artifacts.require('PropertyFactory'), address)
	deployer.deploy(artifacts.require('PropertyGroup'), address)

	// vote
	deployer.deploy(artifacts.require('VoteCounter'), address)
	deployer.deploy(artifacts.require('VoteTimes'), address)
} as Truffle.Migration

export = handler
