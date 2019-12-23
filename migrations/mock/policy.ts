import {getAddressConfigInstance} from './config'

export async function createPolicy(
	artifacts: Truffle.Artifacts
): Promise<void> {
	const policyFactoryContract = artifacts.require('PolicyFactory')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const policyFactory = await policyFactoryContract.at(
		policyFactoryContract.address
	)
	const policyContract = artifacts.require('PolicyTest1')
	await policyFactory.create(policyContract.address)
	const addressConfig = await getAddressConfigInstance(artifacts)
	const policyAddress = await addressConfig.policy()
	console.log(`policy address:${policyAddress}`)
}
