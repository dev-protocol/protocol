import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { MetricsGroup } from './lib/instance/metrics-group'
import { Lockup } from './lib/instance/lockup'
import { Withdraw } from './lib/instance/withdraw'
import { PolicyFactory } from './lib/instance/policy-factory'
import { Policy } from './lib/instance/policy'

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	CAP_SETTER: capSetter,
} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey || !capSetter) {
		return
	}

	const gasFetcher = async () => 4000000
	const gasPriceFetcher = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	// Create the new Policy
	const policy = new Policy(dev)
	const policy_current = await policy.load()
	const treasury = await policy_current.treasury()
	const policy_next = await artifacts
		.require('DIP55')
		.new(dev.addressConfig.address)
	await Promise.all([
		policy_next.setTreasury(treasury),
		policy_next.setCapSetter(capSetter),
	])

	// Create the new PolicyFactory
	const policy_factory = new PolicyFactory(dev)
	const policy_factory_current = await policy_factory.load()

	// Force attach the new Policy
	await policy_factory_current.create(policy_next.address)
	await policy_factory_current.forceAttach(
		policy_next.address,
		await dev.gasInfo
	)

	// Create the new MetricsGroup
	const metrics_group = new MetricsGroup(dev)
	const metrics_group_current = await metrics_group.load()
	const metrics_group_next = await metrics_group.create()

	// Create the LockupMigration
	const lockup = new Lockup(dev)
	const lockup_current = await lockup.load()
	const lockup_next = await lockup.create(await lockup_current.devMinter())

	// Create the new Withdraw
	const withdraw = new Withdraw(dev)
	const withdraw_current = await withdraw.load()
	const withdraw_next = await withdraw.create(
		await withdraw_current.devMinter()
	)

	// Delegate to all new contracts
	await Promise.all([
		metrics_group.changeOwner(metrics_group_current, metrics_group_next),
		lockup.changeOwner(lockup_current, lockup_next),
		withdraw.changeOwner(withdraw_current, withdraw_next),
	])

	// Set all new contracts
	await Promise.all([
		metrics_group.set(metrics_group_next),
		lockup.set(lockup_next),
		withdraw.set(withdraw_next),
	])

	callback(null)
}

export = handler
