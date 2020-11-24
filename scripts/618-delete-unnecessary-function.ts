import { ethgas, createFastestGasPriceFetcher } from '@devprtcl/utils'
import { config } from 'dotenv'
import { DevCommonInstance } from './lib/instance/common'
import { PolicyGroup } from './lib/instance/policy-group'

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const gasFetcher = async () => 6721975
	const gasPriceFetcher = createFastestGasPriceFetcher(ethgas(egsApiKey))
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

	callback(null)
}

export = handler
