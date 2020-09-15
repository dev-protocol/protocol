/* eslint-disable no-undef */
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'

const {CONFIG, EGS_TOKEN} = process.env
const {log: ____log} = console
const gas = 6721975

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const fastest = createFastestGasPriceFetcher(ethgas(EGS_TOKEN), web3)

	// Generate current contract
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(CONFIG),
	])
	____log('Generated AddressConfig contract', config.address)

	const [policyGroup] = await Promise.all([
		artifacts.require('PolicyGroup').at(await config.policyGroup()),
	])
	____log('Generated PolicyGroup contract', config.address)

	// Deploy
	const nextPolicyFactory = await artifacts
		.require('PolicyFactory')
		.new(config.address, {gasPrice: await fastest(), gas})
	____log('Deployed the new PolicyFactory', nextPolicyFactory.address)

	const nextPolicyGroup = await artifacts
		.require('PolicyGroup')
		.new(config.address, {gasPrice: await fastest(), gas})
	____log('Deployed the new PolicyGroup', nextPolicyGroup.address)

	// Delegate authority
	const policyGroupStorageAddress = await policyGroup.getStorageAddress()
	____log('Got EternalStorage address that uses by PolicyGroup')
	await nextPolicyGroup.setStorage(policyGroupStorageAddress)
	____log('Set EternalStorage address to the new PolicyGroup')
	await policyGroup.changeOwner(nextPolicyGroup.address)
	____log('Delegate authority to the new PolicyGroup')

	// Enable new Contract
	await config.setPolicyFactory(nextPolicyFactory.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Updated PolicyFactory address')

	await config.setPolicyGroup(nextPolicyGroup.address, {
		gasPrice: await fastest(),
		gas,
	})
	____log('Updated PolicyGroup address')

	// Set Default Address
	await config.setPolicySet('0x0000000000000000000000000000000000000000')

	// Add policy address
	const policy = await config.policy()
	await nextPolicyGroup.addGroupOwner(policy)

	callback(null)
}

export = handler
