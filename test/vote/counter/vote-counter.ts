// import {DevProtocolInstance} from '../../test-lib/instance'
// import {getPropertyAddress} from '../../test-lib/utils/log'
// import {
// 	validateErrorMessage,
// 	validateAddressErrorMessage,
// 	validatePauseErrorMessage,
// } from '../../test-lib/utils/error'

// contract(
// 	'VoteCounterTest',
// 	([
// 		deployer,
// 		market1,
// 		market2,
// 		policy,
// 		marketFactory,
// 		policyFactory,
// 		user1,
// 		user2,
// 		propertyAuther,
// 	]) => {
// 		describe('VoteCounter; addVoteCount', () => {
// 			const init1 = async (): Promise<[DevProtocolInstance, string]> => {
// 				const dev = new DevProtocolInstance(deployer)
// 				await dev.generateAddressConfig()
// 				await Promise.all([
// 					dev.generateVoteCounter(),
// 					dev.generateVoteCounterStorage(),
// 					dev.generateVoteTimes(),
// 					dev.generateVoteTimesStorage(),
// 					dev.generateAllocator(),
// 					dev.generateLockup(),
// 					dev.generateWithdraw(),
// 					dev.generateWithdrawStorage(),
// 					dev.generateMarketGroup(),
// 					dev.generatePolicyGroup(),
// 					dev.generatePropertyFactory(),
// 					dev.generatePropertyGroup(),
// 					dev.generateDev(),
// 				])
// 				await dev.dev.mint(user1, 100, {from: deployer})
// 				await dev.dev.mint(user2, 100, {from: deployer})
// 				const propertyCreateResult = await dev.propertyFactory.create(
// 					'tst',
// 					'TST',
// 					propertyAuther
// 				)
// 				const propertyAddress = getPropertyAddress(propertyCreateResult)
// 				await dev.addressConfig.setMarketFactory(marketFactory)
// 				await dev.marketGroup.addGroup(market1, {from: marketFactory})
// 				await dev.marketGroup.addGroup(market2, {from: marketFactory})
// 				await dev.addressConfig.setPolicyFactory(policyFactory)
// 				await dev.policyGroup.addGroup(policy, {from: policyFactory})
// 				return [dev, propertyAddress]
// 			}

// 			const init2 = async (): Promise<[DevProtocolInstance, string]> => {
// 				const dev = new DevProtocolInstance(deployer)
// 				await dev.generateAddressConfig()
// 				await Promise.all([
// 					dev.generateVoteCounter(),
// 					dev.generateVoteCounterStorage(),
// 					dev.generateVoteTimes(),
// 					dev.generateVoteTimesStorage(),
// 					dev.generateAllocator(),
// 					dev.generateLockup(),
// 					dev.generateWithdraw(),
// 					dev.generateWithdrawStorage(),
// 					dev.generateMarketGroup(),
// 					dev.generatePolicyGroup(),
// 					dev.generatePropertyFactory(),
// 					dev.generatePropertyGroup(),
// 					dev.generateDev(),
// 					dev.generateMetricsGroup(),
// 					dev.generatePolicyFactory(),
// 					dev.generatePolicyGroup(),
// 					dev.generatePolicySet(),
// 				])
// 				await dev.dev.mint(user1, 100, {from: deployer})
// 				await dev.dev.mint(user2, 100, {from: deployer})
// 				const propertyCreateResult = await dev.propertyFactory.create(
// 					'tst',
// 					'TST',
// 					propertyAuther
// 				)
// 				const propertyAddress = getPropertyAddress(propertyCreateResult)
// 				await dev.addressConfig.setMarketFactory(marketFactory)
// 				await dev.marketGroup.addGroup(market1, {from: marketFactory})
// 				await dev.marketGroup.addGroup(market2, {from: marketFactory})
// 				const policy = await artifacts.require('PolicyTestForVoteCounter').new()
// 				await dev.policyFactory.create(policy.address)
// 				return [dev, propertyAddress]
// 			}

// 			it('Error when executed from other than market or polisy.', async () => {
// 				const [dev, propertyAddress] = await init1()
// 				const result = await dev.voteCounter
// 					.addVoteCount(user1, propertyAddress, true, {from: deployer})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result, false)
// 			})
// 			it('Cannot be executed when lockup is 0.', async () => {
// 				const [dev, propertyAddress] = await init1()
// 				const result = await dev.voteCounter
// 					.addVoteCount(user1, propertyAddress, true, {from: market1})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'revert vote count is 0', false)
// 			})
// 			it('If it is not the author of the property, the locked value is voted.', async () => {
// 				const [dev, propertyAddress] = await init2()
// 				let result = await dev.voteCounter.getAgreeCount(market1)
// 				expect(result.toNumber()).to.be.equal(0)
// 				await dev.dev.deposit(propertyAddress, 100, {from: user1})
// 				await dev.voteCounter.addVoteCount(user1, propertyAddress, true, {
// 					from: market1,
// 				})
// 				result = await dev.voteCounter.getAgreeCount(market1)
// 				expect(result.toNumber()).to.be.equal(100)
// 			})
// 			it('If the property is the author, the value locked up in the property is voted.', async () => {
// 				const [dev, propertyAddress] = await init2()
// 				let result = await dev.voteCounter.getAgreeCount(policy)
// 				expect(result.toNumber()).to.be.equal(0)
// 				await dev.dev.deposit(propertyAddress, 100, {from: user1})
// 				await dev.dev.deposit(propertyAddress, 100, {from: user2})
// 				await dev.addressConfig.setPolicyFactory(policyFactory)
// 				await dev.policyGroup.addGroup(policy, {from: policyFactory})
// 				await dev.voteCounter.addVoteCount(
// 					propertyAuther,
// 					propertyAddress,
// 					true,
// 					{from: policy}
// 				)
// 				result = await dev.voteCounter.getAgreeCount(policy)
// 				expect(result.toNumber()).to.be.equal(200)
// 			})
// 			it('If agree is true, it is treated as a vote of yes.', async () => {
// 				const [dev, propertyAddress] = await init2()
// 				let result = await dev.voteCounter.getAgreeCount(market1)
// 				expect(result.toNumber()).to.be.equal(0)
// 				result = await dev.voteCounter.getOppositeCount(market1)
// 				expect(result.toNumber()).to.be.equal(0)
// 				await dev.dev.deposit(propertyAddress, 100, {from: user1})
// 				await dev.voteCounter.addVoteCount(user1, propertyAddress, true, {
// 					from: market1,
// 				})
// 				result = await dev.voteCounter.getAgreeCount(market1)
// 				expect(result.toNumber()).to.be.equal(100)
// 				result = await dev.voteCounter.getOppositeCount(market1)
// 				expect(result.toNumber()).to.be.equal(0)
// 			})
// 			it('If agree is false, it is treated as a vote of no.', async () => {
// 				const [dev, propertyAddress] = await init2()
// 				let result = await dev.voteCounter.getAgreeCount(market2)
// 				expect(result.toNumber()).to.be.equal(0)
// 				result = await dev.voteCounter.getOppositeCount(market2)
// 				expect(result.toNumber()).to.be.equal(0)
// 				await dev.dev.deposit(propertyAddress, 100, {from: user1})
// 				await dev.voteCounter.addVoteCount(user1, propertyAddress, false, {
// 					from: market2,
// 				})
// 				result = await dev.voteCounter.getAgreeCount(market2)
// 				expect(result.toNumber()).to.be.equal(0)
// 				result = await dev.voteCounter.getOppositeCount(market2)
// 				expect(result.toNumber()).to.be.equal(100)
// 			})
// 			it('Voters cannot vote more than once in the same destination.', async () => {
// 				const [dev, propertyAddress] = await init2()
// 				await dev.dev.deposit(propertyAddress, 100, {from: user2})
// 				await dev.addressConfig.setPolicyFactory(policyFactory)
// 				await dev.policyGroup.addGroup(policy, {from: policyFactory})
// 				await dev.voteCounter.addVoteCount(
// 					propertyAuther,
// 					propertyAddress,
// 					true,
// 					{from: policy}
// 				)
// 				const result = await dev.voteCounter
// 					.addVoteCount(propertyAuther, propertyAddress, true, {from: policy})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'revert already vote', false)
// 			})
// 		})
// 		describe('VoteCounter; pause', () => {
// 			it('When you apply a pause, you cannot access the storage.', async () => {
// 				const dev = new DevProtocolInstance(deployer)
// 				await dev.generateAddressConfig()
// 				await dev.generateVoteCounter()
// 				await dev.generateVoteCounterStorage()
// 				await dev.voteCounter.pause()
// 				const result = await dev.voteCounter
// 					.getAgreeCount(user1)
// 					.catch((err: Error) => err)
// 				validatePauseErrorMessage(result, false)
// 				await dev.voteCounter.unpause()
// 				const result2 = await dev.voteCounter.getAgreeCount(user1)
// 				expect(result2.toNumber()).to.be.equal(0)
// 			})
// 		})
// 	}
// )
