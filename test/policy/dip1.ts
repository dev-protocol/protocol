import {Dip1Instance} from '../../types/truffle-contracts'
import {TheInitialPolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance} from '../test-lib/instance'
import BigNumber from 'bignumber.js'

const random = (): BigNumber =>
	((f) => new BigNumber(f()).times(f()))((): string =>
		Math.random().toString().replace('0.', '')
	)

contract('DIP1', ([deployer, user]) => {
	let dip1: Dip1Instance
	let theInitialPolicy: TheInitialPolicyInstance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip1 = await artifacts.require('Dip1').new(await dev.addressConfig.token())
		theInitialPolicy = await artifacts
			.require('TheInitialPolicy')
			.new(dev.addressConfig.address)
	})

	describe('DIP1; rewards', () => {
		it('rewards equals TheInitialPolicy', async () => {
			const method = 'rewards'
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
		})
	})
	describe('DIP1; holdersShare equals TheInitialPolicy', () => {
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
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
		})
	})
	describe('DIP1; authenticationFee', () => {
		it('authenticationFee equals TheInitialPolicy', async () => {
			const method = 'authenticationFee'
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
		})
	})
	describe('DIP1; marketApproval', () => {
		it('marketApproval equals TheInitialPolicy', async () => {
			const method = 'marketApproval'
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
		})
	})
	describe('DIP1; policyApproval', () => {
		it('policyApproval equals TheInitialPolicy', async () => {
			const method = 'policyApproval'
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
			)
			expect((await dip1[method](random(), random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random(), random())).toString()
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
			expect((await dip1[method](random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random())).toString()
			)
			expect((await dip1[method](random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random())).toString()
			)
			expect((await dip1[method](random())).toString()).to.be.equal(
				(await theInitialPolicy[method](random())).toString()
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
	describe('DIP1; updateTokenAddress', () => {
		it('change token address', async () => {
			const expected = '0xf6efbc6d4689dc0d90128b040d5c2cce49492bda'
			const result = await dip1
				.updateTokenAddress(expected)
				.then(async () => dip1.token())
			expect(result).to.be.equal(expected)
		})
		it('should fail to change the address when sent from non-owner', async () => {
			const before = await dip1.token()
			const result = await dip1
				.updateTokenAddress('0xf6efbc6d4689dc0d90128b040d5c2cce49492bda', {
					from: user,
				})
				.catch((err) => err)
			const after = await dip1.token()
			expect(result).to.be.instanceOf(Error)
			expect(before).to.be.equal(after)
		})
	})
})
