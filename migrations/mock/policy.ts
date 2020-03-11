import {
	AddressConfigInstance,
	PolicyFactoryInstance
} from '../../types/truffle-contracts'
import {createInstance} from './common'

export async function createPolicy(
	artifacts: Truffle.Artifacts
): Promise<void> {
	const policyFactory = await createInstance<PolicyFactoryInstance>(
		'PolicyFactory',
		artifacts
	)
	const policyContract = artifacts.require('PolicyTest1')
	await policyFactory.create(policyContract.address)
	const addressConfig = await createInstance<AddressConfigInstance>(
		'AddressConfig',
		artifacts
	)
	const policyAddress = await addressConfig.policy()
	console.log(`policy address:${policyAddress}`)
}
