import {
	Patch780Instance,
	TreasuryFeeInstance,
} from '../../types/truffle-contracts'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { batchRandom } from './utils'
import { validateNotOwnerErrorMessage } from '../test-lib/utils/error'
import { toBigNumber } from '../test-lib/utils/common'

contract('Patch780', ([deployer, treasury, uesr]) => {
	let patch780: Patch780Instance
	let treasuryFee: TreasuryFeeInstance
	let dev: DevProtocolInstance

	before(async () => {
		dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.generateLockupTest()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		patch780 = await artifacts
			.require('Patch780')
			.new(dev.addressConfig.address)
		treasuryFee = await artifacts
			.require('TreasuryFee')
			.new(dev.addressConfig.address)
	})

	describe('Patch780; rewards', () => {
		const rewards = (stake: BigNumber, _asset: BigNumber): BigNumber => {
			// Rewards = Max*(1-StakingRate)^((12-(StakingRate*10))/2+1)
			const totalSupply = new BigNumber(1e18).times(10000000)
			const stakingRate = new BigNumber(stake).div(totalSupply)
			const asset = _asset.times(new BigNumber(1).minus(stakingRate))
			const max = new BigNumber('132000000000000').times(asset)
			const _d = new BigNumber(1).minus(stakingRate)
			const _p = new BigNumber(12).minus(stakingRate.times(10)).div(2).plus(1)
			const p = ~~_p.toNumber()
			const rp = p + 1
			const f = _p.minus(p)
			const d1 = _d.pow(p)
			const d2 = _d.pow(rp)
			const g = d1.minus(d2).times(f)
			const d = d1.minus(g)
			const expected = new BigNumber(max).times(d)
			return expected.integerValue(BigNumber.ROUND_DOWN)
		}

		it('Returns the total number of mint per block when the total number of lockups and the total number of assets is passed', async () => {
			const stake = new BigNumber(1e18).times(220000)
			const result = await patch780.rewards(stake, 1)
			const expected = rewards(stake, new BigNumber(1))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Returns 0.000132 when zero staked and one asset', async () => {
			const result = await patch780.rewards(0, 1)
			expect(result.toString()).to.be.equal('132000000000000')
			expect(
				new BigNumber(result.toString()).div(new BigNumber(1e18)).toString()
			).to.be.equal('0.000132')
		})
		it('Depends staking rate, decrease the impact of assets', async () => {
			const assets = new BigNumber(2000)
			const natural = (i: BigNumber): BigNumber => i.div(new BigNumber(1e18))
			const per1010 = new BigNumber(1e18).times(1010000)
			const per2170 = new BigNumber(1e18).times(2170000)
			const per9560 = new BigNumber(1e18).times(9560000)
			const result1 = await patch780.rewards(per1010, assets).then(toBigNumber)
			const result2 = await patch780.rewards(per2170, assets).then(toBigNumber)
			const result3 = await patch780.rewards(per9560, assets).then(toBigNumber)

			expect(result1.toString()).to.be.equal('119027595398012362')
			expect(result2.toString()).to.be.equal('48758262710353901')
			expect(result3.toString()).to.be.equal('17758778695680')
			expect(natural(result1).toString()).to.be.equal('0.119027595398012362')
			expect(natural(result2).toString()).to.be.equal('0.048758262710353901')
			expect(natural(result3).toString()).to.be.equal('0.00001775877869568')
			expect(rewards(per1010, assets).toString()).to.be.equal(
				'119027595398012362'
			)
			expect(rewards(per2170, assets).toString()).to.be.equal(
				'48758262710353901'
			)
			expect(rewards(per9560, assets).toString()).to.be.equal('17758778695680')
		})
		it('Will be correct curve', async () => {
			const one = new BigNumber(1)
			const natural = (i: BigNumber): BigNumber => i.div(new BigNumber(1e18))
			const per199 = new BigNumber(1e18).times(1990000)
			const per200 = new BigNumber(1e18).times(2000000)
			const per201 = new BigNumber(1e18).times(2010000)
			const result1 = await patch780.rewards(per199, 1).then(toBigNumber)
			const result2 = await patch780.rewards(per200, 1).then(toBigNumber)
			const result3 = await patch780.rewards(per201, 1).then(toBigNumber)

			expect(result1.toString()).to.be.equal('27897751769687')
			expect(result2.toString()).to.be.equal('27682406400000')
			expect(result3.toString()).to.be.equal('27475607799544')
			expect(natural(result1).toString()).to.be.equal('0.000027897751769687')
			expect(natural(result2).toString()).to.be.equal('0.0000276824064')
			expect(natural(result3).toString()).to.be.equal('0.000027475607799544')
			expect(rewards(per199, one).toString()).to.be.equal('27897751769687')
			expect(rewards(per200, one).toString()).to.be.equal('27682406400000')
			expect(rewards(per201, one).toString()).to.be.equal('27475607799544')
		})
		it('When a number of stakes are 0', async () => {
			const result = await patch780.rewards(0, 99999)
			const expected = rewards(new BigNumber(0), new BigNumber(99999))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Returns 0 when the number of assets is 0', async () => {
			const stake = new BigNumber(1e18).times(220000)
			const result = await patch780.rewards(stake, 0)
			expect(result.toString()).to.be.equal('0')
		})
		it('Returns 0 when the staking rate is 100%', async () => {
			const stake = new BigNumber(1e18).times(10000000)
			const result = await patch780.rewards(stake, 99999)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('Patch780; holdersShare', () => {
		it('holdersShare equals TreasuryFee', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch780[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await patch780[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await patch780[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await patch780[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await patch780[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await patch780[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await patch780[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('Patch780; authenticationFee', () => {
		it('authenticationFee equals TreasuryFee', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch780[method](a, b)).toString()).to.be.equal(
				(await treasuryFee[method](a, b)).toString()
			)
			expect((await patch780[method](c, d)).toString()).to.be.equal(
				(await treasuryFee[method](c, d)).toString()
			)
			expect((await patch780[method](e, f)).toString()).to.be.equal(
				(await treasuryFee[method](e, f)).toString()
			)
			expect((await patch780[method](a, 0)).toString()).to.be.equal(
				(await treasuryFee[method](a, 0)).toString()
			)
			expect((await patch780[method](a, 1)).toString()).to.be.equal(
				(await treasuryFee[method](a, 1)).toString()
			)
			expect((await patch780[method](0, a)).toString()).to.be.equal(
				(await treasuryFee[method](0, a)).toString()
			)
			expect((await patch780[method](1, a)).toString()).to.be.equal(
				(await treasuryFee[method](1, a)).toString()
			)
		})
	})
	describe('Patch780; marketVotingBlocks', () => {
		it('marketVotingBlocks equals TreasuryFee', async () => {
			const method = 'marketVotingBlocks'
			expect((await patch780[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('Patch780; policyVotingBlocks', () => {
		it('policyVotingBlocks equals TreasuryFee', async () => {
			const method = 'policyVotingBlocks'
			expect((await patch780[method]()).toString()).to.be.equal(
				(await treasuryFee[method]()).toString()
			)
		})
	})
	describe('Patch780; shareOfTreasury', () => {
		it('shareOfTreasury equals TreasuryFee', async () => {
			const method = 'shareOfTreasury'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await patch780[method](a)).toString()).to.be.equal(
				(await treasuryFee[method](a)).toString()
			)
			expect((await patch780[method](b)).toString()).to.be.equal(
				(await treasuryFee[method](b)).toString()
			)
			expect((await patch780[method](c)).toString()).to.be.equal(
				(await treasuryFee[method](c)).toString()
			)
			expect((await patch780[method](d)).toString()).to.be.equal(
				(await treasuryFee[method](d)).toString()
			)
			expect((await patch780[method](e)).toString()).to.be.equal(
				(await treasuryFee[method](e)).toString()
			)
			expect((await patch780[method](f)).toString()).to.be.equal(
				(await treasuryFee[method](f)).toString()
			)
		})
	})
	describe('Patch780; treasury', () => {
		it('returns the treasury address.', async () => {
			await patch780.setTreasury(treasury)
			const result = await patch780.treasury()
			expect(result).to.be.equal(treasury)
		})
		it('the default value is 0 address.', async () => {
			const tmp = await artifacts
				.require('TreasuryFee')
				.new(dev.addressConfig.address)
			const result = await tmp.treasury()
			expect(result).to.be.equal(DEFAULT_ADDRESS)
		})
		it('Should fail to call when the sender is not owner.', async () => {
			await patch780
				.setTreasury(treasury, {
					from: uesr,
				})
				.catch((err: Error) => {
					validateNotOwnerErrorMessage(err)
				})
		})
	})
})
