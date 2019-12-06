const load = deployerFn => contract => (...args) =>
	(Contract => deployerFn.deploy(Contract, ...args).then(() => Contract))(
		artifacts.require(contract)
	)

module.exports = (deployer, network) => {
	if (network !== 'development') {
		return
	}

	const deploy = load(deployer)

	deploy('AddressConfig')()
}
