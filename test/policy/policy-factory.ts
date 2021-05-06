import { IPolicyInstance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'

import { collectsEth } from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import {
	validateNotOwnerErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'PolicyFactory',
	([deployer, dummyPolicy, user1, propertyAuther, ...accounts]) => {
		before(async () => {
			await collectsEth(deployer)(accounts)
		})
		describe('PolicyFactory; createPolicy', () => {
			const dev = new DevProtocolInstance(deployer)
			let policy: IPolicyInstance
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicyFactory(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
				])
			})
			it('If the first Policy, the Policy becomes valid.', async () => {
				policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(policy.address)
			})
			it('The first policy will be treated as voting completed.', async () => {
				policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const voting = await dev.policyGroup.voting(policy.address)
				expect(voting).to.be.equal(false)
			})
			it('If other than the first Policy, the Policy is waiting for enable by the voting.', async () => {
				policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(second.address, {
					from: user1,
				})
				const voting = await dev.policyGroup.voting(second.address)
				expect(voting).to.be.equal(true)
			})
		})
		describe('PolicyFactory; convergePolicy', () => {
			const dev = new DevProtocolInstance(deployer)
			let firstPolicyInstance: IPolicyInstance
			let createdPropertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateDev()
				await dev.generateDevMinter()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicyFactory(),
					dev.generateVoteCounter(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateAllocator(),
					dev.generateWithdraw(),
					dev.generateMetricsGroup(),
				])
				await dev.dev.mint(user1, 10000, { from: deployer })
				const policyAddress = await dev.generatePolicy(
					'PolicyTestForPolicyFactory'
				)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				firstPolicyInstance = await artifacts
					.require('PolicyTestForPolicyFactory')
					.at(policyAddress)
				const propertyCreateResult = await dev.propertyFactory.create(
					'test',
					'TST',
					propertyAuther
				)
				createdPropertyAddress = getPropertyAddress(propertyCreateResult)
				await dev.metricsGroup.__setMetricsCountPerProperty(
					createdPropertyAddress,
					1
				)
			})
			it('Calling `convergePolicy` method when approved by Policy.policyApproval.', async () => {
				let index = await dev.policyGroup.getVotingGroupIndex()
				expect(index.toNumber()).to.be.equal(0)
				let isGroup = await dev.policyGroup.isGroup(firstPolicyInstance.address)
				expect(isGroup).to.be.equal(true)
				const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(second.address, {
					from: user1,
				})
				isGroup = await dev.policyGroup.isGroup(firstPolicyInstance.address)
				expect(isGroup).to.be.equal(true)
				isGroup = await dev.policyGroup.isGroup(second.address)
				expect(isGroup).to.be.equal(true)
				await dev.dev.deposit(createdPropertyAddress, 10000, { from: user1 })
				await dev.voteCounter.votePolicy(
					second.address,
					createdPropertyAddress,
					true,
					{ from: user1 }
				)
				const nextPolicyAddress = await dev.addressConfig.policy()
				expect(nextPolicyAddress).to.be.equal(second.address)
				index = await dev.policyGroup.getVotingGroupIndex()
				expect(index.toNumber()).to.be.equal(1)
				isGroup = await dev.policyGroup.isGroup(firstPolicyInstance.address)
				expect(isGroup).to.be.equal(false)
				isGroup = await dev.policyGroup.isGroup(second.address)
				expect(isGroup).to.be.equal(true)
			})
			it('Should fail when a call from other than Policy.', async () => {
				const result = await dev.policyFactory
					.convergePolicy(dummyPolicy, { from: deployer })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicyFactory; forceAttach', () => {
			const dev = new DevProtocolInstance(deployer)
			let createdPropertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateDev()
				await dev.generateDevMinter()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicyFactory(),
					dev.generateVoteCounter(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateAllocator(),
					dev.generateWithdraw(),
					dev.generateMetricsGroup(),
				])
				await dev.dev.mint(user1, 10000, { from: deployer })
				await dev.generatePolicy('PolicyTestForPolicyFactory')
				const propertyCreateResult = await dev.propertyFactory.create(
					'test',
					'TST',
					propertyAuther
				)
				createdPropertyAddress = getPropertyAddress(propertyCreateResult)
				await dev.metricsGroup.__setMetricsCountPerProperty(
					createdPropertyAddress,
					1
				)
			})
			it('can be forced policy override by the owner.', async () => {
				const nextPolicyInstance = await artifacts
					.require('PolicyTestForPolicyFactory')
					.new()
				let isGroup = await dev.policyGroup.isGroup(nextPolicyInstance.address)
				expect(isGroup).to.be.equal(false)
				const groupIdx = await dev.policyGroup.getVotingGroupIndex()
				expect(groupIdx.toString()).to.be.equal('0')
				await dev.policyFactory.create(nextPolicyInstance.address)
				await dev.policyFactory.forceAttach(nextPolicyInstance.address)
				expect(await dev.addressConfig.policy()).to.be.equal(
					nextPolicyInstance.address
				)
				expect(
					(await dev.policyGroup.getVotingGroupIndex()).toString()
				).to.be.equal('1')
				isGroup = await dev.policyGroup.isGroup(nextPolicyInstance.address)
				expect(isGroup).to.be.equal(true)
			})
			it('can not be performed by anyone other than the owner.', async () => {
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy, { from: user1 })
					.catch((err: Error) => err)
				validateNotOwnerErrorMessage(result)
			})
			it('can not specify anything other than policy.', async () => {
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
