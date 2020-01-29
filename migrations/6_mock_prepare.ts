const handler = function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	const {address} = artifacts.require('AddressConfig')
	const decimals = artifacts.require('Decimals')

	// Policy
	deployer.link(decimals, artifacts.require('PolicyTest1'))
	deployer.deploy(artifacts.require('PolicyTest1')) // First policy

	// Market
	deployer.deploy(artifacts.require('MarketTest1'), address)
	deployer.deploy(artifacts.require('MarketTest2'), address)
	deployer.deploy(artifacts.require('MarketTest3'), address)
} as Truffle.Migration

export = handler
