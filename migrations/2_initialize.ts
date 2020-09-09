const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	const {address} = artifacts.require('AddressConfig')
	const decimals = artifacts.require('Decimals')

	// Library
	deployer.deploy(decimals)

	// Allocator
	deployer.link(decimals, artifacts.require('Allocator'))
	deployer.deploy(artifacts.require('Allocator'), address)
	deployer.deploy(artifacts.require('AllocatorStorage'))

	// Dev
	deployer.deploy(artifacts.require('Dev'), address)

	// Lockup
	deployer.link(decimals, artifacts.require('Lockup'))
	deployer.deploy(artifacts.require('Lockup'), address)

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
	deployer.link(decimals, artifacts.require('Withdraw'))
	deployer.deploy(artifacts.require('Withdraw'), address)
} as Truffle.Migration

export = handler
