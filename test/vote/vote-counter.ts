import {MarketInstance, PolicyInstance} from '../../types/truffle-contracts'
import {DevProtocolInstance} from '../test-lib/instance'
import {mine, toBigNumber} from '../test-lib/utils/common'
import {
	getPropertyAddress,
	getMarketAddress,
	getPolicyAddress,
} from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'VoteCounterTest',
	([deployer, marketCreator, propertyAuther, dummy]) => {
		const init = async (): Promise<
			[DevProtocolInstance, string, MarketInstance, MarketInstance]
		> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generateVoteCounter(),
				dev.generateMarketGroup(),
				dev.generateMarketFactory(),
				dev.generatePolicyGroup(),
				dev.generatePolicyFactory(),
				dev.generatePolicySet(),
				dev.generateLockup(),
				dev.generateDev(),
				dev.generatePropertyFactory(),
				dev.generatePropertyGroup(),
				dev.generateAllocator(),
				dev.generateMetricsFactory(),
				dev.generateMetricsGroup(),
			])
			await createPolicy(dev)
			const propertyAddress = await createProperty(dev)
			const marketInstance = await createMarket(dev)
			await dev.dev.mint(propertyAuther, 10000, {from: deployer})
			const marketInstance2 = await createMarket(dev)
			return [dev, propertyAddress, marketInstance2, marketInstance]
		}

		const init2 = async (): Promise<
			[DevProtocolInstance, string, PolicyInstance]
		> => {
			const [dev, propertyAddress] = await init()
			const policy = await createPolicy(dev)
			return [dev, propertyAddress, policy]
		}

		const createMarket = async (
			dev: DevProtocolInstance
		): Promise<MarketInstance> => {
			const behavuor = await dev.getMarket('MarketTest3', marketCreator)
			const result = await dev.marketFactory.create(behavuor.address)
			const marketAddress = getMarketAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const marketInstance = await artifacts.require('Market').at(marketAddress)
			return marketInstance
		}

		const createProperty = async (
			dev: DevProtocolInstance
		): Promise<string> => {
			const result = await dev.propertyFactory.create(
				'test',
				'TEST',
				propertyAuther
			)
			const propertyAddress = getPropertyAddress(result)
			return propertyAddress
		}

		const createPolicy = async (
			dev: DevProtocolInstance
		): Promise<PolicyInstance> => {
			const policy = await artifacts.require('PolicyTestForVoteCounter').new()
			const result = await dev.policyFactory.create(policy.address)
			const policyAddress = getPolicyAddress(result)
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const policyInstance = await artifacts.require('Policy').at(policyAddress)
			return policyInstance
		}

		describe('VoteCounter; voteMarket', () => {
			describe('success', () => {
				it('賛成に投票されて、marketが有効になる.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
				})
				it('賛成に投票されたが、票数がたらず、marketが有効にならない.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 9999, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
				})
				it('反対に投票されて、かつmarketが有効にならない.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						false,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
				})
				it('すでに投票したMarketに別propertyで投票する.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(false)

					const propertyAddress2 = await createProperty(dev)
					await dev.dev.deposit(propertyAddress2, 5000, {from: propertyAuther})
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress2,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
				})
				it('すでに利用したpropertyで別Marketに投票する.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
					const marketInstance2 = await createMarket(dev)
					expect(await marketInstance2.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance2.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance2.enabled()).to.be.equal(true)
				})
			})
			describe('failure', () => {
				it('MarketアドレスにMarketアドレスを指定しない.', async () => {
					const [dev, propertyAddress] = await init()

					const result = await dev.voteCounter
						.voteMarket(dummy, propertyAddress, true)
						.catch((err: Error) => err)
					validateAddressErrorMessage(result, false)
				})
				it('PropertyアドレスにPropertyアドレスを指定しない.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, dummy, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'vote count is 0')
				})
				it('すでに有効なMarketアドレスを指定する.', async () => {
					const [dev, propertyAddress, , marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'market is already enabled')
				})
				it('投票期限が切れたMarketアドレスを指定する.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					await mine(10)
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'voting deadline is over')
				})
				it('ステーキングしていないPropertyアドレスを指定する.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'vote count is 0')
				})
				it('同一Market、同一Prioertyで投票する.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'already vote')
				})
			})
		})
		describe('VoteCounter; isAlreadyVoteMarket', () => {
			let useProperty: string
			let notUseProperty: string
			let voteMarket: MarketInstance
			let notVoteMrket: MarketInstance
			let dev: DevProtocolInstance
			before(async () => {
				const [_dev, _useProperty, _voteMarket, _notVoteMrket] = await init()
				notUseProperty = await createProperty(_dev)
				await _dev.dev.deposit(_useProperty, 10000, {from: propertyAuther})
				await _dev.voteCounter.voteMarket(
					_voteMarket.address,
					_useProperty,
					true,
					{from: propertyAuther}
				)
				dev = _dev
				useProperty = _useProperty
				voteMarket = _voteMarket
				notVoteMrket = _notVoteMrket
			})
			it('投票していないMarketアドレスと利用していないPropertyアドレスを指定する.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					notVoteMrket.address,
					notUseProperty,
					{from: propertyAuther}
				)
				expect(result).to.be.equal(false)
			})
			it('投票していないMarketアドレスと利用したPropertyアドレスを指定する.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					notVoteMrket.address,
					useProperty,
					{from: propertyAuther}
				)
				expect(result).to.be.equal(false)
			})
			it('投票したMarketアドレスと利用していないPropertyアドレスを指定する.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					voteMarket.address,
					notUseProperty,
					{from: propertyAuther}
				)
				expect(result).to.be.equal(false)
			})
			it('投票したMarketアドレスと利用したPropertyアドレスを指定する.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					voteMarket.address,
					useProperty,
					{from: propertyAuther}
				)
				expect(result).to.be.equal(true)
			})
		})
		describe('VoteCounter; votePolicy', () => {
			describe('success', () => {
				it('賛成に投票されて、Policyが有効になる.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)

					expect(currentPolicyAddress).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.equal(await dev.addressConfig.policy())
				})
				it('賛成に投票されたが、Policyが有効にならない.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
				})
				it('反対に投票されて、Policyが有効にならない.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						false,
						{from: propertyAuther}
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
				})
				it('同一投票期間中、別Policyに別Propertyを使って投票する.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					const policy2 = await createPolicy(dev)
					const property2 = await createProperty(dev)
					await dev.dev.deposit(property2, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(policy2.address, property2, true, {
						from: propertyAuther,
					})
					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy2.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
				})
				it('投票期間が終わったあと、同じPropertyアドレスを指定して投票する.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)

					expect(currentPolicyAddress).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.equal(await dev.addressConfig.policy())
					const policy2 = await createPolicy(dev)
					await dev.voteCounter.votePolicy(
						policy2.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy2.address).to.be.equal(await dev.addressConfig.policy())
				})
			})
			describe('failure', () => {
				it('Policyアドレスを指定しない.', async () => {
					const [dev, propertyAddress] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					const result = await dev.voteCounter
						.votePolicy(dummy, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateAddressErrorMessage(result)
				})
				it('現在有効なPolicyに投票する.', async () => {
					const [dev, propertyAddress] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					const currentPolicy = await dev.addressConfig.policy()
					const result = await dev.voteCounter
						.votePolicy(currentPolicy, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'this policy is current')
				})
				it('投票期限が切れたPolicyに投票する.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {from: propertyAuther})
					await mine(10)
					const result = await dev.voteCounter
						.votePolicy(policy.address, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'voting deadline is over')
				})
				it('同一投票期間中、投票に利用したPropertyを使って別Policyへ投票する.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{
							from: propertyAuther,
						}
					)
					const policy2 = await createPolicy(dev)
					const result = await dev.voteCounter
						.votePolicy(policy2.address, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'already use property')
				})
				it('同一投票期間中、同じPolicyに別のPropertyを指定して投票する.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const property2 = await createProperty(dev)
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.dev.deposit(property2, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{
							from: propertyAuther,
						}
					)
					const result = await dev.voteCounter
						.votePolicy(policy.address, property2, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'already vote policy')
				})
				it('ステーキング数が0の場合.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const result = await dev.voteCounter
						.votePolicy(policy.address, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'vote count is 0')
				})
			})
		})
		describe('VoteCounter; cancelVotePolicy', () => {
			describe('success', () => {
				it('賛成投票がキャンセルできる.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					let agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					let opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(5000)
					expect(opposite.toNumber()).to.be.equal(0)
					await dev.voteCounter.cancelVotePolicy(
						policy.address,
						propertyAddress,
						{from: propertyAuther}
					)
					agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(0)
				})
				it('反対投票がキャンセルできる.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						false,
						{from: propertyAuther}
					)
					let agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					let opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(5000)
					await dev.voteCounter.cancelVotePolicy(
						policy.address,
						propertyAddress,
						{from: propertyAuther}
					)
					agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(0)
				})
				it('キャンセルされた投票のPolicyとpropertyは再利用可能.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					let agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					let opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(5000)
					expect(opposite.toNumber()).to.be.equal(0)
					await dev.voteCounter.cancelVotePolicy(
						policy.address,
						propertyAddress,
						{from: propertyAuther}
					)
					agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(0)
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						false,
						{from: propertyAuther}
					)
					agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(5000)
					await dev.voteCounter.cancelVotePolicy(
						policy.address,
						propertyAddress,
						{from: propertyAuther}
					)
					agree = await dev.voteCounter
						.getStorageAgreeCount(policy.address)
						.then(toBigNumber)
					opposite = await dev.voteCounter
						.getStorageOppositeCount(policy.address)
						.then(toBigNumber)
					expect(agree.toNumber()).to.be.equal(0)
					expect(opposite.toNumber()).to.be.equal(0)
				})
			})
			describe('failure', () => {
				it('投票に利用していないPropertyアドレスを指定した.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const property = await createProperty(dev)

					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					const result = await dev.voteCounter
						.cancelVotePolicy(policy.address, property, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'not use property')
				})
				it('投票していないPolicyアドレスを指定した.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const policy2 = await createPolicy(dev)

					await dev.dev.deposit(propertyAddress, 5000, {from: propertyAuther})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{from: propertyAuther}
					)
					const result = await dev.voteCounter
						.cancelVotePolicy(policy2.address, propertyAddress, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'not vote policy')
				})
			})
		})
	}
)

// 服数ユーザからの追加テスト
// アサーションもうちょっと入れる
// 英語化
