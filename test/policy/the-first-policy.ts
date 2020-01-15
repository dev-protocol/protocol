import {TheFirstPolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'

contract('TheFirstPolicy', ([deployer]) => {
	const create = async (): Promise<TheFirstPolicyInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, '10000')
		const theFirstPolicyContract = await artifacts
			.require('TheFirstPolicy')
			.new(dev.addressConfig.address)
		return theFirstPolicyContract
	}

	describe('TheFirstPolicy; rewards', () => {
		it('Returns the total number of mint per block when the total number of lockups and the total number of assets is passed', async () => {
			const policy = await create()
			const result = await policy.rewards(5000, 1)
			expect(result.toString()).to.be.equal('11718750000000')
		})
	})
	describe('TheFirstPolicy; holdersShare', () => {
		it('Returns the reward that the Property holders can receive when the reward per Property and the number of locked-ups is passed', async () => {
			const policy = await create()
			const result = await policy.holdersShare(1000000, 10000)
			expect(result.toString()).to.be.equal('950000')
		})
	})
	describe('TheFirstPolicy; assetValue', () => {
		it('Returns the asset value when the value of index calculated by Market and the number of lockups is passed', async () => {
			const policy = await create()
			const result = await policy.assetValue(543666, 6788)
			expect(result.toString()).to.be.equal('3690404808')
		})
	})
	describe('TheFirstPolicy; authenticationFee', () => {
		it('Returns the authentication fee when the total number of assets and the number of lockups is passed', async () => {
			const policy = await create()
			const result = await policy.authenticationFee(
				new BigNumber(20000 * 1e18),
				new BigNumber(500 * 1e18)
			)
			expect(result.toString()).to.be.equal(
				'4999999999999999999500000000000000000'
			)
		})
	})
	describe('TheFirstPolicy; marketApproval', () => {
		it('Returns whether the next new Market can be approved when the number of agreements and the number of protests is passed', async () => {
			const policy = await create()
			const result = await policy.marketApproval(
				new BigNumber(10 * 1e18).plus(1),
				0
			)
			expect(result).to.be.equal(true)
		})
		it('Returns false if the upvote is less than 10 times the negative vote', async () => {
			const policy = await create()
			const result = await policy.marketApproval(
				new BigNumber(10 * 1e18),
				new BigNumber(1 * 1e18)
			)
			expect(result).to.be.equal(false)
		})
	})
	describe('TheFirstPolicy; policyApproval', () => {
		it('Returns whether the next new Policy can be approved when the number of agreements and the number of protests is passed', async () => {
			const policy = await create()
			const result = await policy.policyApproval(
				new BigNumber(10 * 1e18).plus(1),
				0
			)
			expect(result).to.be.equal(true)
		})
		it('Returns false if the upvote is less than 10 times the negative vote', async () => {
			const policy = await create()
			const result = await policy.policyApproval(
				new BigNumber(10 * 1e18),
				new BigNumber(1 * 1e18)
			)
			expect(result).to.be.equal(false)
		})
	})
	describe('TheFirstPolicy; marketVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Market', async () => {
			const policy = await create()
			const result = await policy.marketVotingBlocks()
			expect(result.toString()).to.be.equal('525600')
		})
	})
	describe('TheFirstPolicy; policyVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Policy', async () => {
			const policy = await create()
			const result = await policy.policyVotingBlocks()
			expect(result.toString()).to.be.equal('525600')
		})
	})
	describe('TheFirstPolicy; abstentionPenalty', () => {
		it('Returns the number of penalty blocks when the number of abstentions is passed', async () => {
			const policy = await create()
			const result = await policy.abstentionPenalty(10)
			expect(result.toString()).to.be.equal('175200')
		})
		it('Returns 0 if the number of abstentions is less than 10', async () => {
			const policy = await create()
			const result = await policy.abstentionPenalty(9)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TheFirstPolicy; lockUpBlocks', () => {
		it('Returns the minimum number of lockup blocks.', async () => {
			const policy = await create()
			const result = await policy.lockUpBlocks()
			expect(result.toString()).to.be.equal('175200')
		})
	})
})
