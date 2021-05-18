import { MarketInstance, IPolicyInstance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'
import { mine, toBigNumber } from '../test-lib/utils/common'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'VoteCounterTest',
	([
		deployer,
		marketCreator,
		propertyAuther,
		propertyAuther2,
		propertyAuther3,
		dummy,
	]) => {
		const init = async (): Promise<
			[DevProtocolInstance, string, MarketInstance, MarketInstance]
		> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generateDev()
			await dev.generateDevMinter()
			await Promise.all([
				dev.generateVoteCounter(),
				dev.generateMarketGroup(),
				dev.generateMarketFactory(),
				dev.generatePolicyGroup(),
				dev.generatePolicyFactory(),
				dev.generateLockup(),
				dev.generatePropertyFactory(),
				dev.generatePropertyGroup(),
				dev.generateAllocator(),
				dev.generateMetricsFactory(),
				dev.generateMetricsGroup(),
			])
			await createPolicy(dev)
			const propertyAddress = await createProperty(dev)
			const marketInstance = await createMarket(dev)
			await dev.dev.mint(propertyAuther, 10000, { from: deployer })
			const marketInstance2 = await createMarket(dev)
			await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
			return [dev, propertyAddress, marketInstance2, marketInstance]
		}

		const init2 = async (): Promise<
			[DevProtocolInstance, string, IPolicyInstance]
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
			await dev.metricsGroup.__setMetricsCountPerProperty(propertyAddress, 1)
			return propertyAddress
		}

		const createPolicy = async (
			dev: DevProtocolInstance
		): Promise<IPolicyInstance> => {
			const policyAddress = await dev.generatePolicy('PolicyTestForVoteCounter')
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const policyInstance = await artifacts
				.require('PolicyTestForVoteCounter')
				.at(policyAddress)
			return policyInstance
		}

		describe('VoteCounter; voteMarket', () => {
			describe('success', () => {
				it('The vote is cast in agree and the market is enabled.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
				})
				it('Multiple users keep voting agree.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()
					await dev.dev.mint(propertyAuther2, 10000, { from: deployer })
					await dev.dev.mint(propertyAuther3, 10000, { from: deployer })
					const property2 = await createProperty(dev)

					await dev.dev.deposit(propertyAddress, 4000, { from: propertyAuther })
					await dev.dev.deposit(propertyAddress, 4000, {
						from: propertyAuther2,
					})
					await dev.dev.deposit(property2, 4000, { from: propertyAuther3 })
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther2 }
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						property2,
						true,
						{ from: propertyAuther3 }
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
				})
				it('Voted opposite, and the market is not enabled.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						false,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(false)
				})
				it('Vote for the Market that has already voted.But use a property address that you have not used yet.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(false)

					const propertyAddress2 = await createProperty(dev)
					await dev.dev.deposit(propertyAddress2, 5000, {
						from: propertyAuther,
					})
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress2,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
				})
				it('Vote for a Market that you have not yet voted for. When you do so, reuse the property address.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance.enabled()).to.be.equal(true)
					const marketInstance2 = await createMarket(dev)
					expect(await marketInstance2.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance2.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					expect(await marketInstance2.enabled()).to.be.equal(true)
				})
			})
			describe('failure', () => {
				it('Incorrect Market address.', async () => {
					const [dev, propertyAddress] = await init()

					const result = await dev.voteCounter
						.voteMarket(dummy, propertyAddress, true)
						.catch((err: Error) => err)
					validateAddressErrorMessage(result, false)
				})
				it('Incorrect Property address.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, dummy, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'vote count is 0')
				})
				it('Specify an already valid Market address.', async () => {
					const [dev, propertyAddress, , marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'market is already enabled')
				})
				it('Specify a Market address that has expired.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					await mine(15)
					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'voting deadline is over')
				})
				it('Specifies an unstaked Property address.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					const result = await dev.voteCounter
						.voteMarket(marketInstance.address, propertyAddress, true)
						.catch((err: Error) => err)
					validateErrorMessage(result, 'vote count is 0')
				})
				it('Vote in the same Market, same Property.', async () => {
					const [dev, propertyAddress, marketInstance] = await init()

					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					expect(await marketInstance.enabled()).to.be.equal(false)
					await dev.voteCounter.voteMarket(
						marketInstance.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
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
				await _dev.dev.deposit(_useProperty, 10000, { from: propertyAuther })
				await _dev.voteCounter.voteMarket(
					_voteMarket.address,
					_useProperty,
					true,
					{ from: propertyAuther }
				)
				dev = _dev
				useProperty = _useProperty
				voteMarket = _voteMarket
				notVoteMrket = _notVoteMrket
			})
			it('Specify market addresses that have not been voted on and property addresses that are not used.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					notVoteMrket.address,
					notUseProperty,
					{ from: propertyAuther }
				)
				expect(result).to.be.equal(false)
			})
			it('Specifying non-voting Market Addresses and Property Addresses used', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					notVoteMrket.address,
					useProperty,
					{ from: propertyAuther }
				)
				expect(result).to.be.equal(false)
			})
			it('Specify the Market address you voted for and the Property address you are not using.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					voteMarket.address,
					notUseProperty,
					{ from: propertyAuther }
				)
				expect(result).to.be.equal(false)
			})
			it('Specify the Market address you voted for and the Property address you used.', async () => {
				const result = await dev.voteCounter.isAlreadyVoteMarket(
					voteMarket.address,
					useProperty,
					{ from: propertyAuther }
				)
				expect(result).to.be.equal(true)
			})
		})
		describe('VoteCounter; votePolicy', () => {
			describe('success', () => {
				it('Voted in agree, Policy becomes enabled.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)

					expect(currentPolicyAddress).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.equal(await dev.addressConfig.policy())
				})
				it('Multiple users keep voting agree.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.mint(propertyAuther2, 10000, { from: deployer })
					await dev.dev.mint(propertyAuther3, 10000, { from: deployer })
					const property2 = await createProperty(dev)
					await dev.dev.deposit(propertyAddress, 4000, { from: propertyAuther })
					await dev.dev.deposit(propertyAddress, 4000, {
						from: propertyAuther2,
					})
					await dev.dev.deposit(property2, 4000, { from: propertyAuther3 })

					const currentPolicyAddress = await dev.addressConfig.policy()

					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)

					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther2 }
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)

					await dev.voteCounter.votePolicy(policy.address, property2, true, {
						from: propertyAuther3,
					})

					expect(currentPolicyAddress).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.equal(await dev.addressConfig.policy())
				})
				it('Voted opposite and the Policy is not enabled.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						false,
						{ from: propertyAuther }
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
				})
				it('Voting in a different Policy with a different Property during the same voting period.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)

					expect(currentPolicyAddress).to.be.equal(
						await dev.addressConfig.policy()
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					const policy2 = await createPolicy(dev)
					const property2 = await createProperty(dev)
					await dev.dev.deposit(property2, 5000, { from: propertyAuther })
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
				it('Vote with the same Property address after the voting period is over.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const currentPolicyAddress = await dev.addressConfig.policy()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
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
						{ from: propertyAuther }
					)
					expect(policy.address).to.be.not.equal(
						await dev.addressConfig.policy()
					)
					expect(policy2.address).to.be.equal(await dev.addressConfig.policy())
				})
			})
			describe('failure', () => {
				it('Incorrect Policy address.', async () => {
					const [dev, propertyAddress] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					const result = await dev.voteCounter
						.votePolicy(dummy, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateAddressErrorMessage(result)
				})
				it('Vote for the current policy.', async () => {
					const [dev, propertyAddress] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					const currentPolicy = await dev.addressConfig.policy()
					const result = await dev.voteCounter
						.votePolicy(currentPolicy, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'this policy is current')
				})
				it('Vote for expired policies.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 10000, {
						from: propertyAuther,
					})
					await mine(10)
					const result = await dev.voteCounter
						.votePolicy(policy.address, propertyAddress, true, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'voting deadline is over')
				})
				it('Vote for a different policy during the same voting period, using the same Property used for the vote.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
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
				it('Voting for a different Property in the same Policy during the same voting period.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const property2 = await createProperty(dev)
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.dev.deposit(property2, 5000, { from: propertyAuther })
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
				it('If the number of staking is zero.', async () => {
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
				it('can cancel agree vote.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
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
						{ from: propertyAuther }
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
				it('can cancel opposite vote.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						false,
						{ from: propertyAuther }
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
						{ from: propertyAuther }
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
				it('Policies and properties of cancelled votes can be reused.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
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
						{ from: propertyAuther }
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
						{ from: propertyAuther }
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
						{ from: propertyAuther }
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
				it('A Property address that is not used for voting.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const property = await createProperty(dev)

					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
					)
					const result = await dev.voteCounter
						.cancelVotePolicy(policy.address, property, {
							from: propertyAuther,
						})
						.catch((err: Error) => err)
					validateErrorMessage(result, 'not use property')
				})
				it('A Policy address that is not used for voting.', async () => {
					const [dev, propertyAddress, policy] = await init2()
					const policy2 = await createPolicy(dev)

					await dev.dev.deposit(propertyAddress, 5000, { from: propertyAuther })
					await dev.voteCounter.votePolicy(
						policy.address,
						propertyAddress,
						true,
						{ from: propertyAuther }
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
