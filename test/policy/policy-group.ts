import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'
import {mine} from '../test-lib/utils/common'

contract(
	'PolicyGroupTest',
	([deployer, policyFactory, dummyPolicyFactory, policy, dummyPolicy]) => {
		// Const dev = new DevProtocolInstance(deployer)
		const init1 = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generatePolicyGroup()
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer,
			})
			await dev.policyGroup.addGroupWithoutSetVotingEnd(policy, {
				from: policyFactory,
			})
			return dev
		}

		const init2 = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generatePolicyGroup()
			await dev.generatePolicyFactory()
			const policy = await dev.getPolicy('PolicyTestForPolicyFactory', deployer)
			await dev.policyFactory.create(policy.address, {
				from: deployer,
			})
			return dev
		}

		describe('PolicyGroup; addGroupWithoutSetVotingEnd, isGroup', () => {
			it('When a policy address is specified', async () => {
				const dev = await init1()
				const result = await dev.policyGroup.isGroup(policy)
				expect(result).to.be.equal(true)
			})
			it('When the policy address is not specified', async () => {
				const dev = await init1()
				const result = await dev.policyGroup.isGroup(dummyPolicy)
				expect(result).to.be.equal(false)
			})
			it('Existing policy cannot be added', async () => {
				const dev = await init1()
				const result = await dev.policyGroup
					.addGroupWithoutSetVotingEnd(policy, {
						from: policyFactory,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'already group')
			})
			it('Can not execute addGroup without policyFactory address', async () => {
				const dev = await init1()
				const result = await dev.policyGroup
					.addGroupWithoutSetVotingEnd(dummyPolicy, {
						from: dummyPolicyFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicyGroup; setVotingEndBlockNumber,voting', () => {
			it('can get to see if you can vote or not.', async () => {
				const dev = await init2()
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policyFactory.create(policy.address, {
					from: deployer,
				})
				let voting = await dev.policyGroup.voting(
					await dev.addressConfig.policy()
				)
				expect(voting).to.be.equal(false)
				voting = await dev.policyGroup.voting(policy.address)
				expect(voting).to.be.equal(true)
				await mine(11)
				voting = await dev.policyGroup.voting(policy.address)
				expect(voting).to.be.equal(false)
			})
		})
	}
)

// TODO getVotingGroupIndex ,incrementVotingGroupIndex
