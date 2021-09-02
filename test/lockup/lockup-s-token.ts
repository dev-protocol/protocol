import { DevProtocolInstance } from '../test-lib/instance'
import { PropertyInstance } from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import { toBigNumber } from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import { getEventValue } from '../test-lib/utils/event'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('LockupTest', ([deployer, user1, user2, user3]) => {
	const deployerBalance = new BigNumber(1e18).times(10000000)
	const init = async (): Promise<[DevProtocolInstance, PropertyInstance]> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.generateSTokenManager()
		await Promise.all([
			dev.generateAllocator(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
			dev.generateMetricsFactory(),
			dev.generateMetricsGroup(),
			dev.generateLockup(),
			dev.generateWithdraw(),
			dev.generatePropertyFactory(),
			dev.generatePropertyGroup(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
		])
		await dev.dev.mint(deployer, deployerBalance)
		const policyAddress = await dev.generatePolicy('PolicyTestBase')
		// eslint-disable-next-line @typescript-eslint/await-thenable
		const policy = await artifacts.require('PolicyTestBase').at(policyAddress)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', user2, {
				from: user2,
			})
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress),
		])

		await dev.addressConfig.setMetricsFactory(deployer)
		await dev.metricsGroup.addGroup(
			(
				await dev.createMetrics(deployer, property.address)
			).address
		)

		await dev.lockup.update()

		return [dev, property]
	}

	const init2 = async (): Promise<
		[DevProtocolInstance, PropertyInstance, number]
	> => {
		const [dev, property] = await init()
		await dev.dev.approve(dev.lockup.address, 500)
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		dev.lockup.depositToProperty(property.address, 100)
		const [_from, _tokenId, _value] = await Promise.all([
			getEventValue(dev.lockup)('Deposited', '_from'),
			getEventValue(dev.lockup)('Deposited', '_tokenId'),
			getEventValue(dev.lockup)('Deposited', '_value'),
		])

		return [dev, property, Number(_tokenId)]
	}

	const err = (error: Error): Error => error

	describe('Lockup; sTokensManager', () => {
		it('get s tokens manager address', async () => {
			const [dev] = await init()

			const address = await dev.lockup.sTokensManager()
			expect(address).to.be.equal(dev.sTokenManager.address)
		})
	})
	describe('Lockup; depositToProperty', () => {
		describe('success', () => {
			it('get nft token.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				const owner = await dev.sTokenManager.ownerOf(1)
				expect(owner).to.be.equal(deployer)
				const position = await dev.sTokenManager.positions(1)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(100)
				// TODO ここ0でええんやろうか
				expect(position[2].toNumber()).to.be.equal(0)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('get 2 nft token.', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				await dev.lockup.depositToProperty(property.address, 100)
				await dev.dev.approve(dev.lockup.address, 200)
				await dev.lockup.depositToProperty(property.address, 200)
				const owner = await dev.sTokenManager.ownerOf(2)
				expect(owner).to.be.equal(deployer)
				const position_1 = await dev.sTokenManager.positions(1)
				const position = await dev.sTokenManager.positions(2)
				expect(position[0]).to.be.equal(property.address)
				expect(position[1].toNumber()).to.be.equal(200)
				// TODO ここ0でええんやろうか
				expect(position[2].toString()).to.be.equal(
					'200000000000000000000000000000000000'
				)
				expect(position[3].toNumber()).to.be.equal(0)
				expect(position[4].toNumber()).to.be.equal(0)
			})
			it('generate event(Lockedup).', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
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
			it('generate event(Deposited).', async () => {
				const [dev, property] = await init()
				await dev.dev.approve(dev.lockup.address, 100)
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				dev.lockup.depositToProperty(property.address, 100)
				const [_from, _tokenId, _value] = await Promise.all([
					getEventValue(dev.lockup)('Deposited', '_from'),
					getEventValue(dev.lockup)('Deposited', '_tokenId'),
					getEventValue(dev.lockup)('Deposited', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_tokenId).to.be.equal('1')
				expect(_value).to.be.equal('100')
			})
			it('set storage value.', async () => {
				const [dev, property] = await init()
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
				const [dev, property] = await init()
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
				const [dev] = await init()
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
			it('0 dev staking is not possible.', async () => {
				const [dev, property] = await init()
				const res = await dev.lockup
					.depositToProperty(property.address, 0)
					.catch(err)
				validateErrorMessage(res, 'illegal deposit amount')
			})
			it('user is not holding dev.', async () => {
				const [dev, property] = await init()
				const res = await dev.lockup
					.depositToProperty(property.address, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds balance')
			})
		})
	})
	describe('Lockup; deposit(update)', () => {
		describe('success', () => {
			it('update nft.', async () => {
				const [dev, property, tokenId] = await init2()
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
				// TODO これでええんやろうか。。。なんか不安になてきた
				expect(afterPosition[2].toString()).to.be.equal(
					'100000000000000000000000000000000000'
				)
				// TODO これでええんやろうか。。。なんか不安になてきた
				expect(afterPosition[3].toString()).to.be.equal('10000000000000000000')
				// TODO これでええんやろうか。。。なんか不安になてきた
				expect(afterPosition[4].toString()).to.be.equal('10000000000000000000')
			})
			it('generate event(Lockedup).', async () => {
				const [dev, property, tokenId] = await init2()
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
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
			it('generate event(Deposited).', async () => {
				const [dev, , tokenId] = await init2()
				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				dev.lockup.depositToPosition(tokenId, 300)
				const [_from, _tokenId, _value] = await Promise.all([
					getEventValue(dev.lockup)('Deposited', '_from'),
					getEventValue(dev.lockup)('Deposited', '_tokenId'),
					getEventValue(dev.lockup)('Deposited', '_value'),
				])
				expect(_from).to.be.equal(deployer)
				expect(_tokenId).to.be.equal(tokenId.toString())
				expect(_value).to.be.equal('300')
			})
			it('set storage value.', async () => {
				const [dev, property, tokenId] = await init2()
				await dev.lockup.depositToPosition(tokenId, 300)
				const allValue = await dev.lockup.getStorageAllValue()
				expect(allValue.toString()).to.be.equal('400')
				const propertyValue = await dev.lockup.getStoragePropertyValue(
					property.address
				)
				expect(propertyValue.toString()).to.be.equal('400')
			})
			it('staking dev token.', async () => {
				const [dev, property, tokenId] = await init2()
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
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup
					.depositToPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('0 dev staking is not possible.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.depositToPosition(tokenId, 0).catch(err)
				validateErrorMessage(res, 'illegal deposit amount')
			})
			it('user is not holding dev.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.depositToPosition(tokenId, 1000).catch(err)
				validateErrorMessage(res, 'ERC20: transfer amount exceeds allowance')
			})
		})
	})
	describe('Lockup; withdrawByPosition', () => {
		describe('success', () => {
			it('update nft position.', async () => {
				const [dev, property, tokenId] = await init2()
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
				// TODO これでええんやろうか。。。なんか不安になてきた
				expect(afterPosition[2].toString()).to.be.equal(
					'100000000000000000000000000000000000'
				)
				// TODO これでええんやろうか。。。なんか不安になてきた
				expect(afterPosition[3].toString()).to.be.equal('10000000000000000000')
				expect(beforePosition[4].toNumber()).to.be.equal(0)
			})
			it('get reward.', async () => {
				const [dev, , tokenId] = await init2()
				const beforeBalance = await dev.dev
					.balanceOf(deployer)
					.then(toBigNumber)
				await dev.lockup.withdrawByPosition(tokenId, 0)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const reward = afterBalance.minus(beforeBalance)
				expect(reward.toString()).to.be.equal('10000000000000000000')
			})
			it('reverce staking dev token.', async () => {
				const [dev, , tokenId] = await init2()
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
				const [dev, property, tokenId] = await init2()
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
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup
					.withdrawByPosition(tokenId, 100, { from: user3 })
					.catch(err)
				validateErrorMessage(res, 'illegal sender')
			})
			it('Withdrawal amount is greater than deposit amount.', async () => {
				const [dev, , tokenId] = await init2()
				const res = await dev.lockup.withdrawByPosition(tokenId, 200).catch(err)
				validateErrorMessage(res, 'insufficient tokens staked')
			})
		})
	})
	// TODO depositした場合、withdrawで引き出せない
	// TODO lockupした場合、withdrawByPositionで引き出せない
	// TODO depositとrockupの併用のテスト
	describe('Lockup; combination', () => {
		describe('fail', () => {
			it.only('update nft position.', async () => {
				const [dev, property] = await init2()
				const res = await dev.lockup.withdraw(property.address, 100).catch(err)
				validateErrorMessage(res, 'insufficient tokens staked')
			})
		})
	})
})
