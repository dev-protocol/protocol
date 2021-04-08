import {
	Dip7Instance,
	TreasuryFeeInstance,
} from '../../types/truffle-contracts'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { batchRandom } from './utils'
import { validateNotOwnerErrorMessage } from '../test-lib/utils/error'
contract('TreasuryFee', ([deployer, treasury, uesr]) => {
	let dip7: Dip7Instance
	let treasuryFee: TreasuryFeeInstance
	let dev: DevProtocolInstance

	before(async () => {
		dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip7 = await artifacts.require('DIP7').new(dev.addressConfig.address)
		treasuryFee = await artifacts
			.require('TreasuryFee')
			.new(dev.addressConfig.address)
	})

	describe('TreasuryFee; rewards', () => {
		it('holdersShare equals DIP7', async () => {
			const method = 'rewards'
			const stake = new BigNumber(1e18).times(220000)
			expect((await dip7[method](stake, 1)).toString()).to.be.equal(
				(await treasuryFee[method](stake, 1)).toString()
			)
			const assets = new BigNumber(2000)
			const per1010 = new BigNumber(1e18).times(1010000)
			expect((await dip7[method](per1010, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per1010, assets)).toString()
			)
			const per2170 = new BigNumber(1e18).times(2170000)
			expect((await dip7[method](per2170, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per2170, assets)).toString()
			)
			const per9560 = new BigNumber(1e18).times(9560000)
			expect((await dip7[method](per9560, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per9560, assets)).toString()
			)
			expect((await dip7[method](0, 99999)).toString()).to.be.equal(
				(await treasuryFee[method](0, 99999)).toString()
			)
			const stake2 = new BigNumber(1e18).times(220000)
			expect((await dip7[method](stake2, 0)).toString()).to.be.equal(
				(await treasuryFee[method](stake2, 0)).toString()
			)
			const stake3 = new BigNumber(1e18).times(10000000)
			expect((await dip7[method](stake3, 99999)).toString()).to.be.equal(
				(await treasuryFee[method](stake3, 99999)).toString()
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
	describe('TreasuryFee; shareOfTreasury', () => {
		it("The Treasury's share (5%) comes back。", async () => {
			let result = await treasuryFee.shareOfTreasury(100)
			expect(result.toString()).to.be.equal('5')
			const value = new BigNumber(1e18).times(220000)
			result = await treasuryFee.shareOfTreasury(value)
			expect(result.toString()).to.be.equal(value.div(100).times(5).toFixed())
		})
		it('Return 0 when 0 is specified', async () => {
			const result = await treasuryFee.shareOfTreasury(0)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TreasuryFee; treasury', () => {
		it('returns the treasury address.', async () => {
			await treasuryFee.setTreasury(treasury)
			const result = await treasuryFee.treasury()
			expect(result).to.be.equal(treasury)
		})
		it('the default value is 0 address.', async () => {
			const treasuryFeeTmp = await artifacts
				.require('TreasuryFee')
				.new(dev.addressConfig.address)
			const result = await treasuryFeeTmp.treasury()
			expect(result).to.be.equal(DEFAULT_ADDRESS)
		})
		it('No one but the owner can set the address.', async () => {
			const result = await treasuryFee
				.setTreasury(treasury, {
					from: uesr,
				})
				.catch((err: Error) => err)
			validateNotOwnerErrorMessage(result)
		})
	})
})
