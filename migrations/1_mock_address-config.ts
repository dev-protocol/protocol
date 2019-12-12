const handler = function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	deployer.deploy(artifacts.require('AddressConfig'))
	deployer.deploy(artifacts.require('WithdrawStorageAddressConfig'))
} as Truffle.Migration

export = handler
