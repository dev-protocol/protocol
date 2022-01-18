import { err, init } from './lockup-common'
import { DevProtocolInstance } from '../test-lib/instance'
import {
	PropertyInstance,
	PolicyTestBaseInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	mine,
	toBigNumber,
	getBlock,
	keccak256,
} from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import { waitForEvent, getEventValue } from '../test-lib/utils/event'
import { validateErrorMessage } from '../test-lib/utils/error'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'

contract('LockupTest', ([deployer, user1, user2]) => {
	let dev: DevProtocolInstance
	let property: PropertyInstance
	let snapshot: Snapshot
	let snapshotId: string

	before(async () => {
		;[dev, property] = await init(deployer, user2)
	})

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('Lockup; lockup', () => {
		it('should fail to call when sent from other than Dev Contract', async () => {
			const res = await dev.lockup
				.lockup(deployer, property.address, 10000)
				.catch(err)
			validateErrorMessage(res, 'this is illegal address')
		})
		it('should fail to call when passed address is not property contract', async () => {
			const res = await dev.dev.deposit(user1, 10000).catch(err)
			validateErrorMessage(res, 'unable to stake to unauthenticated property')
		})
		it('should fail to call when a passed value is 0', async () => {
			const res = await dev.dev.deposit(property.address, 0).catch(err)
			validateErrorMessage(res, 'illegal lockup value')
		})
		it(`should fail to call when token's transfer was failed`, async () => {
			const res = await dev.dev
				.deposit(property.address, 10000, { from: user1 })
				.catch(err)
			validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
		})
		it(`should fail to call when the passed property has not any authenticated assets`, async () => {
			const propertyAddress = getPropertyAddress(
				await dev.propertyFactory.create('test', 'TEST', deployer)
			)

			const res = await dev.dev.deposit(propertyAddress, 10000).catch(err)
			validateErrorMessage(res, 'unable to stake to unauthenticated property')
		})
		it('record transferred token as a lockup', async () => {
			dev.dev.deposit(property.address, 10000).catch(err)
			await waitForEvent(dev.lockup)('Lockedup')

			const lockedupAmount = await dev.lockup
				.getValue(property.address, deployer)
				.then(toBigNumber)
			expect(lockedupAmount.toFixed()).to.be.equal('10000')
			const lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
		})
		it('emit an event that notifies token locked-up', async () => {
			dev.dev.deposit(property.address, 10000).catch(err)
			const [_from, _property, _value] = await Promise.all([
				getEventValue(dev.lockup)('Lockedup', '_from'),
				getEventValue(dev.lockup)('Lockedup', '_property'),
				getEventValue(dev.lockup)('Lockedup', '_value'),
			])

			expect(_from).to.be.equal(deployer)
			expect(_property).to.be.equal(property.address)
			expect(_value).to.be.equal('10000')
		})
	})
	describe('Lockup; withdraw', () => {
		it('should fail to call when tokens are insufficient', async () => {
			const amount = 1000000
			await dev.dev.deposit(property.address, amount)

			const res = await dev.lockup
				.withdraw(property.address, amount + 1)
				.catch(err)
			validateErrorMessage(res, 'insufficient tokens staked')
		})
		it(`withdraw the amount passed`, async () => {
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')

			await dev.lockup.withdraw(property.address, 1000)
			lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('9000')
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
			const reward = toBigNumber(10).times(1e18)

			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.minus(9000).plus(reward).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.plus(reward).toFixed()
			)
		})
		it(`withdraw 0 amount when passed amount is 0 and non-staked user`, async () => {
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.lockup.withdraw(property.address, 0)

			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(beforeBalance.toFixed())
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.toFixed()
			)
		})
		it(`withdraw 0 amount when passed amount is 0 and past staked user`, async () => {
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			const lastBlock = await getBlock()
			await mine(3)
			await dev.lockup.withdraw(property.address, 10000)
			const block = await getBlock()
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
			const reward = toBigNumber(10)
				.times(1e18)
				.times(block - lastBlock)
			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.plus(reward).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.plus(reward).toFixed()
			)
			await mine(3)
			await dev.lockup.withdraw(property.address, 0)
			const afterBalance2 = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply2 = await dev.dev.totalSupply().then(toBigNumber)
			expect(afterBalance2.toFixed()).to.be.equal(afterBalance.toFixed())
			expect(afterTotalSupply2.toFixed()).to.be.equal(
				afterTotalSupply.toFixed()
			)
		})
		it(`withdraw just reward when passed amount is 0`, async () => {
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			await dev.dev.deposit(property.address, 10000)
			let lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')

			await dev.lockup.withdraw(property.address, 0)
			lockedupAllAmount = await dev.lockup.getAllValue().then(toBigNumber)
			expect(lockedupAllAmount.toFixed()).to.be.equal('10000')
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)
			const reward = toBigNumber(10).times(1e18)

			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.minus(10000).plus(reward).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.plus(reward).toFixed()
			)
		})
		it(`withdraw just reward when passed amount is 0 and user withdrawn by the legacy contract`, async () => {
			const beforeBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const beforeTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			const storage = await dev.lockup
				.getStorageAddress()
				.then((x) => artifacts.require('EternalStorage').at(x))
			await dev.lockup.changeOwner(deployer)
			await storage.setUint(
				keccak256('_pendingInterestWithdrawal', property.address, deployer),
				100000
			)
			await storage.changeOwner(dev.lockup.address)

			await dev.lockup.withdraw(property.address, 0)
			const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
			const afterTotalSupply = await dev.dev.totalSupply().then(toBigNumber)

			expect(afterBalance.toFixed()).to.be.equal(
				beforeBalance.plus(100000).toFixed()
			)
			expect(afterTotalSupply.toFixed()).to.be.equal(
				beforeTotalSupply.plus(100000).toFixed()
			)
		})
	})
})
