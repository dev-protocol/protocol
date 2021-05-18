import {
	Patch662Instance,
	TreasuryFeeInstance,
} from '../../types/truffle-contracts'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { batchRandom } from './utils'
import { validateNotOwnerErrorMessage } from '../test-lib/utils/error'

contract('Patch662', ([deployer, treasury, uesr]) => {
	let patch662: Patch662Instance
	let treasuryFee: TreasuryFeeInstance
	let dev: DevProtocolInstance

	before(async () => {
		dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.generateLockupTest()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		patch662 = await artifacts
			.require('Patch662')
			.new(dev.addressConfig.address)
		treasuryFee = await artifacts
			.require('TreasuryFee')
			.new(dev.addressConfig.address)
	})

	describe('Patch662; rewards', () => {
		it('holdersShare equals TreasuryFee', async () => {
			const method = 'rewards'
			const stake = new BigNumber(1e18).times(220000)
			expect((await patch662[method](stake, 1)).toString()).to.be.equal(
				(await treasuryFee[method](stake, 1)).toString()
			)
			const assets = new BigNumber(2000)
			const per1010 = new BigNumber(1e18).times(1010000)
			expect((await patch662[method](per1010, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per1010, assets)).toString()
			)
			const per2170 = new BigNumber(1e18).times(2170000)
			expect((await patch662[method](per2170, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per2170, assets)).toString()
			)
			const per9560 = new BigNumber(1e18).times(9560000)
			expect((await patch662[method](per9560, assets)).toString()).to.be.equal(
				(await treasuryFee[method](per9560, assets)).toString()
			)
			expect((await patch662[method](0, 99999)).toString()).to.be.equal(
				(await treasuryFee[method](0, 99999)).toString()
			)
			const stake2 = new BigNumber(1e18).times(220000)
			expect((await patch662[method](stake2, 0)).toString()).to.be.equal(
				(await treasuryFee[method](stake2, 0)).toString()
			)
			const stake3 = new BigNumber(1e18).times(10000000)
			expect((await patch662[method](stake3, 99999)).toString()).to.be.equal(
				(await treasuryFee[method](stake3, 99999)).toString()
			)
		})
	})
	describe('Patch662; holdersShare', () => {
		it('holdersShare equals TreasuryFee', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch662[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await patch662[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await patch662[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await patch662[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await patch662[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await patch662[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await patch662[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('Patch662; authenticationFee', () => {
		it('authenticationFee equals TreasuryFee', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch662[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await patch662[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await patch662[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await patch662[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await patch662[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await patch662[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await patch662[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('Patch662; marketApproval', () => {
		const e18ize = (n: number): BigNumber => new BigNumber(n).times(1e18)
		it('returns true when yes vote more 99% greater than Lockup.getAllValue', async () => {
			const method = 'marketApproval'
			await dev.lockupTest.setStorageAllValueTest(e18ize(100000))
			expect(
				await patch662[method](e18ize(100000).times(0.99).plus(1), 0)
			).to.be.equal(true)
		})
		it('returns false when yes vote less than 99% of Lockup.getAllValue', async () => {
			const method = 'marketApproval'
			await dev.lockupTest.setStorageAllValueTest(e18ize(100000))
			expect(
				await patch662[method](e18ize(100000).times(0.99).minus(1), 0)
			).to.be.equal(false)
			expect(await patch662[method](e18ize(100000).times(0.99), 0)).to.be.equal(
				false
			)
		})
	})
	describe('Patch662; policyApproval', () => {
		it('policyApproval equals TreasuryFee', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch662[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await patch662[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await patch662[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await patch662[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await patch662[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await patch662[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await patch662[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('Patch662; marketVotingBlocks', () => {
		it('marketVotingBlocks equals TreasuryFee', async () => {
			const method = 'marketVotingBlocks'
			expect((await patch662[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('Patch662; policyVotingBlocks', () => {
		it('policyVotingBlocks equals TreasuryFee', async () => {
			const method = 'policyVotingBlocks'
			expect((await patch662[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('Patch662; shareOfTreasury', () => {
		it('shareOfTreasury equals TreasuryFee', async () => {
			const method = 'shareOfTreasury'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch662[method](a)).toString()).to.be.equal(
				(await treasuryFee[method](a)).toString()
			)
			expect((await patch662[method](b)).toString()).to.be.equal(
				(await treasuryFee[method](b)).toString()
			)
			expect((await patch662[method](c)).toString()).to.be.equal(
				(await treasuryFee[method](c)).toString()
			)
			expect((await patch662[method](d)).toString()).to.be.equal(
				(await treasuryFee[method](d)).toString()
			)
			expect((await patch662[method](e)).toString()).to.be.equal(
				(await treasuryFee[method](e)).toString()
			)
			expect((await patch662[method](f)).toString()).to.be.equal(
				(await treasuryFee[method](f)).toString()
			)
		})
	})
	describe('Patch662; treasury', () => {
		it('returns the treasury address.', async () => {
			await patch662.setTreasury(treasury)
			const result = await patch662.treasury()
			expect(result).to.be.equal(treasury)
		})
		it('the default value is 0 address.', async () => {
			const tmp = await artifacts
				.require('Patch662')
				.new(dev.addressConfig.address)
			const result = await tmp.treasury()
			expect(result).to.be.equal(DEFAULT_ADDRESS)
		})
		it('Should fail to call when the sender is not owner.', async () => {
			const result = await patch662
				.setTreasury(treasury, {
					from: uesr,
				})
				.catch((err: Error) => err)
			validateNotOwnerErrorMessage(result)
		})
	})
})
