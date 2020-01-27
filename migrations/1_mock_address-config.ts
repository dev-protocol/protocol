const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	deployer.deploy(artifacts.require('AddressConfig'))
} as Truffle.Migration

export = handler
