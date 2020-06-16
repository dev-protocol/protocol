import {DevProtocolInstance} from '../../test-lib/instance'
import {PropertyInstance} from '../../../types/truffle-contracts'
import {getPropertyAddress} from '../../test-lib/utils/log'
import {getAbstentionTimes} from '../../test-lib/utils/common'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../../test-lib/utils/error'

contract(
	'VoteTimesTest',
	([
		deployer,
		marketFactory,
		propertyFactory,
		property,
		dummyProperty,
		voteCounter,
		dummyLockup,
		dummyWithdraw,
		user,
	]) => {
		const dev = new DevProtocolInstance(deployer)

		describe('VoteTimes; addVoteTimes, addVoteTimesByProperty, resetVoteTimesByProperty', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePropertyGroup(),
				])
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer,
				})
				await dev.addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer,
				})
				await dev.addressConfig.setVoteCounter(voteCounter, {from: deployer})
				await dev.propertyGroup.addGroup(property, {from: propertyFactory})
				await dev.voteTimes.addVoteTime({from: marketFactory})
				await dev.voteTimes.addVoteTime({from: marketFactory})
				await dev.voteTimes.addVoteTimesByProperty(property, {
					from: voteCounter,
				})
			})
			it('If the vote was held twice, but the vote was held only once, the number of abstentions will be 1.', async () => {
				const result = await getAbstentionTimes(dev, property)
				expect(result).to.be.equal(1)
			})
			it('When reset, the number of abstentions becomes 0.', async () => {
				await dev.voteTimes.resetVoteTimesByProperty(property, {
					from: propertyFactory,
				})
				const result = await getAbstentionTimes(dev, property)
				expect(result).to.be.equal(0)
			})
			it('If the number of votes is 0, the number of votes cast is the number of abstentions.', async () => {
				const result = await getAbstentionTimes(dev, dummyProperty)
				expect(result).to.be.equal(2)
			})
			it('Storage information can be taken over.', async () => {
				const storageAddress = await dev.voteTimesStorage.getStorageAddress({
					from: deployer,
				})
				const newVoteTimesStorage = await artifacts
					.require('VoteTimesStorage')
					.new(dev.addressConfig.address)
				await newVoteTimesStorage.setStorage(storageAddress, {
					from: deployer,
				})
				await dev.voteTimesStorage.changeOwner(newVoteTimesStorage.address, {
					from: deployer,
				})
				await dev.addressConfig.setVoteTimesStorage(
					newVoteTimesStorage.address,
					{
						from: deployer,
					}
				)
				await dev.voteTimes.addVoteTime({from: marketFactory})
				const result = await getAbstentionTimes(dev, property)
				expect(result).to.be.equal(1)
			})
		})
		describe.only('VoteTimes; validateTargetPeriod', () => {
			const _init = async (): Promise<
				[DevProtocolInstance, PropertyInstance]
			> => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateAllocator(),
					dev.generatePropertyFactory(),
					dev.generatePropertyGroup(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
					dev.generatePolicySet(),
				])
				const policy = await artifacts.require('PolicyTestForTimeVote').new()
				await dev.policyFactory.create(policy.address)
				const propertyAddress = getPropertyAddress(
					await dev.propertyFactory.create('test', 'TEST', deployer)
				)
				const [property] = await Promise.all([
					artifacts.require('Property').at(propertyAddress),
				])
				await dev.addressConfig.setLockup(dummyLockup)
				await dev.addressConfig.setWithdraw(dummyWithdraw)
				return [dev, property]
			}

			describe('validate', () => {
				// The first argument is guaranteed to be a property address on the caller, so we won't test it here
				it('No error when called from a Lockup contract.', async () => {
					const [dev, property] = await _init()
					await dev.voteTimes.validateTargetPeriod(property.address, 0, 100, {
						from: dummyLockup,
					})
				})
				it('No error when called from a Withdraw contract.', async () => {
					const [dev, property] = await _init()
					await dev.voteTimes.validateTargetPeriod(property.address, 0, 100, {
						from: dummyWithdraw,
					})
				})
				it('An error occurs when a contract other than Lockup or Withdraw is called.', async () => {
					const [dev, property] = await _init()
					const res = await dev.voteTimes
						.validateTargetPeriod(property.address, 0, 100)
						.catch((err: Error) => err)
					validateAddressErrorMessage(res)
				})
			})
			describe('abstentionPenalty', () => {
				it('If the range of block numbers is narrow, an error will occur on abstentionPenalty and the function itself will fail.', async () => {
					const [dev, property] = await _init()
					await dev.generateMarketFactory()
					await dev.generateMarketGroup()
					const market = await dev.getMarket('MarketTest1', user)
					await dev.marketFactory.create(market.address, {
						from: user,
					})
					const res = await dev.voteTimes
						.validateTargetPeriod(property.address, 1, 2, {
							from: dummyLockup,
						})
						.catch((err: Error) => err)
					validateErrorMessage(res, 'outside the target period')
				})
			})
		})
	}
)
