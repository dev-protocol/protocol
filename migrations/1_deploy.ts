const addressConfig = '0x1D415aa39D647834786EB9B5a333A50e9935b796'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	const decimals = artifacts.require('Decimals')

	// Library
	deployer.deploy(decimals)

	// Allocator
	deployer.link(decimals, artifacts.require('Allocator'))
	deployer.deploy(artifacts.require('Allocator'), addressConfig)

	// Market
	deployer.deploy(artifacts.require('MarketFactory'), addressConfig)
} as Truffle.Migration

export = handler
