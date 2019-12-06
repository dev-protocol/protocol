const load = deployerFn => contract => (...args) =>
	(Contract => deployerFn.deploy(Contract, ...args).then(() => Contract))(
		artifacts.require(contract)
	)

const AddressConfig = artifacts.require('AddressConfig')

module.exports = (deployer, network) => {
	if (network !== 'mock') {
		return
	}

	const deploy = load(deployer)
	const {address} = AddressConfig

	deploy('Lockup')(address)
	deploy('LockupValue')(address)
	deploy('LockupPropertyValue')(address)
	deploy('LockupWithdrawalStatus')(address)
	deploy('MarketFactory')(address)
	deploy('MarketGroup')(address)
	deploy('MetricsGroup')(address)
	deploy('PropertyFactory')(address)
	deploy('PropertyGroup')(address)
	deploy('PolicyFactory')(address)
	deploy('PolicyGroup')(address)
	deploy('VoteCounter')(address)
	deploy('VoteTimes')(address)
	deploy('Allocator')(address)
}
