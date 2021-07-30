import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { PolicyGroup } from './lib/instance/policy-group'
import { PolicyFactory } from './lib/instance/policy-factory'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
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

	const policyGroup = new PolicyGroup(dev)
	const currentPolicyGroup = await policyGroup.load()
	const nextPolicyGroup = await policyGroup.create()
	await policyGroup.changeOwner(currentPolicyGroup, nextPolicyGroup)
	await policyGroup.set(nextPolicyGroup)

	const policyFactory = new PolicyFactory(dev)
	const nextPolicyFactory = await policyFactory.create()
	await policyFactory.set(nextPolicyFactory)

	await dev.addressConfig.setPolicySet(
		'0x0000000000000000000000000000000000000000',
		await dev.gasInfo
	)
	console.log('PolicySet address is 0')

	callback(null)
}

export = handler
