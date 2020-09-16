/* eslint-disable no-undef */
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'
import {config} from 'dotenv'
import {DevCommonInstance} from './lib/instance/common'
import {PolicyGroup} from './lib/instance/policy-group'
import {PolicyFactory} from './lib/instance/policy-factory'

config()
const {CONFIG: configAddress, EGS_TOKEN: egsApiKey} = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 6721975
	const gasPriceFetcher = createFastestGasPriceFetcher(ethgas(egsApiKey), web3)
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
		'0x0000000000000000000000000000000000000000'
	)
	console.log('PolicySet address is 0')

	const currentPolicy = await dev.addressConfig.policy()
	console.log(`current policy address is ${currentPolicy}`)

	await nextPolicyGroup.addGroupOwner(currentPolicy)
	console.log('current policy address was set to PolicyGroup')

	callback(null)
}

export = handler
