/* eslint-disable @typescript-eslint/no-unused-vars */
import {IPolicyInstance, PolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance} from '../test-lib/instance'

import {collectsEth} from '../test-lib/utils/common'
import {getPropertyAddress, getPolicyAddress} from '../test-lib/utils/log'
import {validateAddressErrorMessage} from '../test-lib/utils/error'

contract('PolicyFactory', ([deployer, user1, propertyAuther, ...accounts]) => {
	before(async () => {
		await collectsEth(deployer)(accounts)
	})
	const dev = new DevProtocolInstance(deployer)
	let policy: IPolicyInstance
	describe('PolicyFactory; createPolicy', () => {
		beforeEach(async () => {
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generatePolicyGroup(),
				dev.generatePolicySet(),
				dev.generatePolicyFactory(),
				dev.generateMarketFactory(),
				dev.generateMarketGroup(),
			])
		})
		it('Returns the new Policy address when Policy implementation is passed.', async () => {
			policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			const result = await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const firstPolicyAddress = getPolicyAddress(result)
			// eslint-disable-next-line no-undef
			expect(web3.utils.isAddress(firstPolicyAddress)).to.be.equal(true)
		})
		it('If the first Policy, the Policy becomes valid.', async () => {
			policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			const result = await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const firstPolicyAddress = getPolicyAddress(result)
			const curentPolicyAddress = await dev.addressConfig.policy()
			expect(curentPolicyAddress).to.be.equal(firstPolicyAddress)
		})
		it('The first policy will be treated as voting completed.', async () => {
			policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			const result = await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const firstPolicyAddress = getPolicyAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const firstPolicy = await artifacts
				.require('Policy')
				.at(firstPolicyAddress)
			const voting = await firstPolicy.voting()
			expect(voting).to.be.equal(false)
		})
		it('If other than the first Policy, the Policy is waiting for enable by the voting.', async () => {
			policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			await dev.policyFactory.create(policy.address, {
				from: user1,
			})
			const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			const secondCreateResult = await dev.policyFactory.create(
				second.address,
				{
					from: user1,
				}
			)
			const secondPolicyAddress = getPolicyAddress(secondCreateResult)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const secondPolicy = await artifacts
				.require('Policy')
				.at(secondPolicyAddress)
			const voting = await secondPolicy.voting()
			expect(voting).to.be.equal(true)
		})
	})
	describe('PolicyFactory; convergePolicy', () => {
		const policyContract = artifacts.require('Policy')
		let firstPolicyInstance: PolicyInstance
		let createdPropertyAddress: string
		beforeEach(async () => {
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generatePolicyGroup(),
				dev.generatePolicySet(),
				dev.generatePolicyFactory(),
				dev.generateVoteCounter(),
				dev.generateMarketFactory(),
				dev.generateMarketGroup(),
				dev.generatePropertyGroup(),
				dev.generatePropertyFactory(),
				dev.generateLockup(),
				dev.generateAllocator(),
				dev.generateWithdraw(),
				dev.generateWithdrawStorage(),
				dev.generateMetricsGroup(),
				dev.generateDev(),
			])
			await dev.dev.mint(user1, 10000, {from: deployer})
			policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			const policyCreateResult = await dev.policyFactory.create(
				policy.address,
				{from: user1}
			)
			const firstPolicyAddress = getPolicyAddress(policyCreateResult)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			firstPolicyInstance = await policyContract.at(firstPolicyAddress)
			const propertyCreateResult = await dev.propertyFactory.create(
				'test',
				'TST',
				propertyAuther
			)
			createdPropertyAddress = getPropertyAddress(propertyCreateResult)
		})
		it('Calling `convergePolicy` method when approved by Policy.policyApproval.', async () => {
			// TODO
			// const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
			// const createResult = await dev.policyFactory.create(second.address, {
			// 	from: user1,
			// })
			// const secondPolicyAddress = getPolicyAddress(createResult)
			// // eslint-disable-next-line @typescript-eslint/await-thenable
			// const secondPolicyInstance = await policyContract.at(secondPolicyAddress)
			// await dev.dev.deposit(createdPropertyAddress, 10000, {from: user1})
			// await secondPolicyInstance.vote(createdPropertyAddress, true, {
			// 	from: user1,
			// })
			// const nextPolicyAddress = await dev.addressConfig.policy()
			// expect(nextPolicyAddress).to.be.equal(secondPolicyAddress)
			// const voteResult = await firstPolicyInstance
			// 	.marketVotingBlocks()
			// 	.catch((err: Error) => err)
			// validateErrorMessage(
			// 	voteResult,
			// 	"Returned values aren't valid, did it run Out of Gas?",
			// 	false
			// )
		})
		it('Should fail when a call from other than Policy.', async () => {
			const result = await dev.policyFactory
				.convergePolicy(policy.address, {from: deployer})
				.catch((err: Error) => err)
			validateAddressErrorMessage(result)
		})
	})
})
