import {DevProtocolInstance} from '../../test-lib/instance'
import {validateErrorMessage, getPropertyAddress} from '../../test-lib/utils'

contract(
	'VoteCounterTest',
	([
		deployer,
		market,
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
			before(async () => {
				// Console.log(0)
				// var balance = await web3.eth.getBalance(deployer)
				// console.log(web3.utils.fromWei(balance, 'ether'))
				await dev.generateAddressConfig()
				// Balance = await web3.eth.getBalance(deployer)
				// console.log(balance)
				// console.log(1)
				await dev.generateVoteCounter()
				// Console.log(2)
				await dev.generateVoteCounterStorage()
				// Console.log(4)
				await dev.generateVoteTimes()
				// Console.log(1)
				await dev.generateVoteTimesStorage()
				await dev.generateAllocator()
				await dev.generateAllocatorStorage()
				await dev.generateLockup()
				// Console.log(2)
				await dev.generateLockupStorage()
				await dev.generateWithdraw()
				await dev.generateWithdrawStorage()
				await dev.generateMarketGroup()
				await dev.generatePolicyGroup()
				// Console.log(4)
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				await dev.generateDev()
				// Console.log(5)
				await dev.dev.mint(user1, 100, {from: deployer})
				await dev.dev.mint(user2, 100, {from: deployer})
				// Console.log(2)
				// Await dev.dev.deposit(propertyAddress, 100, {from: user})
				const propertyCreateResult = await dev.propertyFactory.create(
					'tst',
					'TST',
					propertyAuther
				)
				// Console.log(3)
				propertyAddress = getPropertyAddress(propertyCreateResult)
				await dev.addressConfig.setMarketFactory(marketFactory)
				await dev.marketGroup.addGroup(market, {from: marketFactory})
				// Console.log(4)
				await dev.addressConfig.setPolicyFactory(policyFactory)
				await dev.policyGroup.addGroup(policy, {from: policyFactory})
				// Console.log(5)
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
					.addVoteCount(user1, propertyAddress, true, {from: market})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'revert vote count is 0', false)
			})
			it('If it is not the author of the property, the locked value is voted.', async () => {
				let result = await dev.voteCounter.getAgreeCount(market)
				expect(result.toNumber()).to.be.equal(0)
				await dev.dev.deposit(propertyAddress, 100, {from: user1})
				await dev.voteCounter.addVoteCount(user1, propertyAddress, true, {
					from: market
				})
				result = await dev.voteCounter.getAgreeCount(market)
				expect(result.toNumber()).to.be.equal(100)
			})
			it('propertyのautherだった場合', async () => {
				let result = await dev.voteCounter.getAgreeCount(policy)
				expect(result.toNumber()).to.be.equal(0)
				result = await dev.voteTimes.getAbstentionTimes(propertyAddress)
				console.log(result.toNumber())

				await dev.dev.deposit(propertyAddress, 100, {from: user2})
				await dev.voteCounter.addVoteCount(
					propertyAuther,
					propertyAddress,
					true,
					{from: policy}
				)
				result = await dev.voteCounter.getAgreeCount(policy)
				expect(result.toNumber()).to.be.equal(100)
				result = await dev.voteTimes.getAbstentionTimes(propertyAddress)
				console.log(result.toNumber())
			})

			// It('すでに実行された場合は実行できない', async () => {})
			// it('agree=trueだった場合は賛成票', async () => {})
			// it('agree=falseだった場合は反対票', async () => {})
			// it('marketから実行することができる', async () => {})
			// it('policyから実行することができる', async () => {})
		})
		// Describe('VoteCounter; getAgreeCount')
		// describe('VoteCounter; getOppositeCount')
	}
)
