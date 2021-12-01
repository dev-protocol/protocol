const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	// Allocator
	const allocator = artifacts.require('Allocator')

	// Dev
	const token = artifacts.require('Dev')

	// Lockup
	const lockup = artifacts.require('Lockup')
	const lockupStorage = artifacts.require('LockupStorage')

	// Market
	const marketFactory = artifacts.require('MarketFactory')
	const marketGroup = artifacts.require('MarketGroup')

	// Metrics
	const metricsFactory = artifacts.require('MetricsFactory')
	const metricsGroup = artifacts.require('MetricsGroup')

	// Policy
	const policyFactory = artifacts.require('PolicyFactory')
	const policyGroup = artifacts.require('PolicyGroup')

	// Property
	const propertyFactory = artifacts.require('PropertyFactory')
	const propertyGroup = artifacts.require('PropertyGroup')

	// Withdraw
	const withdraw = artifacts.require('Withdraw')
	const withdrawStorage = artifacts.require('WithdrawStorage')
	;(deployer as unknown as Promise<void>)
		.then(async () => artifacts.require('AddressConfig').deployed())
		.then(async (addressConfig) =>
			Promise.all([
				addressConfig.setAllocator(allocator.address),
				addressConfig.setLockup(lockup.address),
				addressConfig.setLockupStorage(lockupStorage.address),
				addressConfig.setMarketFactory(marketFactory.address),
				addressConfig.setMarketGroup(marketGroup.address),
				addressConfig.setMetricsFactory(metricsFactory.address),
				addressConfig.setMetricsGroup(metricsGroup.address),
				addressConfig.setPolicyFactory(policyFactory.address),
				addressConfig.setPolicyGroup(policyGroup.address),
				addressConfig.setPropertyFactory(propertyFactory.address),
				addressConfig.setPropertyGroup(propertyGroup.address),
				addressConfig.setWithdraw(withdraw.address),
				addressConfig.setWithdrawStorage(withdrawStorage.address),
				addressConfig.setToken(token.address),
			])
		)
		.then(async () => {
			console.log('*** Setting AddressConfig is completed ***')

			return Promise.all([
				lockupStorage.deployed(),
				marketGroup.deployed(),
				metricsGroup.deployed(),
				policyGroup.deployed(),
				propertyGroup.deployed(),
				withdrawStorage.deployed(),
			])
		})
		.then(async (storages) =>
			Promise.all(storages.map(async (x) => x.createStorage()))
		)
		.then(() => {
			console.log(
				'*** Storage creation for all storage contracts are completed ***'
			)
		})
		.catch((err) => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
