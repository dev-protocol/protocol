import {IPolicyInstance, PolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance, UserInstance} from '../test-lib/instance'
import {
	getPolicyAddress,
	validateErrorMessage,
	validateAddressErrorMessage,
	mine,
	getPropertyAddress,
	collectsEth
} from '../test-lib/utils'

contract(
	'PolicyFactory',
	([deployer, user1, user2, dummyProperty, propertyAuther, ...accounts]) => {
		before(async () => {
			await collectsEth(deployer)(accounts)
		})
		const dev = new DevProtocolInstance(deployer)
		const userInstance = new UserInstance(dev, user1)
		let policy: IPolicyInstance
		describe('PolicyFactory; createPolicy', () => {
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicySet(),
					dev.generatePolicyFactory(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup()
				])
			})
			it('Returns the new Policy address when Policy implementation is passed.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user1
				})
				const firstPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line no-undef
				expect(web3.utils.isAddress(firstPolicyAddress)).to.be.equal(true)
			})
			it('If the first Policy, the Policy becomes valid.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user1
				})
				const firstPolicyAddress = getPolicyAddress(result)
				const curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(firstPolicyAddress)
			})
			it('The first policy will be treated as voting completed.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(policy.address, {
					from: user1
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
				policy = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(policy.address, {
					from: user1
				})
				const second = await userInstance.getPolicy('PolicyTest1')
				const secondCreateResult = await dev.policyFactory.create(
					second.address,
					{
						from: user1
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
			it('The maximum number of votes is incremented.', async () => {
				policy = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(policy.address, {
					from: user1
				})
				let times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				await dev.policyFactory.create(second.address, {
					from: user1
				})
				times = await dev.voteTimes.getAbstentionTimes(dummyProperty)
				expect(times.toNumber()).to.be.equal(1)
			})
		})
		describe('A new Policy; vote', () => {
			const policyContract = artifacts.require('Policy')
			let firstPolicyInstance: PolicyInstance
			let createdPropertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicySet(),
					dev.generatePolicyFactory(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generateVoteCounter(),
					dev.generateVoteCounterStorage(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateLockupStorage(),
					dev.generateAllocator(),
					dev.generateAllocatorStorage(),
					dev.generateWithdraw(),
					dev.generateWithdrawStorage(),
					dev.generateDev()
				])
				await dev.dev.mint(user1, 100, {from: deployer})
				await dev.dev.mint(user2, 100, {from: deployer})
				policy = await userInstance.getPolicy('PolicyTest1')
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
			it('Should fail when 1st args is not Property address.', async () => {
				const result = await firstPolicyInstance
					.vote(dummyProperty, true)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result as Error)
			})
			it('Should fail voting to the already enable Policy.', async () => {
				const result = await firstPolicyInstance
					.vote(createdPropertyAddress, true)
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this policy is current')
			})
			it('Should fail to vote when after the voting period.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				const count = await secondPolicyInstance.policyVotingBlocks()
				await mine(count.toNumber())
				const voteResult = await secondPolicyInstance
					.vote(createdPropertyAddress, true)
					.catch((err: Error) => err)
				validateErrorMessage(voteResult as Error, 'voting deadline is over')
			})
			it('Should fail to vote when the number of lockups and the market reward is 0.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				const voteResult = await secondPolicyInstance
					.vote(createdPropertyAddress, true)
					.catch((err: Error) => err)
				validateErrorMessage(voteResult as Error, 'vote count is 0')
			})
			it('Should fail to vote when already voted.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: user1
				})
				const voteResult = await secondPolicyInstance
					.vote(createdPropertyAddress, true, {from: user1})
					.catch((err: Error) => err)
				validateErrorMessage(voteResult as Error, 'already vote')
			})
			it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote when a Property owner votes for.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				let agreeCount = await dev.voteCounter.getAgreeCount(
					secondPolicyAddress
				)
				expect(agreeCount.toNumber()).to.be.equal(0)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: propertyAuther
				})
				agreeCount = await dev.voteCounter.getAgreeCount(secondPolicyAddress)
				expect(agreeCount.toNumber()).to.be.equal(200)
			})
			it('The number of votes VoteTimes is added when the Property owner voted.', async () => {
				let times = await dev.voteTimes.getAbstentionTimes(
					createdPropertyAddress
				)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: propertyAuther
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(0)
			})
			it('VoteTimes votes will not be added when a vote by other than Property owner voted for.', async () => {
				let times = await dev.voteTimes.getAbstentionTimes(
					createdPropertyAddress
				)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: user1
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
			})
			it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote against when a Property owner votes against.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				let agreeCount = await dev.voteCounter.getAgreeCount(
					secondPolicyAddress
				)
				expect(agreeCount.toNumber()).to.be.equal(0)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
				await secondPolicyInstance.vote(createdPropertyAddress, false, {
					from: propertyAuther
				})
				agreeCount = await dev.voteCounter.getOppositeCount(secondPolicyAddress)
				expect(agreeCount.toNumber()).to.be.equal(200)
			})
			it('The number of votes VoteTimes is added when the Property owner votes against.', async () => {
				let times = await dev.voteTimes.getAbstentionTimes(
					createdPropertyAddress
				)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, false, {
					from: propertyAuther
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(0)
			})
			it('VoteCounter votes will not be added when a vote by other than Property owner voted against.', async () => {
				let times = await dev.voteTimes.getAbstentionTimes(
					createdPropertyAddress
				)
				expect(times.toNumber()).to.be.equal(0)
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, false, {
					from: user1
				})
				times = await dev.voteTimes.getAbstentionTimes(createdPropertyAddress)
				expect(times.toNumber()).to.be.equal(1)
			})
			it('When an account of other than Property owner votes for, the number of lock-ups in the Property by its account will be added to the vote.', async () => {
				const second = await userInstance.getPolicy('PolicyTest1')
				const result = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(result)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				let agreeCount = await dev.voteCounter.getAgreeCount(
					secondPolicyAddress
				)
				expect(agreeCount.toNumber()).to.be.equal(0)
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
				await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: user1
				})
				agreeCount = await dev.voteCounter.getAgreeCount(secondPolicyAddress)
				expect(agreeCount.toNumber()).to.be.equal(100)
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
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generateVoteCounter(),
					dev.generateVoteCounterStorage(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateLockupStorage(),
					dev.generateAllocator(),
					dev.generateAllocatorStorage(),
					dev.generateWithdraw(),
					dev.generateWithdrawStorage(),
					dev.generateDev()
				])
				await dev.dev.mint(user1, 10000, {from: deployer})
				policy = await userInstance.getPolicy('PolicyTest1')
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
				const second = await userInstance.getPolicy('PolicyTest1')
				const createResult = await dev.policyFactory.create(second.address, {
					from: user1
				})
				const secondPolicyAddress = getPolicyAddress(createResult)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const secondPolicyInstance = await policyContract.at(
					secondPolicyAddress
				)
				await dev.dev.deposit(createdPropertyAddress, 10000, {from: user1})
				await secondPolicyInstance.vote(createdPropertyAddress, true, {
					from: user1
				})
				const nextPolicyAddress = await dev.addressConfig.policy()
				expect(nextPolicyAddress).to.be.equal(secondPolicyAddress)
				const voteResult = await firstPolicyInstance
					.marketVotingBlocks()
					.catch((err: Error) => err)
				expect((voteResult as Error).message).to.be.equal(
					"Returned values aren't valid, did it run Out of Gas?"
				)
			})
			it('Should fail when a call from other than Policy.', async () => {
				const result = await dev.policyFactory
					.convergePolicy(policy.address, {from: deployer})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result as Error)
			})
		})
	}
)
