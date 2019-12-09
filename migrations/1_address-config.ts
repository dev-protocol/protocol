const handler = function(deployer) {
	deployer.deploy(artifacts.require('AddressConfig'))
} as Truffle.Migration

export = handler
