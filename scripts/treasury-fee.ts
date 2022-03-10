import { DevCommonInstance } from './lib/instance/common'
import { PolicyFactory } from './lib/instance/policy-factory'
import { PropertyFactory } from './lib/instance/property-factory'
import { config } from 'dotenv'
import { ethGasStationFetcher } from '@devprotocol/util-ts'

// Caution!!!!!!!!!!!!!!!!!!
// Please set TRESUARY_ADDRESS to env file before exexute this script.

config()
const {
	CONFIG: configAddress,
	EGS_TOKEN: egsApiKey,
	TRESUARY_ADDRESS: tresauryAddress,
} = process.env

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 6721975
	const gasPriceFetcher = ethGasStationFetcher(egsApiKey)
	const dev = new DevCommonInstance(
		artifacts,
		configAddress,
		gasFetcher,
		gasPriceFetcher
	)
	await dev.prepare()

	// Policy
	const newPolicy = await artifacts
		.require('TreasuryFee')
		.new(dev.addressConfig.address, await dev.gasInfo)
	console.log('new policy was created:', newPolicy.address)
	// Tresuary
	await newPolicy.setTreasury(tresauryAddress!, await dev.gasInfo)
	console.log('tresuary address was settted:', await newPolicy.treasury())

	// PolicyFactory
	const policyFacgtory = new PolicyFactory(dev)
	const nextPolicyFactory = await policyFacgtory.create()
	await policyFacgtory.set(nextPolicyFactory)

	// Set new policy
	await nextPolicyFactory.create(newPolicy.address, await dev.gasInfo)
	console.log('new policy was joined policy group')
	await nextPolicyFactory.forceAttach(newPolicy.address, await dev.gasInfo)
	console.log('new policy was set current policy')

	// PropertyFactory
	const propertyFactory = new PropertyFactory(dev)
	const nextPropertyFactory = await propertyFactory.create()
	await propertyFactory.set(nextPropertyFactory)

	callback(undefined)
}

export = handler
