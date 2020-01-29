const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	const {address} = artifacts.require('TheFirstPolicy')
	const policyFactory = artifacts.require('PolicyFactory')

	policyFactory.deployed().then(factory => {
		factory.create(address)
	})
} as Truffle.Migration

export = handler
