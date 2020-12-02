import { Dip3Instance, Dip1Instance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
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

contract('DIP3', ([deployer]) => {
	let dip3: Dip3Instance
	let dip1: Dip1Instance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip3 = await artifacts.require('DIP3').new(dev.addressConfig.address)
		dip1 = await artifacts.require('DIP1').new(dev.addressConfig.address)
	})

	describe('DIP3; rewards', () => {
		it('rewards equals DIP1', async () => {
			const method = 'rewards'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip3[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip3[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip3[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip3[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip3[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip3[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip3[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP3; holdersShare', () => {
		it('holdersShare equals DIP1', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip3[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip3[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip3[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip3[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip3[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip3[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip3[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP3; authenticationFee', () => {
		it('authenticationFee equals DIP1', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip3[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip3[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip3[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip3[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip3[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip3[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip3[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP3; marketApproval', () => {
		it('marketApproval equals DIP1', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip3[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip3[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip3[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip3[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip3[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip3[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip3[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP3; policyApproval', () => {
		it('policyApproval equals DIP1', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip3[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip3[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip3[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip3[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip3[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip3[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip3[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP3; marketVotingBlocks', () => {
		it('marketVotingBlocks equals DIP1', async () => {
			const method = 'marketVotingBlocks'
			expect((await dip3[method]()).toString()).to.be.equal(
				(await dip1[method]()).toString()
			)
		})
	})
	describe('DIP3; policyVotingBlocks', () => {
		it('policyVotingBlocks equals DIP1', async () => {
			const method = 'policyVotingBlocks'
			expect((await dip3[method]()).toString()).to.be.equal(
				(await dip1[method]()).toString()
			)
		})
	})
	describe('DIP3; lockUpBlocks', () => {
		it('lockUpBlocks equals 1', async () => {
			const method = 'lockUpBlocks'
			expect((await dip3[method]()).toString()).to.be.equal('1')
		})
	})
})
