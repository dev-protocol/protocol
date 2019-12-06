const handler = function(deployer) {
	const {address} = artifacts.require('AddressConfig')

	deployer.deploy(artifacts.require('Lockup'), address)
	deployer.deploy(artifacts.require('Allocator'), address)
	deployer.deploy(artifacts.require('MarketFactory'), address)
	deployer.deploy(artifacts.require('PropertyFactory'), address)
	deployer.deploy(artifacts.require('PolicyFactory'), address)
} as Truffle.Migration

export = handler
