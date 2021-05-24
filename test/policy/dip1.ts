import {
	DIP1Instance,
	TheFirstPolicyInstance,
} from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { batchRandom } from './utils'

contract('DIP1', ([deployer]) => {
	let dip1: DIP1Instance
	let theFirstPolicy: TheFirstPolicyInstance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip1 = await artifacts.require('DIP1').new(dev.addressConfig.address)
		theFirstPolicy = await artifacts
			.require('TheFirstPolicy')
			.new(dev.addressConfig.address)
	})

	describe('DIP1; rewards', () => {
		it('rewards equals TheFirstPolicy', async () => {
			const method = 'rewards'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theFirstPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theFirstPolicy[method](e, f)).toString()
			)
			expect((await dip1[method](a, 0)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 0)).toString()
			)
			expect((await dip1[method](a, 1)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 1)).toString()
			)
			expect((await dip1[method](0, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](0, a)).toString()
			)
			expect((await dip1[method](1, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](1, a)).toString()
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
	describe('DIP1; authenticationFee', () => {
		it('authenticationFee equals TheFirstPolicy', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theFirstPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theFirstPolicy[method](e, f)).toString()
			)
			expect((await dip1[method](a, 0)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 0)).toString()
			)
			expect((await dip1[method](a, 1)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 1)).toString()
			)
			expect((await dip1[method](0, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](0, a)).toString()
			)
			expect((await dip1[method](1, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](1, a)).toString()
			)
		})
	})
	describe('DIP1; marketApproval', () => {
		it('marketApproval equals TheFirstPolicy', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theFirstPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theFirstPolicy[method](e, f)).toString()
			)
			expect((await dip1[method](a, 0)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 0)).toString()
			)
			expect((await dip1[method](a, 1)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 1)).toString()
			)
			expect((await dip1[method](0, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](0, a)).toString()
			)
			expect((await dip1[method](1, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](1, a)).toString()
			)
		})
	})
	describe('DIP1; policyApproval', () => {
		it('policyApproval equals TheFirstPolicy', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip1[method](a, b)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, b)).toString()
			)
			expect((await dip1[method](c, d)).toString()).to.be.equal(
				(await theFirstPolicy[method](c, d)).toString()
			)
			expect((await dip1[method](e, f)).toString()).to.be.equal(
				(await theFirstPolicy[method](e, f)).toString()
			)
			expect((await dip1[method](a, 0)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 0)).toString()
			)
			expect((await dip1[method](a, 1)).toString()).to.be.equal(
				(await theFirstPolicy[method](a, 1)).toString()
			)
			expect((await dip1[method](0, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](0, a)).toString()
			)
			expect((await dip1[method](1, a)).toString()).to.be.equal(
				(await theFirstPolicy[method](1, a)).toString()
			)
		})
	})
	describe('DIP1; marketVotingBlocks', () => {
		it('marketVotingBlocks equals TheFirstPolicy', async () => {
			const method = 'marketVotingBlocks'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theFirstPolicy[method]()).toString()
			)
		})
	})
	describe('DIP1; policyVotingBlocks', () => {
		it('policyVotingBlocks equals TheFirstPolicy', async () => {
			const method = 'policyVotingBlocks'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theFirstPolicy[method]()).toString()
			)
		})
	})
	describe('DIP1; shareOfTreasury', () => {
		it('shareOfTreasury equals TheFirstPolicy', async () => {
			const method = 'shareOfTreasury'
			expect((await dip1[method](100)).toString()).to.be.equal(
				(await theFirstPolicy[method](100)).toString()
			)
		})
	})
	describe('DIP1; treasury', () => {
		it('treasury equals TheFirstPolicy', async () => {
			const method = 'treasury'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theFirstPolicy[method]()).toString()
			)
		})
	})
	describe('DIP1; capSetter', () => {
		it('capSetter equals TheFirstPolicy', async () => {
			const method = 'capSetter'
			expect((await dip1[method]()).toString()).to.be.equal(
				(await theFirstPolicy[method]()).toString()
			)
		})
	})
})
