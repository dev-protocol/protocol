import { DevProtocolInstance } from '../test-lib/instance'
import { mine } from '../test-lib/utils/common'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'PolicyGroupTest',
	([deployer, policyFactory, dummyPolicyFactory, dummyPolicy]) => {
		const init = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generatePolicyGroup()
			await dev.generatePolicyFactory()
			const policy = await dev.getPolicy('PolicyTestForPolicyFactory', deployer)
			await dev.policyFactory.create(policy.address, {
				from: deployer,
			})
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer,
			})
			return dev
		}

		describe('PolicyGroup; addGroup, isGroup', () => {
			it('When a policy address is specified', async () => {
				const dev = await init()
				const currentPolicy = await dev.addressConfig.policy()

				const result = await dev.policyGroup.isGroup(currentPolicy)
				expect(result).to.be.equal(true)
			})
			it('When the policy address is not specified', async () => {
				const dev = await init()
				const result = await dev.policyGroup.isGroup(dummyPolicy)
				expect(result).to.be.equal(false)
			})
			it('can add new policy', async () => {
				const dev = await init()
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policyGroup.addGroup(policy.address, {
					from: policyFactory,
				})

				const result = await dev.policyGroup.isGroup(policy.address)
				expect(result).to.be.equal(true)
			})
			it('can add new policy', async () => {
				const dev = await init()
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policyGroup.addGroup(policy.address, {
					from: policyFactory,
				})

				const result = await dev.policyGroup.isGroup(policy.address)
				expect(result).to.be.equal(true)
			})
			it('Existing policy cannot be added', async () => {
				const dev = await init()
				const currentPolicy = await dev.addressConfig.policy()
				const result = await dev.policyGroup
					.addGroup(currentPolicy, {
						from: policyFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already group')
			})
			it('Can not execute addGroup without policyFactory address', async () => {
				const dev = await init()
				const result = await dev.policyGroup
					.addGroup(dummyPolicy, {
						from: dummyPolicyFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicyGroup; isDuringVotingPeriod', () => {
			it('If it is during the voting period, true will come back.', async () => {
				const dev = await init()
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policyGroup.addGroup(policy.address, {
					from: policyFactory,
				})
				let isDuringVotingPeriod = await dev.policyGroup.isDuringVotingPeriod(
					policy.address
				)
				expect(isDuringVotingPeriod).to.be.equal(true)
				await mine(10)
				isDuringVotingPeriod = await dev.policyGroup.isDuringVotingPeriod(
					policy.address
				)
				expect(isDuringVotingPeriod).to.be.equal(false)
			})
		})
	}
)
