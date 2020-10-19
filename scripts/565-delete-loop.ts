/* eslint-disable no-undef */
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {ethgas} from './lib/api'
import {config} from 'dotenv'
import {DevCommonInstance} from './lib/instance/common'
import {PolicyGroup} from './lib/instance/policy-group'
import {PolicyFactory} from './lib/instance/policy-factory'
import {VoteCounter} from './lib/instance/vote-counter'

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

	const voteCounter = new VoteCounter(dev)
	const currentVoteCounter = await voteCounter.load()
	const nextVoteCounter = await voteCounter.create()
	await voteCounter.changeOwner(currentVoteCounter, nextVoteCounter)
	await voteCounter.set(nextVoteCounter)

	await dev.addressConfig.setPolicySet(
		'0x0000000000000000000000000000000000000000',
		await dev.gasInfo
	)
	console.log('PolicySet address is 0')

	const currentPolicy = await dev.addressConfig.policy()
	console.log(`current policy address is ${currentPolicy}`)

	await nextPolicyGroup.addGroupOwner(currentPolicy, await dev.gasInfo)
	console.log('current policy address was set to PolicyGroup')

	callback(null)
}

export = handler
