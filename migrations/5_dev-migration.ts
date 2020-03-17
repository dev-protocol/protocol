const legacy = '0x98626e2c9231f03504273d55f397409defd4a093'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	const {address: next} = artifacts.require('Dev')

	deployer.deploy(artifacts.require('DevMigration'), legacy, next)
} as Truffle.Migration

export = handler
