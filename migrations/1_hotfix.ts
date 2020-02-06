const ADDRESS_CONFIG = '0x1D415aa39D647834786EB9B5a333A50e9935b796'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	deployer.deploy(artifacts.require('Allocator'), ADDRESS_CONFIG)
	deployer.deploy(artifacts.require('Lockup'), ADDRESS_CONFIG)
	deployer.deploy(artifacts.require('LockupStorage'), ADDRESS_CONFIG)
} as Truffle.Migration

export = handler
