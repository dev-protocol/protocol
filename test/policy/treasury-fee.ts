import {
	Dip7Instance,
	TreasuryFeeInstance,
} from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { toBigNumber } from '../test-lib/utils/common'
import { batchRandom } from './utils'

contract('DIP7', ([deployer]) => {
	let dip7: Dip7Instance
	let treasuryFee: TreasuryFeeInstance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip7 = await artifacts.require('DIP7').new(dev.addressConfig.address)
		treasuryFee = await artifacts
			.require('TreasuryFee')
			.new(dev.addressConfig.address)
	})

	describe('TreasuryFee; rewards', () => {
		// TODO このテスト、どないしようか。。。
		it('holdersShare equals DIP7', async () => {
			const method = 'rewards'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('TreasuryFee; holdersShare', () => {
		it('holdersShare equals DIP7', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('TreasuryFee; authenticationFee', () => {
		it('authenticationFee equals DIP7', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('TreasuryFee; marketApproval', () => {
		it('marketApproval equals DIP7', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('TreasuryFee; policyApproval', () => {
		it('policyApproval returns absolutely false', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect(await treasuryFee[method](a, b)).to.be.equal(false)
			expect(await treasuryFee[method](c, d)).to.be.equal(false)
			expect(await treasuryFee[method](e, f)).to.be.equal(false)
			expect(await treasuryFee[method](a, 0)).to.be.equal(false)
			expect(await treasuryFee[method](a, 1)).to.be.equal(false)
			expect(await treasuryFee[method](0, a)).to.be.equal(false)
			expect(await treasuryFee[method](1, a)).to.be.equal(false)
		})
	})
	describe('TreasuryFee; marketVotingBlocks', () => {
		it('marketVotingBlocks equals DIP1', async () => {
			const method = 'marketVotingBlocks'
			expect((await dip7[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('TreasuryFee; policyVotingBlocks', () => {
		it('policyVotingBlocks equals DIP3', async () => {
			const method = 'policyVotingBlocks'
			expect((await dip7[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	// TODO shareOfTreasuryとtreasury(settreasury)のテストをかく
	// describe('TheFirstPolicy; shareOfTreasury', () => {
	// 	it('Returns the share value of treasury', async () => {
	// 		const policy = await create()
	// 		const result = await policy.shareOfTreasury(100)
	// 		expect(result.toString()).to.be.equal('5')
	// 	})
	// })
	// describe('TheFirstPolicy; treasury', () => {
	// 	it('Returns the treasury address', async () => {
	// 		const policy = await create()
	// 		const result = await policy.treasury()
	// 		expect(result.toString()).to.be.equal(DEFAULT_ADDRESS)
	// 	})
	// })
})
