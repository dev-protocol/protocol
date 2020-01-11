import {IPolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance, UserInstance} from '../test-lib/instance'
import {getPolicyAddress} from '../test-lib/utils'

contract('PolicyFactory', ([deployer, user, dummyProperty]) => {
	const dev = new DevProtocolInstance(deployer)
	const userInstance = new UserInstance(dev, user)
	let policy: IPolicyInstance
	before(async () => {
		await dev.generateAddressConfig()
		await dev.generatePolicyGroup()
		await dev.generatePolicySet()
		await dev.generatePolicyFactory()
		await dev.generateVoteTimes()
		await dev.generateVoteTimesStorage()
		await dev.generateMarketFactory()
		await dev.generateMarketGroup()
		policy = await userInstance.getPolicy('PolicyTest1')
	})
	describe('PolicyFactory; createPolicy', () => {
		let firstPolicyAddress: string
		it('Returns the new Policy address when Policy implementation is passed.', async () => {
			const result = await dev.policyFactory.create(policy.address, {
				from: user
			})
			firstPolicyAddress = getPolicyAddress(result)
			// eslint-disable-next-line no-undef
			expect(web3.utils.isAddress(firstPolicyAddress)).to.be.equal(true)
		})
		it('The maximum number of votes does not increase because the first policy is not eligible for voting.', async () => {
			let times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
			expect(times.toNumber()).to.be.equal(0)
		})
		it('If the first Policy, the Policy becomes valid.', async () => {
			const curentPolicyAddress = await dev.addressConfig.policy()
			expect(curentPolicyAddress).to.be.equal(firstPolicyAddress)
		})
		it('The first policy will be treated as voting completed.', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const firstPolicy = await artifacts
				.require('Policy')
				.at(firstPolicyAddress)
			const voting = await firstPolicy.voting()
			expect(voting).to.be.equal(false)
		})
		it('If other than the first Policy, the Policy is waiting for enable by the voting.', async () => {
			const policy = await userInstance.getPolicy('PolicyTest1')
			const result = await dev.policyFactory.create(policy.address, {
				from: user
			})
			const secondPolicyAddress = getPolicyAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const secondPolicy = await artifacts
				.require('Policy')
				.at(secondPolicyAddress)
			const voting = await secondPolicy.voting()
			expect(voting).to.be.equal(true)
		})
		it('The maximum number of votes is incremented.', async () => {
			let times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
			expect(times.toNumber()).to.be.equal(1)
		})
	})
	describe('A new Policy; vote', () => {
		it('A new Policy has a method that `vote`.')
		it(
			'The number of lock-ups for it Property and the accumulated Market reward will be added to the vote when a Property owner votes for.'
		)
		it(
			'The number of votes VoteCounter is added when the Property owner voted.'
		)
		it(
			'VoteCounter votes will not be added when a vote by other than Property owner voted for.'
		)

		it(
			'The number of lock-ups for it Property and the accumulated Market reward will be added to the vote against when a Property owner votes against.'
		)
		it(
			'The number of votes VoteCounter is added when the Property owner votes against.'
		)
		it(
			'VoteCounter votes will not be added when a vote by other than Property owner voted against.'
		)

		it(
			'When an account of other than Property owner votes for, the number of lock-ups in the Property by its account will be added to the vote.'
		)

		it(
			'Calling `convergePolicy` method when approved by Policy.policyApproval.'
		)

		it('Should fail when 1st args is not Property address.')
		it('Should fail voting to the already enable Policy.')
		it('Should fail to vote when after the voting period.')
		it(
			'Should fail to vote when the number of lockups and the market reward is 0.'
		)
		it('Should fail to vote when already voted.')
	})
	describe('PolicyFactory; convergePolicy', () => {
		it('Change the current Policy by passing a Policy.')
		it('Killing another Policy when changing Policy.')
		it('Should fail when a call from other than Policy.')
	})
})
