const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	const { address } = artifacts.require('AddressConfig')

	// Allocator
	deployer.deploy(artifacts.require('Allocator'), address)

	// Dev
	deployer.deploy(artifacts.require('Dev'), address)

	// Lockup
	deployer.deploy(artifacts.require('Lockup'), address, '', '')

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

	// Property
	deployer.deploy(artifacts.require('PropertyFactory'), address)
	deployer.deploy(artifacts.require('PropertyGroup'), address)

	// Vote
	deployer.deploy(artifacts.require('VoteCounter'), address)

	// Withdraw
	deployer.deploy(artifacts.require('Withdraw'), address, '')
} as Truffle.Migration

export = handler
