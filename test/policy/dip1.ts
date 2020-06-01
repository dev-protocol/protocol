import {Dip1Instance} from '../../types/truffle-contracts'
import {TheInitialPolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'

const random = (): BigNumber =>
	((f) => new BigNumber(f()).times(f().slice(0, 1)))((): string =>
		Math.random().toString().replace('0.', '')
	)
const batchRandom = (): BigNumber[] => [
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
	random(),
]

contract('DIP1', ([deployer]) => {
	let dip1: Dip1Instance
	let theInitialPolicy: TheInitialPolicyInstance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip1 = await artifacts.require('DIP1').new(dev.addressConfig.address)
		theInitialPolicy = await artifacts
			.require('TheInitialPolicy')
			.new(dev.addressConfig.address)
	})

	describe('DIP1; rewards', () => {
		it('rewards equals TheInitialPolicy', async () => {
			const method = 'rewards'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theInitialPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theInitialPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theInitialPolicy[method](e, f)).toString()
			)
		})
	})
	describe('DIP1; holdersShare', () => {
		it('Returns the reward that the Property holders can receive when the reward per Property and the number of locked-ups is passed', async () => {
			const result = await dip1.holdersShare(1000000, 10000)
			expect(result.toString()).to.be.equal('510000')
		})
		it('The share is 51%', async () => {
			const result = await dip1.holdersShare(1000000, 1)
			expect(result.toString()).to.be.equal(
				new BigNumber(1000000).times(0.51).toString()
			)
		})
		it('The share is 100% when lockup is 0', async () => {
			const result = await dip1.holdersShare(1000000, 0)
			expect(result.toString()).to.be.equal('1000000')
		})
		it('Returns 0 when a passed reward is 0', async () => {
			const result = await dip1.holdersShare(0, 99999999)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('DIP1; assetValue', () => {
		it('assetValue equals TheInitialPolicy', async () => {
			const method = 'assetValue'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theInitialPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theInitialPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theInitialPolicy[method](e, f)).toString()
			)
		})
	})
	describe('DIP1; authenticationFee', () => {
		it('authenticationFee equals TheInitialPolicy', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theInitialPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theInitialPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theInitialPolicy[method](e, f)).toString()
			)
		})
	})
	describe('DIP1; marketApproval', () => {
		it('marketApproval equals TheInitialPolicy', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theInitialPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theInitialPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theInitialPolicy[method](e, f)).toString()
			)
		})
	})
	describe('DIP1; policyApproval', () => {
		it('policyApproval equals TheInitialPolicy', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theInitialPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theInitialPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theInitialPolicy[method](e, f)).toString()
			)
		})
	})
	describe('DIP1; marketVotingBlocks', () => {
		it('marketVotingBlocks equals TheInitialPolicy', async () => {
			const method = 'marketVotingBlocks'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theInitialPolicy[method]()).toString()
			)
		})
	})
	describe('DIP1; policyVotingBlocks', () => {
		it('policyVotingBlocks equals TheInitialPolicy', async () => {
			const method = 'policyVotingBlocks'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theInitialPolicy[method]()).toString()
			)
		})
	})
	describe('DIP1; abstentionPenalty', () => {
		it('abstentionPenalty equals TheInitialPolicy', async () => {
			const method = 'abstentionPenalty'
			const [a, b, c] = batchRandom()
			expect((await dip1[method](a)).toString()).to.be.equal(
				(await theInitialPolicy[method](a)).toString()
			)
			expect((await dip1[method](b)).toString()).to.be.equal(
				(await theInitialPolicy[method](b)).toString()
			)
			expect((await dip1[method](c)).toString()).to.be.equal(
				(await theInitialPolicy[method](c)).toString()
			)
		})
	})
	describe('DIP1; lockUpBlocks', () => {
		it('lockUpBlocks equals TheInitialPolicy', async () => {
			const method = 'lockUpBlocks'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theInitialPolicy[method]()).toString()
			)
		})
	})
})
