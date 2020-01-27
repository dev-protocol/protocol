const handler = function(deployer, _) {
	deployer.deploy(artifacts.require('AddressConfig'))
} as Truffle.Migration

export = handler
