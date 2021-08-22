const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	// Allocator
	const allocator = artifacts.require('Allocator')
	// Const allocatorStorage = artifacts.require('AllocatorStorage')

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
	// Const policySet = artifacts.require('PolicySet')

	// Property
	const propertyFactory = artifacts.require('PropertyFactory')
	const propertyGroup = artifacts.require('PropertyGroup')

	// Vote
	// const voteCounter = artifacts.require('VoteCounter')
	// const voteCounterStorage = artifacts.require('VoteCounterStorage')
	// const voteTimes = artifacts.require('VoteTimes')
	// const voteTimesStorage = artifacts.require('VoteTimesStorage')

	// Withdraw
	const withdraw = artifacts.require('Withdraw')
	const withdrawStorage = artifacts.require('WithdrawStorage')
	;(deployer as unknown as Promise<void>)
		.then(async () => artifacts.require('AddressConfig').deployed())
		.then(async (addressConfig) =>
			Promise.all([
				addressConfig.setAllocator(allocator.address),
				// AddressConfig.setAllocatorStorage(allocatorStorage.address),
				addressConfig.setLockup(lockup.address),
				addressConfig.setLockupStorage(lockupStorage.address),
				addressConfig.setMarketFactory(marketFactory.address),
				addressConfig.setMarketGroup(marketGroup.address),
				addressConfig.setMetricsFactory(metricsFactory.address),
				addressConfig.setMetricsGroup(metricsGroup.address),
				addressConfig.setPolicyFactory(policyFactory.address),
				addressConfig.setPolicyGroup(policyGroup.address),
				// AddressConfig.setPolicySet(policySet.address),
				addressConfig.setPropertyFactory(propertyFactory.address),
				addressConfig.setPropertyGroup(propertyGroup.address),
				// AddressConfig.setVoteCounter(voteCounter.address),
				// addressConfig.setVoteCounterStorage(voteCounterStorage.address),
				// addressConfig.setVoteTimes(voteTimes.address),
				// addressConfig.setVoteTimesStorage(voteTimesStorage.address),
				addressConfig.setWithdraw(withdraw.address),
				addressConfig.setWithdrawStorage(withdrawStorage.address),
				addressConfig.setToken(token.address),
			])
		)
		.then(async () => {
			console.log('*** Setting AddressConfig is completed ***')

			return Promise.all([
				// AllocatorStorage.deployed(),
				lockupStorage.deployed(),
				marketGroup.deployed(),
				metricsGroup.deployed(),
				policyGroup.deployed(),
				// PolicySet.deployed(),
				propertyGroup.deployed(),
				// VoteCounterStorage.deployed(),
				// voteTimesStorage.deployed(),
				// withdrawStorage.deployed(),
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
