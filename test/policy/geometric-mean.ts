import {
	GeometricMeanInstance,
	TreasuryFeeInstance,
} from '../../types/truffle-contracts'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { batchRandom } from './utils'
import { validateNotOwnerErrorMessage } from '../test-lib/utils/error'
contract('GeometricMean', ([deployer, treasury, geometricMeanSetter, uesr]) => {
	let treasuryFee: TreasuryFeeInstance
	let geometricMean: GeometricMeanInstance
	let dev: DevProtocolInstance

	before(async () => {
		dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		geometricMean = await artifacts
			.require('GeometricMean')
			.new(dev.addressConfig.address)
		treasuryFee = await artifacts
			.require('TreasuryFee')
			.new(dev.addressConfig.address)
	})

	describe('GeometricMean; rewards', () => {
		it('holdersShare equals TreasuryFee', async () => {
			const method = 'rewards'
			const stake = new BigNumber(1e18).times(220000)
			expect((await geometricMean[method](stake, 1)).toString()).to.be.equal(
				(await treasuryFee[method](stake, 1)).toString()
			)
			const assets = new BigNumber(2000)
			const per1010 = new BigNumber(1e18).times(1010000)
			expect(
				(await geometricMean[method](per1010, assets)).toString()
			).to.be.equal((await treasuryFee[method](per1010, assets)).toString())
			const per2170 = new BigNumber(1e18).times(2170000)
			expect(
				(await geometricMean[method](per2170, assets)).toString()
			).to.be.equal((await treasuryFee[method](per2170, assets)).toString())
			const per9560 = new BigNumber(1e18).times(9560000)
			expect(
				(await geometricMean[method](per9560, assets)).toString()
			).to.be.equal((await treasuryFee[method](per9560, assets)).toString())
			expect((await geometricMean[method](0, 99999)).toString()).to.be.equal(
				(await treasuryFee[method](0, 99999)).toString()
			)
			const stake2 = new BigNumber(1e18).times(220000)
			expect((await geometricMean[method](stake2, 0)).toString()).to.be.equal(
				(await treasuryFee[method](stake2, 0)).toString()
			)
			const stake3 = new BigNumber(1e18).times(10000000)
			expect(
				(await geometricMean[method](stake3, 99999)).toString()
			).to.be.equal((await treasuryFee[method](stake3, 99999)).toString())
		})
	})
	describe('GeometricMean; holdersShare', () => {
		it('holdersShare equals TreasuryFee', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await geometricMean[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await geometricMean[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await geometricMean[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await geometricMean[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await geometricMean[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await geometricMean[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await geometricMean[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('GeometricMean; authenticationFee', () => {
		it('authenticationFee equals TreasuryFee', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await geometricMean[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await geometricMean[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await geometricMean[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await geometricMean[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await geometricMean[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await geometricMean[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await geometricMean[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('GeometricMean; marketApproval', () => {
		it('marketApproval equals TreasuryFee', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await geometricMean[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await geometricMean[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await geometricMean[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await geometricMean[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await geometricMean[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await geometricMean[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await geometricMean[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('GeometricMean; policyApproval', () => {
		it('policyApproval equals TreasuryFee', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect(await treasuryFee[method](a, b)).to.be.equal(
				await geometricMean[method](a, b)
			)
			expect(await treasuryFee[method](c, d)).to.be.equal(
				await geometricMean[method](c, d)
			)
			expect(await treasuryFee[method](e, f)).to.be.equal(
				await geometricMean[method](e, f)
			)
			expect(await treasuryFee[method](a, 0)).to.be.equal(
				await geometricMean[method](a, 0)
			)
			expect(await treasuryFee[method](a, 1)).to.be.equal(
				await geometricMean[method](a, 1)
			)
			expect(await treasuryFee[method](0, a)).to.be.equal(
				await geometricMean[method](0, a)
			)
			expect(await treasuryFee[method](1, a)).to.be.equal(
				await geometricMean[method](1, a)
			)
		})
	})
	describe('GeometricMean; marketVotingBlocks', () => {
		it('marketVotingBlocks equals TreasuryFee', async () => {
			const method = 'marketVotingBlocks'
			expect((await geometricMean[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('GeometricMean; policyVotingBlocks', () => {
		it('policyVotingBlocks equals TreasuryFee', async () => {
			const method = 'policyVotingBlocks'
			expect((await geometricMean[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('GeometricMean; shareOfTreasury', () => {
		it('shareOfTreasury equals TreasuryFee.', async () => {
			const method = 'shareOfTreasury'
			expect((await geometricMean[method](100)).toString()).to.be.equal(
				(await treasuryFee[method](100)).toString()
			)
			expect((await geometricMean[method](220000)).toString()).to.be.equal(
				(await treasuryFee[method](220000)).toString()
			)
			expect((await geometricMean[method](0)).toString()).to.be.equal(
				(await treasuryFee[method](0)).toString()
			)
		})
	})
	describe('GeometricMean; treasury', () => {
		it('returns the treasury address.', async () => {
			await geometricMean.setTreasury(treasury)
			const result = await geometricMean.treasury()
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
			const result = await geometricMean
				.setTreasury(treasury, {
					from: uesr,
				})
				.catch((err: Error) => err)
			validateNotOwnerErrorMessage(result)
		})
	})
	describe('GeometricMean; geometricMeanSetter', () => {
		it('returns the setter address.', async () => {
			await geometricMean.setGeometricMeanSetter(geometricMeanSetter)
			const result = await geometricMean.geometricMeanSetter()
			expect(result).to.be.equal(geometricMeanSetter)
		})
		it('the default value is 0 address.', async () => {
			const treasuryFeeTmp = await artifacts
				.require('TreasuryFee')
				.new(dev.addressConfig.address)
			const result = await treasuryFeeTmp.geometricMeanSetter()
			expect(result).to.be.equal(DEFAULT_ADDRESS)
		})
		it('No one but the owner can set the address.', async () => {
			const result = await geometricMean
				.setGeometricMeanSetter(geometricMeanSetter, {
					from: uesr,
				})
				.catch((err: Error) => err)
			validateNotOwnerErrorMessage(result)
		})
	})
})
