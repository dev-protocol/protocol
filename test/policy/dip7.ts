import { Dip7Instance, Dip1Instance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import BigNumber from 'bignumber.js'
import { toBigNumber } from '../test-lib/utils/common'
import { batchRandom } from './utils'

contract('DIP7', ([deployer]) => {
	let dip7: Dip7Instance
	let dip1: Dip1Instance

	before(async () => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		dip7 = await artifacts.require('DIP7').new(dev.addressConfig.address)
		dip1 = await artifacts.require('DIP1').new(dev.addressConfig.address)
	})

	describe('DIP7; rewards', () => {
		const rewards = (stake: BigNumber, _asset: BigNumber): BigNumber => {
			// Rewards = Max*(1-StakingRate)^((12-(StakingRate*10))/2+1)
			const totalSupply = new BigNumber(1e18).times(10000000)
			const stakingRate = new BigNumber(stake).div(totalSupply)
			const asset = _asset.times(new BigNumber(1).minus(stakingRate))
			const max = new BigNumber('120000000000000').times(asset)
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
			const result = await dip7.rewards(stake, 1)
			const expected = rewards(stake, new BigNumber(1))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Returns 0.00012 when zero staked and one asset', async () => {
			const result = await dip7.rewards(0, 1)
			expect(result.toString()).to.be.equal('120000000000000')
			expect(
				new BigNumber(result.toString()).div(new BigNumber(1e18)).toString()
			).to.be.equal('0.00012')
		})
		it('Depends staking rate, decrease the impact of assets', async () => {
			const assets = new BigNumber(2000)
			const natural = (i: BigNumber): BigNumber => i.div(new BigNumber(1e18))
			const per1010 = new BigNumber(1e18).times(1010000)
			const per2170 = new BigNumber(1e18).times(2170000)
			const per9560 = new BigNumber(1e18).times(9560000)
			const result1 = await dip7.rewards(per1010, assets).then(toBigNumber)
			const result2 = await dip7.rewards(per2170, assets).then(toBigNumber)
			const result3 = await dip7.rewards(per9560, assets).then(toBigNumber)

			expect(result1.toString()).to.be.equal('108206904907283965')
			expect(result2.toString()).to.be.equal('44325693373049001')
			expect(result3.toString()).to.be.equal('16144344268800')
			expect(natural(result1).toString()).to.be.equal('0.108206904907283965')
			expect(natural(result2).toString()).to.be.equal('0.044325693373049001')
			expect(natural(result3).toString()).to.be.equal('0.0000161443442688')
			expect(rewards(per1010, assets).toString()).to.be.equal(
				'108206904907283965'
			)
			expect(rewards(per2170, assets).toString()).to.be.equal(
				'44325693373049001'
			)
			expect(rewards(per9560, assets).toString()).to.be.equal('16144344268800')
		})
		it('Will be correct curve', async () => {
			const one = new BigNumber(1)
			const natural = (i: BigNumber): BigNumber => i.div(new BigNumber(1e18))
			const per199 = new BigNumber(1e18).times(1990000)
			const per200 = new BigNumber(1e18).times(2000000)
			const per201 = new BigNumber(1e18).times(2010000)
			const result1 = await dip7.rewards(per199, 1).then(toBigNumber)
			const result2 = await dip7.rewards(per200, 1).then(toBigNumber)
			const result3 = await dip7.rewards(per201, 1).then(toBigNumber)

			expect(result1.toString()).to.be.equal('25361592517898')
			expect(result2.toString()).to.be.equal('25165824000000')
			expect(result3.toString()).to.be.equal('24977825272313')
			expect(natural(result1).toString()).to.be.equal('0.000025361592517898')
			expect(natural(result2).toString()).to.be.equal('0.000025165824')
			expect(natural(result3).toString()).to.be.equal('0.000024977825272313')
			expect(rewards(per199, one).toString()).to.be.equal('25361592517898')
			expect(rewards(per200, one).toString()).to.be.equal('25165824000000')
			expect(rewards(per201, one).toString()).to.be.equal('24977825272313')
		})
		it('When a number of stakes are 0', async () => {
			const result = await dip7.rewards(0, 99999)
			const expected = rewards(new BigNumber(0), new BigNumber(99999))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Returns 0 when the number of assets is 0', async () => {
			const stake = new BigNumber(1e18).times(220000)
			const result = await dip7.rewards(stake, 0)
			expect(result.toString()).to.be.equal('0')
		})
		it('Returns 0 when the staking rate is 100%', async () => {
			const stake = new BigNumber(1e18).times(10000000)
			const result = await dip7.rewards(stake, 99999)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('DIP7; holdersShare', () => {
		it('holdersShare equals DIP1', async () => {
			const method = 'holdersShare'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP7; authenticationFee', () => {
		it('authenticationFee equals DIP1', async () => {
			const method = 'authenticationFee'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP7; marketApproval', () => {
		it('marketApproval equals DIP1', async () => {
			const method = 'marketApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP7; policyApproval', () => {
		it('policyApproval equals DIP1', async () => {
			const method = 'policyApproval'
			const [a, b, c, d, e, f] = batchRandom()
			expect((await dip7[method](a, b)).toString()).to.be.equal(
				(await dip1[method](a, b)).toString()
			)
			expect((await dip7[method](c, d)).toString()).to.be.equal(
				(await dip1[method](c, d)).toString()
			)
			expect((await dip7[method](e, f)).toString()).to.be.equal(
				(await dip1[method](e, f)).toString()
			)
			expect((await dip7[method](a, 0)).toString()).to.be.equal(
				(await dip1[method](a, 0)).toString()
			)
			expect((await dip7[method](a, 1)).toString()).to.be.equal(
				(await dip1[method](a, 1)).toString()
			)
			expect((await dip7[method](0, a)).toString()).to.be.equal(
				(await dip1[method](0, a)).toString()
			)
			expect((await dip7[method](1, a)).toString()).to.be.equal(
				(await dip1[method](1, a)).toString()
			)
		})
	})
	describe('DIP7; marketVotingBlocks', () => {
		it('marketVotingBlocks equals DIP1', async () => {
			const method = 'marketVotingBlocks'
			expect((await dip7[method]()).toString()).to.be.equal(
				(await dip1[method]()).toString()
			)
		})
	})
	describe('DIP7; policyVotingBlocks', () => {
		it('policyVotingBlocks equals DIP3', async () => {
			const method = 'policyVotingBlocks'
			expect((await dip7[method]()).toString()).to.be.equal(
				(await dip1[method]()).toString()
			)
		})
	})
	describe('DIP1; shareOfTreasury', () => {
		it('shareOfTreasury equals DIP3', async () => {
			const method = 'shareOfTreasury'
			expect((await dip7[method](100)).toString()).to.be.equal(
				(await dip1[method](100)).toString()
			)
		})
	})
	describe('DIP1; treasury', () => {
		it('treasury equals DIP3', async () => {
			const method = 'treasury'
			expect((await dip7[method]()).toString()).to.be.equal(
				(await dip1[method]()).toString()
			)
		})
	})
})
