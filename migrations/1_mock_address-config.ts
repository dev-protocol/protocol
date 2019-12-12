const handler = function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	deployer.deploy(artifacts.require('AddressConfig'))
} as Truffle.Migration

export = handler
