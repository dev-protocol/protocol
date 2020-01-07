import {DevProtocolInstance} from '../test-lib/instance'
import {validateErrorMessage} from '../test-lib/error-utils'

contract(
	'PolicyGroupTest',
	([deployer, policyFactory, dummyPolicyFactory, policy, dummyPolicy]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generatePolicyGroup()
			await dev.generatePolicySet()
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer
			})
			await dev.policyGroup.addGroup(policy, {from: policyFactory})
		})
		describe('PolicyGroup; addGroup, isGroup', () => {
			it('When a policy address is specified', async () => {
				const result = await dev.policyGroup.isGroup(policy)
				expect(result).to.be.equal(true)
			})
			it('When the policy address is not specified', async () => {
				const result = await dev.policyGroup.isGroup(dummyPolicy)
				expect(result).to.be.equal(false)
			})
			it('Existing policy cannot be added', async () => {
				const result = await dev.policyGroup
					.addGroup(policy, {
						from: policyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'already enabled')
			})
			it('Can not execute addGroup without policyFactory address', async () => {
				const result = await dev.policyGroup
					.addGroup(dummyPolicy, {
						from: dummyPolicyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('PolicyGroup; deleteGroup', () => {
			it('Existing addresses can be deleted', async () => {
				await dev.policyGroup.deleteGroup(policy, {from: policyFactory})
				const result = await dev.policyGroup.isGroup(policy)
				expect(result).to.be.equal(false)
			})
			it('Non-existent addresses cannot be deleted', async () => {
				const result = await dev.policyGroup
					.deleteGroup(policy, {from: policyFactory})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'not enabled')
			})
			it('Can not execute deleteGroup without policyFactory address', async () => {
				const result = await dev.policyGroup
					.deleteGroup(policy, {
						from: dummyPolicyFactory
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
	}
)
