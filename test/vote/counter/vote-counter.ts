import {DevProtocolInstance} from '../../test-lib/instance'
import {validateErrorMessage, getPropertyAddress} from '../../test-lib/utils'

contract(
	'VoteCounterTest',
	([
		deployer,
		market1,
		market2,
		policy,
		marketFactory,
		policyFactory,
		user1,
		user2,
		propertyAuther
	]) => {
		const dev = new DevProtocolInstance(deployer)
		let propertyAddress: string
		describe('VoteCounter; addVoteCount', () => {
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateVoteCounter()
				await dev.generateVoteCounterStorage()
				await dev.generateVoteTimes()
				await dev.generateVoteTimesStorage()
				await dev.generateAllocator()
				await dev.generateAllocatorStorage()
				await dev.generateLockup()
				await dev.generateLockupStorage()
				await dev.generateWithdraw()
				await dev.generateWithdrawStorage()
				await dev.generateMarketGroup()
				await dev.generatePolicyGroup()
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				await dev.generateDev()
				await dev.dev.mint(user1, 100, {from: deployer})
				await dev.dev.mint(user2, 100, {from: deployer})
				const propertyCreateResult = await dev.propertyFactory.create(
					'tst',
					'TST',
					propertyAuther
				)
				propertyAddress = getPropertyAddress(propertyCreateResult)
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market1, {from: marketFactory})
				await dev.marketGroup.addGroup(market2, {from: marketFactory})
				await dev.addressConfig.setPolicyFactory(policyFactory)
				await dev.policyGroup.addGroup(policy, {from: policyFactory})
			})
			it('Error when executed from other than market or polisy.', async () => {
				const result = await dev.voteCounter
					.addVoteCount(user1, propertyAddress, true, {from: deployer})
					.catch((err: Error) => err)
				validateErrorMessage(
					result as Error,
					'this address is not proper',
					false
				)
			})
			it('Cannot be executed when lockup is 0.', async () => {
				const result = await dev.voteCounter
					.addVoteCount(user1, propertyAddress, true, {from: market1})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'revert vote count is 0', false)
			})
			it('If it is not the author of the property, the locked value is voted.', async () => {
				let result = await dev.voteCounter.getAgreeCount(market1)
				expect(result.toNumber()).to.be.equal(0)
				await dev.dev.deposit(propertyAddress, 100, {from: user1})
				await dev.voteCounter.addVoteCount(user1, propertyAddress, true, {
					from: market1
				})
				result = await dev.voteCounter.getAgreeCount(market1)
				expect(result.toNumber()).to.be.equal(100)
			})
			it('If the property is the author, the value locked up in the property is voted.', async () => {
				let result = await dev.voteCounter.getAgreeCount(policy)
				expect(result.toNumber()).to.be.equal(0)
				await dev.dev.deposit(propertyAddress, 100, {from: user1})
				await dev.dev.deposit(propertyAddress, 100, {from: user2})
				await dev.voteCounter.addVoteCount(
					propertyAuther,
					propertyAddress,
					true,
					{from: policy}
				)
				result = await dev.voteCounter.getAgreeCount(policy)
				expect(result.toNumber()).to.be.equal(200)
			})
			it('If agree is true, it is treated as a vote of yes.', async () => {
				let result = await dev.voteCounter.getAgreeCount(market1)
				expect(result.toNumber()).to.be.equal(0)
				result = await dev.voteCounter.getOppositeCount(market1)
				expect(result.toNumber()).to.be.equal(0)
				await dev.dev.deposit(propertyAddress, 100, {from: user1})
				await dev.voteCounter.addVoteCount(user1, propertyAddress, true, {
					from: market1
				})
				result = await dev.voteCounter.getAgreeCount(market1)
				expect(result.toNumber()).to.be.equal(100)
				result = await dev.voteCounter.getOppositeCount(market1)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('If agree is false, it is treated as a vote of no.', async () => {
				let result = await dev.voteCounter.getAgreeCount(market2)
				expect(result.toNumber()).to.be.equal(0)
				result = await dev.voteCounter.getOppositeCount(market2)
				expect(result.toNumber()).to.be.equal(0)
				await dev.dev.deposit(propertyAddress, 100, {from: user1})
				await dev.voteCounter.addVoteCount(user1, propertyAddress, false, {
					from: market2
				})
				result = await dev.voteCounter.getAgreeCount(market2)
				expect(result.toNumber()).to.be.equal(0)
				result = await dev.voteCounter.getOppositeCount(market2)
				expect(result.toNumber()).to.be.equal(100)
			})
			it('Voters cannot vote more than once in the same destination.', async () => {
				await dev.dev.deposit(propertyAddress, 100, {from: user2})
				await dev.voteCounter.addVoteCount(
					propertyAuther,
					propertyAddress,
					true,
					{from: policy}
				)
				const result = await dev.voteCounter
					.addVoteCount(propertyAuther, propertyAddress, true, {from: policy})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'revert already vote', false)
			})
		})
	}
)
