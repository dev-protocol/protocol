import {DevProtocolInstance} from '../test-lib/instance'
import {MetricsInstance, PropertyInstance} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	getPropertyAddress,
	getMarketAddress,
	getEventValue
} from '../test-lib/utils'
const uri = 'ws://localhost:7545'

contract('WithdrawTest', ([deployer]) => {
	const init = async (): Promise<[
		DevProtocolInstance,
		MetricsInstance,
		PropertyInstance
	]> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await Promise.all([
			dev.generateAllocator(),
			dev.generateAllocatorStorage(),
			dev.generateMarketFactory(),
			dev.generateMarketGroup(),
			dev.generateMetricsFactory(),
			dev.generateMetricsGroup(),
			dev.generateLockup(),
			dev.generateLockupStorage(),
			dev.generateWithdraw(),
			dev.generateWithdrawStorage(),
			dev.generatePropertyFactory(),
			dev.generatePropertyGroup(),
			dev.generateVoteTimes(),
			dev.generateVoteTimesStorage(),
			dev.generatePolicyFactory(),
			dev.generatePolicyGroup(),
			dev.generatePolicySet(),
			dev.generateDev()
		])
		await dev.dev.mint(deployer, new BigNumber(1e18).times(10000000))
		const policy = await artifacts.require('PolicyTestForAllocator').new()

		await dev.policyFactory.create(policy.address)
		const propertyAddress = getPropertyAddress(
			await dev.propertyFactory.create('test', 'TEST', deployer)
		)
		const [property] = await Promise.all([
			artifacts.require('Property').at(propertyAddress)
		])
		const marketBehavior = await artifacts
			.require('MarketTest1')
			.new(dev.addressConfig.address)
		const marketAddress = getMarketAddress(
			await dev.marketFactory.create(marketBehavior.address)
		)
		const [market] = await Promise.all([
			artifacts.require('Market').at(marketAddress)
		])
		await market.authenticate(property.address, '', '', '', '', '')
		const metricsAddress = await (async () => {
			market.authenticate(property.address, '', '', '', '', '')
			return getEventValue(dev.metricsFactory, uri)('Create', '_metrics')
		})()
		const [metrics] = await Promise.all([
			artifacts.require('Metrics').at(metricsAddress as string)
		])
		await dev.dev.addMinter(dev.withdraw.address)
		return [dev, metrics, property]
	}

	const toBigNumber = (v: string | BigNumber): BigNumber => new BigNumber(v)

	describe('Withdraw; withdraw', () => {
		describe('Withdraw; Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the Address Config Contract', async () => {
				const [dev, metrics, property] = await init()
				const prev = await dev.dev.totalSupply().then(toBigNumber)
				const balance = await dev.dev.balanceOf(deployer).then(toBigNumber)

				await dev.allocator.allocate(metrics.address)
				await dev.withdraw.withdraw(property.address)

				const next = await dev.dev.totalSupply().then(toBigNumber)
				const afterBalance = await dev.dev.balanceOf(deployer).then(toBigNumber)
				const gap = next.minus(prev)

				expect(prev.toString()).to.be.not.equal(next.toString())
				expect(balance.plus(gap).toString()).to.be.equal(
					afterBalance.toString()
				)
			})
		})

		describe('Withdraw; Withdrawable amount', () => {
			it(
				'The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender'
			)

			it(
				'The withdrawal amount is always the full amount of the withdrawable amount'
			)

			it('When the withdrawable amount is 0, the withdrawal amount is 0')
		})

		describe('Withdraw; Alice has sent 800 out of 1000 tokens to Bob. Bob has increased from 200 tokens to 1000 tokens. Price is 100', () => {
			describe('Withdraw; Before increment', () => {
				it(`Alice's withdrawable amount is ${1000 * 100}`)

				it(`Bob's withdrawable amount is ${200 * 100}`)
			})

			describe('Withdraw; After increment; New price is 120', () => {
				it(`Alice's withdrawable amount is ${1000 * 100 + 200 * 120}`)

				it(`Bob's withdrawable amount is ${200 * 100 + 1000 * 120}`)
			})

			it(
				'Should fail to call `beforeBalanceChange` when sent from other than Property Contract address'
			)
		})
	})
	describe('Withdraw; beforeBalanceChange', () => {
		// TODO
	})
	// Etc...
})
