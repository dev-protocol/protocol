import { TheFirstPolicyInstance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import { toBigNumber } from '../test-lib/utils/common'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'
import BigNumber from 'bignumber.js'

contract('TheFirstPolicy', ([deployer]) => {
	const create = async (): Promise<TheFirstPolicyInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const theFirstPolicyInstance = await artifacts
			.require('TheFirstPolicy')
			.new(dev.addressConfig.address)
		return theFirstPolicyInstance
	}

	let policy: TheFirstPolicyInstance
	let snapshot: Snapshot
	let snapshotId: string

	before(async () => {
		policy = await create()
	})

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('TheFirstPolicy; rewards', () => {
		const rewards = (stake: BigNumber, asset: BigNumber): BigNumber => {
			// Rewards = Max*(1-StakingRate)^((12-(StakingRate*10))/2+1)
			const max = new BigNumber('250000000000000').times(asset)
			const totalSupply = new BigNumber(1e18).times(10000000)
			const stakingRate = new BigNumber(stake).div(totalSupply)
			const _d = new BigNumber(1).minus(stakingRate)
			const _p = new BigNumber(12).minus(stakingRate.times(10)).div(2).plus(1)
			const p = Math.floor(_p.toNumber())
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
			const result = await policy.rewards(stake, 1)
			const expected = rewards(stake, new BigNumber(1))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Doubling the number of assets doubles the result', async () => {
			const stake = new BigNumber(1e18).times(220000)
			const result1 = await policy.rewards(stake, 1)
			const result2 = await policy.rewards(stake, 2)
			const result = new BigNumber(result2).div(2)
			expect(result.toString()).to.be.equal(result1.toString())
		})
		it('Will be correct curve', async () => {
			const one = new BigNumber(1)
			const per199 = new BigNumber(1e18).times(1990000)
			const per200 = new BigNumber(1e18).times(2000000)
			const per201 = new BigNumber(1e18).times(2010000)
			const result1 = await policy.rewards(per199, 1).then(toBigNumber)
			const result2 = await policy.rewards(per200, 1).then(toBigNumber)
			const result3 = await policy.rewards(per201, 1).then(toBigNumber)

			expect(result1.toString()).to.be.equal('65963359649131')
			expect(result2.toString()).to.be.equal('65536000000000')
			expect(result3.toString()).to.be.equal('65127829767191')
			expect(rewards(per199, one).toString()).to.be.equal('65963359649131')
			expect(rewards(per200, one).toString()).to.be.equal('65536000000000')
			expect(rewards(per201, one).toString()).to.be.equal('65127829767191')
		})
		it('When a number of stakes are 0', async () => {
			const result = await policy.rewards(0, 99999)
			const expected = rewards(new BigNumber(0), new BigNumber(99999))
			expect(result.toString()).to.be.equal(expected.toString())
		})
		it('Returns 0 when the number of assets is 0', async () => {
			const stake = new BigNumber(1e18).times(220000)
			const result = await policy.rewards(stake, 0)
			expect(result.toString()).to.be.equal('0')
		})
		it('Returns 0 when the staking rate is 100%', async () => {
			const stake = new BigNumber(1e18).times(10000000)
			const result = await policy.rewards(stake, 99999)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TheFirstPolicy; holdersShare', () => {
		it('Returns the reward that the Property holders can receive when the reward per Property and the number of locked-ups is passed', async () => {
			const result = await policy.holdersShare(1000000, 10000)
			expect(result.toString()).to.be.equal('950000')
		})
		it('The share is 95%', async () => {
			const result = await policy.holdersShare(1000000, 1)
			expect(result.toString()).to.be.equal(
				new BigNumber(1000000).times(0.95).toString()
			)
		})
		it('The share is 100% when lockup is 0', async () => {
			const result = await policy.holdersShare(1000000, 0)
			expect(result.toString()).to.be.equal('1000000')
		})
		it('Returns 0 when a passed reward is 0', async () => {
			const result = await policy.holdersShare(0, 99999999)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TheFirstPolicy; authenticationFee', () => {
		it('Returns the authentication fee when the total number of assets and the number of lockups is passed', async () => {
			const result = await policy.authenticationFee(
				20000,
				new BigNumber(100000 * 1e18)
			)
			expect(result.toString()).to.be.equal('1')
		})
		it('Returns 1 when the number of assets is 10000, locked-ups is 0', async () => {
			const result = await policy.authenticationFee(10000, 0)
			expect(result.toString()).to.be.equal('1')
		})
		it('Returns 0 when the number of assets is 9999, locked-ups is 0', async () => {
			const result = await policy.authenticationFee(9999, 0)
			expect(result.toString()).to.be.equal('0')
		})
		it('Returns 500 when the number of assets is 5000000, locked-ups is 0', async () => {
			const result = await policy.authenticationFee(5000000, 0)
			expect(result.toString()).to.be.equal('500')
		})
		it('Returns 430 when the number of assets is 5000000, locked-ups is 7000000', async () => {
			const result = await policy.authenticationFee(
				5000000,
				new BigNumber(7000000 * 1e18)
			)
			expect(result.toString()).to.be.equal('430')
		})
		it('Returns 0 when the number of assets is 5000000, locked-ups is 50000000', async () => {
			const result = await policy.authenticationFee(
				5000000,
				new BigNumber(50000000 * 1e18)
			)
			expect(result.toString()).to.be.equal('0')
		})
		it('Returns 0 when the number of assets is 10000, locked-ups is 10000000', async () => {
			const result = await policy.authenticationFee(
				10000,
				new BigNumber(10000000 * 1e18)
			)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TheFirstPolicy; marketVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Market', async () => {
			const result = await policy.marketVotingBlocks()
			expect(result.toString()).to.be.equal('525600')
		})
	})
	describe('TheFirstPolicy; policyVotingBlocks', () => {
		it('Returns the number of the blocks of the voting period for the new Policy', async () => {
			const result = await policy.policyVotingBlocks()
			expect(result.toString()).to.be.equal('525600')
		})
	})
	describe('TheFirstPolicy; shareOfTreasury', () => {
		it('Returns the share value of treasury', async () => {
			const result = await policy.shareOfTreasury(100)
			expect(result.toString()).to.be.equal('0')
		})
	})
	describe('TheFirstPolicy; treasury', () => {
		it('Returns the treasury address', async () => {
			const result = await policy.treasury()
			expect(result.toString()).to.be.equal(DEFAULT_ADDRESS)
		})
	})
	describe('TheFirstPolicy; capSetter', () => {
		it('Returns the capSetter address', async () => {
			const result = await policy.capSetter()
			expect(result.toString()).to.be.equal(DEFAULT_ADDRESS)
		})
	})
})
