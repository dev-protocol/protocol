const load = deployerFn => contract =>
	deployerFn.deploy(artifacts.require(contract))

module.exports = (deployer, network) => {
	if (network !== 'azure') {
		return
	}

	const deploy = load(deployer)

	deploy('Allocator')
	deploy('MarketFactory')
	deploy('PropertyFactory')
	deploy('State')
}
