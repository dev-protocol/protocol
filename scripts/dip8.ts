/* eslint-disable no-undef */
const CONFIG = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [lockup] = await Promise.all([
		artifacts.require('Lockup').at(await config.lockup()),
	])
	const [marketGroup] = await Promise.all([
		artifacts.require('MarketGroup').at(await config.marketGroup()),
	])
	const [metricsGroup] = await Promise.all([
		artifacts.require('MetricsGroup').at(await config.metricsGroup()),
	])

	const [policyGroup] = await Promise.all([
		artifacts.require('PolicyGroup').at(await config.policyGroup()),
	])

	const [policySet] = await Promise.all([
		artifacts.require('PolicySet').at(await config.policySet()),
	])

	const [propertyGroup] = await Promise.all([
		artifacts.require('PropertyGroup').at(await config.propertyGroup()),
	])

	const [voteCounterStorage] = await Promise.all([
		artifacts
			.require('VoteCounterStorage')
			.at(await config.voteCounterStorage()),
	])

	// Deploy new Lockup and new Withdraw
	const nextAllocator = await artifacts.require('Allocator').new(config.address)
	____log('Deployed the new Allocator', nextAllocator.address)
	const nextLockup = await artifacts.require('Lockup').new(config.address)
	____log('Deployed the new Lockup', nextLockup.address)
	const nextMarketFactory = await artifacts
		.require('MarketFactory')
		.new(config.address)
	____log('Deployed the new MarketFactory', nextMarketFactory.address)
	const nextMarketGroup = await artifacts
		.require('MarketGroup')
		.new(config.address)
	____log('Deployed the new MarketGroup', nextMarketGroup.address)
	const nextMetricsFactory = await artifacts
		.require('MetricsFactory')
		.new(config.address)
	____log('Deployed the new MetricsFactory', nextMetricsFactory.address)
	const nextMetricsGroup = await artifacts
		.require('MetricsGroup')
		.new(config.address)
	____log('Deployed the new MetricsGroup', nextMetricsGroup.address)
	const nextPolicyFactory = await artifacts
		.require('PolicyFactory')
		.new(config.address)
	____log('Deployed the new PolicyFactory', nextPolicyFactory.address)
	const nextPolicyGroup = await artifacts
		.require('PolicyGroup')
		.new(config.address)
	____log('Deployed the new PolicyGroup', nextPolicyGroup.address)
	const nextPolicySet = await artifacts.require('PolicySet').new(config.address)
	____log('Deployed the new PolicySet', nextPolicySet.address)
	const nextPropertyFactory = await artifacts
		.require('PropertyFactory')
		.new(config.address)
	____log('Deployed the new PropertyFactory', nextPropertyFactory.address)
	const nextPropertyGroup = await artifacts
		.require('PropertyGroup')
		.new(config.address)
	____log('Deployed the new PropertyGroup', nextPropertyGroup.address)
	const nextVoteCounter = await artifacts
		.require('VoteCounter')
		.new(config.address)
	____log('Deployed the new VoteCounter', nextVoteCounter.address)

	// Delegate authority
	const lockupStorageAddress = await lockup.getStorageAddress()
	____log('Got EternalStorage address that uses by Lockup')
	await nextLockup.setStorage(lockupStorageAddress)
	____log('Set EternalStorage address to the new Lockup')
	await lockup.changeOwner(nextLockup.address)
	____log('Delegate authority to the new Lockup')

	const marketGroupStorageAddress = await marketGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by MarketGroup')
	await nextMarketGroup.setStorage(marketGroupStorageAddress)
	____log('Set EternalStorage address to the new MarketGroup')
	await marketGroup.changeOwner(nextMarketGroup.address)
	____log('Delegate authority to the new MarketGroup')

	const metricsGroupStorageAddress = await metricsGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by MetricsGroup')
	await nextMetricsGroup.setStorage(metricsGroupStorageAddress)
	____log('Set EternalStorage address to the new MetricsGroup')
	await metricsGroup.changeOwner(nextMetricsGroup.address)
	____log('Delegate authority to the new MetricsGroup')

	const policyGroupStorageAddress = await policyGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by PolicyGroup')
	await nextPolicyGroup.setStorage(policyGroupStorageAddress)
	____log('Set EternalStorage address to the new PolicyGroup')
	await policyGroup.changeOwner(nextPolicyGroup.address)
	____log('Delegate authority to the new PolicyGroup')

	const policySetStorageAddress = await policySet.getStorageAddress()
	____log('Got EternalStorage address that uses by PolicySet')
	await nextPolicySet.setStorage(policySetStorageAddress)
	____log('Set EternalStorage address to the new PolicySet')
	await policySet.changeOwner(nextPolicySet.address)
	____log('Delegate authority to the new PolicySet')

	const propertyGroupStorageAddress = await propertyGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by PropertyGroup')
	await nextPropertyGroup.setStorage(propertyGroupStorageAddress)
	____log('Set EternalStorage address to the new PropertyGroup')
	await propertyGroup.changeOwner(nextPropertyGroup.address)
	____log('Delegate authority to the new PropertyGroup')

	const voteCounterStorageAddress = await voteCounterStorage.getStorageAddress()
	____log('Got EternalStorage address that uses by VoteCounter')
	await nextVoteCounter.setStorage(voteCounterStorageAddress)
	____log('Set EternalStorage address to the new VoteCounter')
	await voteCounterStorage.changeOwner(nextVoteCounter.address)
	____log('Delegate authority to the new VoteCounter')

	// Enable new Contract
	await config.setAllocator(nextAllocator.address)
	____log('Update Allocator address')
	await config.setLockup(nextLockup.address)
	____log('Update Lockup address')
	await config.setMarketFactory(nextMarketFactory.address)
	____log('Update MarketFactory address')
	await config.setMarketGroup(nextMarketGroup.address)
	____log('Update MarketGroup address')
	await config.setMetricsFactory(nextMetricsFactory.address)
	____log('Update MetricsFactory address')
	await config.setMetricsGroup(nextMetricsGroup.address)
	____log('Update MetricsGroup address')
	await config.setPolicyFactory(nextPolicyFactory.address)
	____log('Update PolicyFactory address')
	await config.setPolicyGroup(nextPolicyGroup.address)
	____log('Update PolicyGroup address')
	await config.setPolicySet(nextPolicySet.address)
	____log('Update PolicySet address')
	await config.setPropertyFactory(nextPropertyFactory.address)
	____log('Update PropertyFactory address')
	await config.setPropertyGroup(nextPropertyGroup.address)
	____log('Update PropertyGroup address')
	await config.setVoteCounter(nextVoteCounter.address)
	____log('Update VoteCounter address')

	// Set Default Address
	await config.setVoteCounterStorage(
		'0x0000000000000000000000000000000000000000'
	)
	____log('Reset VoteCounterStorage address')
	await config.setVoteTimes('0x0000000000000000000000000000000000000000')
	____log('Reset VoteTimes address')
	await config.setVoteTimesStorage('0x0000000000000000000000000000000000000000')
	____log('Reset VoteTimesStorage address')

	callback(null)
}

export = handler
