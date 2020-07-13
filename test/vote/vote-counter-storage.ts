import {VoteCounterStorageTestInstance} from '../../types/truffle-contracts'
import {toBigNumber} from '../test-lib/utils/common'

contract('VoteCounterStorageTest', ([sender, target, property, policy]) => {
	let storage: VoteCounterStorageTestInstance
	before(async () => {
		storage = await artifacts.require('VoteCounterStorageTest').new()
		await storage.createStorage()
	})
	describe('VoteCounterStorage; getStorageAlreadyVoteMarket, setStorageAlreadyVoteMarket', () => {
		it('Initial value is false.', async () => {
			const result = await storage.getStorageAlreadyVoteMarket(
				sender,
				target,
				property
			)
			expect(result).to.be.equal(false)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageAlreadyVoteMarketTest(sender, target, property)
			const result = await storage.getStorageAlreadyVoteMarket(
				sender,
				target,
				property
			)
			expect(result).to.be.equal(true)
		})
	})
	describe('VoteCounterStorage; getStorageAlreadyUseProperty, setStorageAlreadyUseProperty', () => {
		it('Initial value is false.', async () => {
			const result = await storage.getStorageAlreadyUseProperty(
				sender,
				property,
				1
			)
			expect(result).to.be.equal(false)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageAlreadyUsePropertyTest(sender, property, 1)
			const result = await storage.getStorageAlreadyUseProperty(
				sender,
				property,
				1
			)
			expect(result).to.be.equal(true)
		})
	})
	describe('VoteCounterStorage; getStorageAlreadyVotePolicy, setStorageAlreadyVotePolicy', () => {
		it('Initial value is false.', async () => {
			const result = await storage.getStorageAlreadyVotePolicy(
				sender,
				policy,
				2
			)
			expect(result).to.be.equal(false)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageAlreadyVotePolicyTest(sender, policy, 2)
			const result = await storage.getStorageAlreadyVotePolicy(
				sender,
				policy,
				2
			)
			expect(result).to.be.equal(true)
		})
	})
	describe('VoteCounterStorage; getStoragePolicyVoteCount, setStoragePolicyVoteCount', () => {
		it('Initial value is 0.', async () => {
			const result = await storage
				.getStoragePolicyVoteCount(sender, policy, false)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStoragePolicyVoteCountTest(sender, policy, true, 34)
			const result = await storage
				.getStoragePolicyVoteCount(sender, policy, true)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(34)
		})
	})
	describe('VoteCounterStorage; getStorageAgreeCount, setStorageAgreeCount', () => {
		it('Initial value is 0.', async () => {
			const result = await storage
				.getStorageAgreeCount(policy)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageAgreeCountTest(policy, 232)
			const result = await storage
				.getStorageAgreeCount(policy)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(232)
		})
	})
	describe('VoteCounterStorage; getStorageOppositeCount, setStorageOppositeCount', () => {
		it('Initial value is 0.', async () => {
			const result = await storage
				.getStorageOppositeCount(policy)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(0)
		})
		it('The set value can be taken as it is.', async () => {
			await storage.setStorageOppositeCountTest(policy, 946)
			const result = await storage
				.getStorageOppositeCount(policy)
				.then(toBigNumber)
			expect(result.toNumber()).to.be.equal(946)
		})
	})
})
