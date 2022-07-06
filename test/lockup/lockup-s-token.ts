/* eslint-disable @typescript-eslint/no-floating-promises */
import { deployerBalance, err, init } from './lockup-s-token-common'
import { DevProtocolInstance } from '../test-lib/instance'
import { PropertyInstance } from '../../types/truffle-contracts'
import { mine, toBigNumber } from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import { getEventValue } from '../test-lib/utils/event'
import { validateErrorMessage } from '../test-lib/utils/error'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'

contract('LockupTest', ([deployer, , user2, user3]) => {
	const init2 = async (): Promise<
		[DevProtocolInstance, PropertyInstance, number]
	> => {
		const [dev, property] = await init(deployer, user2)
		await dev.dev.approve(dev.lockup.address, 500)
		await dev.lockup.depositToProperty(property.address, 100)
		const tokenId = await dev.sTokenManager.latestTokenId()

		return [dev, property, Number(tokenId)]
	}

	let dev: DevProtocolInstance
	let property: PropertyInstance
	let tokenId: number
	let snapshot: Snapshot
	let snapshotId: string

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('Lockup; sTokensManager', () => {
		before(async () => {
			;[dev] = await init(deployer, user2)
		})
		it('get s tokens manager address', async () => {
			const address = await dev.lockup.sTokensManager()
			expect(address).to.be.equal(dev.sTokenManager.address)
		})
	})
	describe('Lockup; depositToProperty', () => {
		before(async () => {
			;[dev, property] = await init(deployer, user2)
		})
		describe('success', () => {
			it('get nft token.', async () => {
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				const owner = await dev.sTokenManager.ownerOf(1)
				expect(owner).to.be.equal(deployer)
				const position = await dev.sTokenManager.positions(1)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(100)
				expect(position[2].toNumber()).to.be.equal(0)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('get 2 nft token.', async () => {
				const getLastStakedInterestPrice = async (): Promise<string> => {
					const [dev, property] = await init(deployer, user2)
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await mine(1)
					await dev.dev.deposit(property.address, 200)
					const value = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					return value.toFixed()
				}

				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				await dev.dev.approve(dev.lockup.address, 200)
				await dev.lockup.depositToProperty(property.address, 200)
				const owner = await dev.sTokenManager.ownerOf(2)
				expect(owner).to.be.equal(deployer)
				const position = await dev.sTokenManager.positions(2)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(200)
				const testValue = await getLastStakedInterestPrice()
				expect(position[2].toString()).to.be.equal(testValue)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('pass the 3rd option', async () => {
				await dev.dev.approve(dev.lockup.address, 100)
				// @ts-ignore
				await dev.lockup.depositToProperty(
					property.address,
					100,
					web3.utils.keccak256('ADDITIONAL_BYTES')
				)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const payload = await dev.sTokenManager.payloadOf(1)
				expect(payload).to.be.equal(web3.utils.keccak256('ADDITIONAL_BYTES'))
			})
			it('0 dev staking', async () => {
				await dev.lockup.depositToProperty(property.address, 0)
				const position = await dev.sTokenManager.positions(1)
				expect(toBigNumber(position[1]).toNumber()).to.be.equal(0)
			})
			it('generate event.', async () => {
				await dev.dev.approve(dev.lockup.address, 100)
				dev.lockup.depositToProperty(property.address, 100)
				const [_from, _property, _value] = await Promise.all([
					getEventValue(dev.lockup)('Lockedup', '_from'),
					getEventValue(dev.lockup)('Lockedup', '_property'),
					getEventValue(dev.lockup)('Lockedup', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_property).to.be.equal(property.address)
				expect(_value).to.be.equal('100')
			})
			it('set storage value.', async () => {
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('100')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('100')
			})
			it('staking dev token.', async () => {
				await dev.dev.approve(dev.lockup.address, 100)
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforePropertyBalance = await dev.dev.balanceOf(property.address)
				expect(beforeBalance.toString()).to.be.equal(deployerBalance.toString())
				expect(beforePropertyBalance.toString()).to.be.equal('0')
				await dev.lockup.depositToProperty(property.address, 100)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterPropertyBalance = await dev.dev.balanceOf(property.address)
				expect(afterBalance.toString()).to.be.equal(
					deployerBalance.minus(100).toString()
				)
				expect(afterPropertyBalance.toString()).to.be.equal('100')
			})
		})
		describe('fail', () => {
			it('Attempt to deposit money into an unauthenticated property.', async () => {
				const propertyAddress = getPropertyAddress(
					await dev.propertyFactory.create('test2', 'TEST2', user2, {
						from: user2,
					})
				)
				const res = await dev.lockup
					.depositToProperty(propertyAddress, 100)
					.catch(err)
				validateErrorMessage(res, 'unable to stake to unauthenticated property')
			})
			it('user is not holding dev.', async () => {
				const res = await dev.lockup
					.depositToProperty(property.address, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
			})
		})
	})
	describe('Lockup; deposit(update)', () => {
		before(async () => {
			;[dev, property, tokenId] = await init2()
		})
		describe('success', () => {
			it('update nft.', async () => {
				const getTestValues = async (): Promise<[string, string]> => {
					const [dev, property] = await init(deployer, user2)
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await dev.dev.deposit(property.address, 100)
					const value1 = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					const value2 = await dev.lockup
						.getStoragePendingInterestWithdrawal(property.address, deployer)
						.then(toBigNumber)
					return [value1.toFixed(), value2.toFixed()]
				}

				const beforePosition = await dev.sTokenManager.positions(tokenId)
				expect(beforePosition[0]).to.be.equal(property.address)
				expect(beforePosition[1].toNumber()).to.be.equal(100)
				expect(beforePosition[2].toNumber()).to.be.equal(0)
				expect(beforePosition[3].toNumber()).to.be.equal(0)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
				await dev.lockup.depositToPosition(tokenId, 100)
				const afterPosition = await dev.sTokenManager.positions(tokenId)
				expect(afterPosition[0]).to.be.equal(property.address)
				expect(afterPosition[1].toNumber()).to.be.equal(200)
				const [lastStakedInterestPrice, pendingInterestWithdrawal] =
					await getTestValues()
				expect(afterPosition[2].toString()).to.be.equal(lastStakedInterestPrice)
				expect(afterPosition[3].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
				expect(afterPosition[4].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
			})
			it('generate event.', async () => {
				dev.lockup.depositToPosition(tokenId, 300)
				const [_from, _property, _value] = await Promise.all([
					getEventValue(dev.lockup)('Lockedup', '_from'),
					getEventValue(dev.lockup)('Lockedup', '_property'),
					getEventValue(dev.lockup)('Lockedup', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_property).to.be.equal(property.address)
				expect(_value).to.be.equal('300')
			})
			it('set storage value.', async () => {
				await dev.lockup.depositToPosition(tokenId, 300)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('400')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('400')
			})
			it('staking dev token.', async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				const beforePropertyBalance = await dev.dev.balanceOf(property.address)
				expect(beforeBalance.toString()).to.be.equal(
					deployerBalance.minus(100).toString()
				)
				expect(beforePropertyBalance.toString()).to.be.equal('100')
				await dev.lockup.depositToPosition(tokenId, 300)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const afterPropertyBalance = await dev.dev.balanceOf(property.address)
				expect(afterBalance.toString()).to.be.equal(
					deployerBalance.minus(100).minus(300).toString()
				)
				expect(afterPropertyBalance.toString()).to.be.equal('400')
			})
		})
		describe('fail', () => {
			it('Cannot update position if sender and owner are different.', async () => {
				const res = await dev.lockup
					.depositToPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('0 dev staking is not possible.', async () => {
				const res = await dev.lockup.depositToPosition(tokenId, 0).catch(err)
				validateErrorMessage(res, 'illegal deposit amount')
			})
			it('user is not holding dev.', async () => {
				const res = await dev.lockup.depositToPosition(tokenId, 1000).catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds allowance')
			})
		})
	})
	describe('Lockup; withdrawByPosition', () => {
		before(async () => {
			;[dev, property, tokenId] = await init2()
		})
		describe('success', () => {
			it('update nft position.', async () => {
				const getTestValues = async (): Promise<[string, string]> => {
					const [dev, property] = await init(deployer, user2)
					await mine(1)
					await dev.dev.deposit(property.address, 100)
					await dev.dev.deposit(property.address, 100)
					const value1 = await dev.lockup
						.getStorageLastStakedInterestPrice(property.address, deployer)
						.then(toBigNumber)
					const value2 = await dev.lockup
						.getStoragePendingInterestWithdrawal(property.address, deployer)
						.then(toBigNumber)
					return [value1.toFixed(), value2.toFixed()]
				}

				const beforePosition = await dev.sTokenManager.positions(tokenId)
				expect(beforePosition[0]).to.be.equal(property.address)
				expect(beforePosition[1].toNumber()).to.be.equal(100)
				expect(beforePosition[2].toNumber()).to.be.equal(0)
				expect(beforePosition[3].toNumber()).to.be.equal(0)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const afterPosition = await dev.sTokenManager.positions(tokenId)
				expect(afterPosition[0]).to.be.equal(property.address)
				expect(afterPosition[1].toNumber()).to.be.equal(0)
				const [lastStakedInterestPrice, pendingInterestWithdrawal] =
					await getTestValues()
				expect(afterPosition[2].toString()).to.be.equal(lastStakedInterestPrice)
				expect(afterPosition[3].toString()).to.be.equal(
					pendingInterestWithdrawal
				)
				expect(beforePosition[4].toNumber()).to.be.equal(0)
			})
			it('get reward.', async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				await dev.lockup.withdrawByPosition(tokenId, 0)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const reward = afterBalance.minus(beforeBalance)
				expect(reward.toString()).to.be.equal('10000000000000000000')
			})
			it('reverce staking dev token.', async () => {
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const rewardPlusStakedDev = afterBalance.minus(beforeBalance)
				const stakedDev = rewardPlusStakedDev.minus('10000000000000000000')
				expect(stakedDev.toString()).to.be.equal('100')
			})
			it('set storage value.', async () => {
				await dev.lockup.withdrawByPosition(tokenId, 100)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('0')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('0')
			})
		})
		describe('fail', () => {
			it('Cannot withdraw reward if sender and owner are different.', async () => {
				const res = await dev.lockup
					.withdrawByPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('Withdrawal amount is greater than deposit amount.', async () => {
				const res = await dev.lockup.withdrawByPosition(tokenId, 200).catch(err)
				validateErrorMessage(res, 'insufficient tokens staked')
			})
		})
	})

	describe('Lockup; migrateToSTokens', () => {
		before(async () => {
			;[dev, property] = await init(deployer, user2)
		})
		describe('success', () => {
			it('generate nft token.', async () => {
				await dev.dev.deposit(property.address, 100)
				const beforeBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(beforeBalance.toNumber()).to.be.equal(0)
				await dev.lockup.migrateToSTokens(property.address)
				const afterBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(afterBalance.toNumber()).to.be.equal(1)
			})
			it('creator rewards will be carried over..', async () => {
				await dev.dev.deposit(property.address, 100)
				await mine(1)
				const reward = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)
				expect(reward.toString()).to.be.equal('10000000000000000000')
				await dev.lockup.migrateToSTokens(property.address)
				const reward2 = await dev.lockup
					.calculateWithdrawableInterestAmountByPosition(1)
					.then(toBigNumber)
				expect(reward2.toString()).to.be.equal('20000000000000000000')
				const reward3 = await dev.lockup
					.calculateWithdrawableInterestAmount(property.address, deployer)
					.then(toBigNumber)
				expect(reward3.toString()).to.be.equal('0')
				const afterBalance = await dev.sTokenManager.balanceOf(deployer)
				expect(afterBalance.toNumber()).to.be.equal(1)
			})
			it('update storage data.', async () => {
				await dev.dev.deposit(property.address, 100)
				await dev.lockup.migrateToSTokens(property.address)
				const pendingInterestWithdrawal =
					await dev.lockup.getStoragePendingInterestWithdrawal(
						property.address,
						deployer
					)
				const value = await dev.lockup.getStorageValue(
					property.address,
					deployer
				)
				expect(pendingInterestWithdrawal.toNumber()).to.be.equal(0)
				expect(value.toNumber()).to.be.equal(0)
			})
			it('update position information.', async () => {
				await dev.dev.deposit(property.address, 100)
				await dev.lockup.migrateToSTokens(property.address)
				const position = await dev.sTokenManager.positions(1)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(100)
				expect(position[2].toNumber()).to.be.equal(0)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
		})
		describe('fail', () => {
			it('Not staking.', async () => {
				const res = await dev.lockup
					.migrateToSTokens(property.address)
					.catch(err)
				validateErrorMessage(res, 'not staked')
			})
			it('Different users.', async () => {
				await dev.dev.deposit(property.address, 100)
				const res = await dev.lockup
					.migrateToSTokens(property.address, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'not staked')
			})
		})
	})
})
