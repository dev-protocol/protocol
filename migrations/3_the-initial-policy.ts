const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	const {address} = artifacts.require('AddressConfig')

	deployer.deploy(artifacts.require('TheInitialPolicy'), address)
} as Truffle.Migration

export = handler
