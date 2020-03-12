import {addressConfig} from './addresses'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	// Library
	const decimals = artifacts.require('Decimals')
	deployer.deploy(decimals)

	// Allocator
	deployer.link(decimals, artifacts.require('Allocator'))
	deployer.deploy(artifacts.require('Allocator'), addressConfig)
	deployer.deploy(artifacts.require('AllocatorStorage'), addressConfig)
} as Truffle.Migration

export = handler
