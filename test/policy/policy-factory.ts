import { IPolicyInstance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import { collectsEth, mine } from '../test-lib/utils/common'
import {
	validateNotOwnerErrorMessage,
	validateAddressErrorMessage,
	validateErrorMessage,
} from '../test-lib/utils/error'

contract('PolicyFactory', ([deployer, dummyPolicy, user1, ...accounts]) => {
	before(async () => {
		await collectsEth(deployer)(accounts)
	})
	const init = async (): Promise<[DevProtocolInstance, IPolicyInstance]> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await Promise.all([
			dev.generatePolicyGroup(),
			dev.generatePolicyFactory(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
		])
		const policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
		return [dev, policy]
	}

	describe('PolicyFactory; create', () => {
		it('If the first Policy, the Policy becomes valid.', async () => {
			const [dev, policy] = await init()
			await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const curentPolicyAddress = await dev.addressConfig.policy()
			expect(curentPolicyAddress).to.be.equal(policy.address)
		})

		it('Added to the group.', async () => {
			const [dev, policy] = await init()
			const before = await dev.policyGroup.isGroup(policy.address)
			expect(before).to.be.equal(false)
			await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const after = await dev.policyGroup.isGroup(policy.address)
			expect(after).to.be.equal(true)
		})
		it('event was generated.', async () => {
			const [dev, policy] = await init()
			const result = await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const event = result.logs[0].args
			expect(event._from).to.be.equal(user1)
			expect(event._policy).to.be.equal(policy.address)
		})
		it('If the policy already exists, it will not be applied.', async () => {
			const [dev, policy] = await init()
			await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const secoundPolicy = await dev.getPolicy(
				'PolicyTestForPolicyFactory',
				user1
			)
			const before = await dev.policyGroup.isGroup(secoundPolicy.address)
			expect(before).to.be.equal(false)
			await dev.policyFactory.create(secoundPolicy.address, {
				from: user1,
			})
			const curentPolicyAddress = await dev.addressConfig.policy()
			expect(curentPolicyAddress).to.be.equal(policy.address)
			const after = await dev.policyGroup.isGroup(secoundPolicy.address)
			expect(after).to.be.equal(true)
		})
	})
	describe('PolicyFactory; forceAttach', () => {
		describe('failed', () => {
			it('can not be performed by anyone other than the owner.', async () => {
				const [dev] = await init()
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy, { from: user1 })
					.catch((err: Error) => err)
				validateNotOwnerErrorMessage(result)
			})
			it('can not specify anything other than policy.', async () => {
				const [dev] = await init()
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('deadline is over.', async () => {
				const [dev, policy] = await init()
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const secoundPolicy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					user1
				)
				await dev.policyFactory.create(secoundPolicy.address, {
					from: user1,
				})
				let curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(policy.address)
				await mine(10)
				const result = await dev.policyFactory
					.forceAttach(secoundPolicy.address)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'deadline is over')
				curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(policy.address)
			})
		})
		describe('success', () => {
			it('policy is force attach.', async () => {
				const [dev, policy] = await init()
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const secoundPolicy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					user1
				)
				await dev.policyFactory.create(secoundPolicy.address, {
					from: user1,
				})
				let curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(policy.address)

				await dev.policyFactory.forceAttach(secoundPolicy.address)

				curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(secoundPolicy.address)
			})
		})
	})
})
