// TODO

// import {DevProtocolInstance} from '../test-lib/instance'
// import {getPropertyAddress} from '../test-lib/utils/log'
// import {
// 	validateErrorMessage,
// 	validateAddressErrorMessage,
// 	validatePauseErrorMessage,
// } from '../test-lib/utils/error'

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

// Describe('Market; vote', () => {
// 	const dev = new DevProtocolInstance(deployer)
// 	let marketAddress: string
// 	let propertyAddress: string
// 	const iPolicyContract = artifacts.require('IPolicy')
// 	beforeEach(async () => {
// 		await dev.generateAddressConfig()
// 		await Promise.all([
// 			dev.generateMarketFactory(),
// 			dev.generateMarketGroup(),
// 			dev.generatePolicyFactory(),
// 			dev.generatePolicyGroup(),
// 			dev.generatePolicySet(),
// 			dev.generateVoteCounter(),
// 			dev.generatePropertyFactory(),
// 			dev.generatePropertyGroup(),
// 			dev.generateLockup(),
// 			dev.generateDev(),
// 			dev.generateWithdraw(),
// 			dev.generateWithdrawStorage(),
// 			dev.generateAllocator(),
// 			dev.generateMetricsFactory(),
// 			dev.generateMetricsGroup(),
// 		])
// 		const iPolicyInstance = await dev.getPolicy('PolicyTest1', user)
// 		await dev.policyFactory.create(iPolicyInstance.address)
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		const createPropertyResult = await dev.propertyFactory.create(
// 			'test',
// 			'TEST',
// 			propertyAuther
// 		)
// 		propertyAddress = getPropertyAddress(createPropertyResult)
// 		await dev.dev.mint(user, 10000, {from: deployer})
// 	})

// 	it('An error occurs if anything other than property address is specified.', async () => {
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		const result = await marketInstance
// 			.vote(deployer, true, {from: user})
// 			.catch((err: Error) => err)
// 		validateAddressErrorMessage(result)
// 	})
// 	it('voting deadline is over.', async () => {
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const iPolicyInstance = await iPolicyContract.at(
// 			await dev.addressConfig.policy()
// 		)
// 		const marketVotingBlocks = await iPolicyInstance.marketVotingBlocks()
// 		await mine(marketVotingBlocks.toNumber())
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		const result = await marketInstance
// 			.vote(propertyAddress, true)
// 			.catch((err: Error) => err)
// 		validateErrorMessage(result, 'voting deadline is over')
// 	})
// 	it('Should fail to vote when already determined enabled.', async () => {
// 		await dev.dev.deposit(propertyAddress, 10000, {from: user})
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		// Await marketInstance.vote(propertyAddress, true, {from: user})
// 		expect(await marketInstance.enabled()).to.be.equal(true)
// 		const result = await marketInstance
// 			.vote(propertyAddress, true, {from: user})
// 			.catch((err: Error) => err)
// 		validateErrorMessage(result, 'market is already enabled')
// 	})

// 	it('If you specify true, it becomes a valid vote.', async () => {
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		await dev.dev.deposit(propertyAddress, 10000, {from: user})
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		await marketInstance.vote(propertyAddress, true, {from: user})
// 		const agreeCount = await dev.voteCounter.getAgreeCount(marketAddress)
// 		const oppositeCount = await dev.voteCounter.getOppositeCount(
// 			marketAddress
// 		)
// 		expect(agreeCount.toNumber()).to.be.equal(10000)
// 		expect(oppositeCount.toNumber()).to.be.equal(0)
// 	})

// 	it('If false is specified, it becomes an invalid vote.', async () => {
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		await dev.dev.deposit(propertyAddress, 10000, {from: user})
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		await marketInstance.vote(propertyAddress, false, {from: user})
// 		const agreeCount = await dev.voteCounter.getAgreeCount(marketAddress)
// 		const oppositeCount = await dev.voteCounter.getOppositeCount(
// 			marketAddress
// 		)
// 		expect(agreeCount.toNumber()).to.be.equal(0)
// 		expect(oppositeCount.toNumber()).to.be.equal(10000)
// 	})

// 	it('If the number of valid votes is not enough, it remains invalid.', async () => {
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		await dev.dev.deposit(propertyAddress, 9000, {from: user})
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		await marketInstance.vote(propertyAddress, true, {from: user})
// 		expect(await marketInstance.enabled()).to.be.equal(false)
// 	})
// 	it('Becomes valid when the number of valid votes exceeds the specified number.', async () => {
// 		const createMarketResult = await dev.marketFactory.create(behavuor)
// 		marketAddress = getMarketAddress(createMarketResult)
// 		await dev.dev.deposit(propertyAddress, 10000, {from: user})
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const marketInstance = await marketContract.at(marketAddress)
// 		await marketInstance.vote(propertyAddress, true, {from: user})
// 		expect(await marketInstance.enabled()).to.be.equal(true)
// 	})
// })

// describe('A new Policy; vote', () => {
// 	const policyContract = artifacts.require('Policy')
// 	let firstPolicyInstance: PolicyInstance
// 	let createdPropertyAddress: string
// 	beforeEach(async () => {
// 		await dev.generateAddressConfig()
// 		await Promise.all([
// 			dev.generatePolicyGroup(),
// 			dev.generatePolicySet(),
// 			dev.generatePolicyFactory(),
// 			dev.generateVoteCounter(),
// 			dev.generateMarketFactory(),
// 			dev.generateMarketGroup(),
// 			dev.generatePropertyGroup(),
// 			dev.generatePropertyFactory(),
// 			dev.generateLockup(),
// 			dev.generateAllocator(),
// 			dev.generateWithdraw(),
// 			dev.generateWithdrawStorage(),
// 			dev.generateMetricsGroup(),
// 			dev.generateDev(),
// 		])
// 		await dev.dev.mint(user1, 100, {from: deployer})
// 		await dev.dev.mint(user2, 100, {from: deployer})
// 		policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const policyCreateResult = await dev.policyFactory.create(
// 			policy.address,
// 			{from: user1}
// 		)
// 		const firstPolicyAddress = getPolicyAddress(policyCreateResult)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		firstPolicyInstance = await policyContract.at(firstPolicyAddress)
// 		const propertyCreateResult = await dev.propertyFactory.create(
// 			'test',
// 			'TST',
// 			propertyAuther
// 		)
// 		createdPropertyAddress = getPropertyAddress(propertyCreateResult)
// 	})
// 	it('Should fail when 1st args is not Property address.', async () => {
// 		const result = await firstPolicyInstance
// 			.vote(dummyProperty, true)
// 			.catch((err: Error) => err)
// 		validateAddressErrorMessage(result)
// 	})
// 	it('Should fail voting to the already enable Policy.', async () => {
// 		const result = await firstPolicyInstance
// 			.vote(createdPropertyAddress, true)
// 			.catch((err: Error) => err)
// 		validateErrorMessage(result, 'this policy is current')
// 	})
// 	it('Should fail to vote when after the voting period.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		const count = await secondPolicyInstance.policyVotingBlocks()
// 		await mine(count.toNumber())
// 		const voteResult = await secondPolicyInstance
// 			.vote(createdPropertyAddress, true)
// 			.catch((err: Error) => err)
// 		validateErrorMessage(voteResult, 'voting deadline is over')
// 	})
// 	it('Should fail to vote when the number of lockups and the market reward is 0.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		const voteResult = await secondPolicyInstance
// 			.vote(createdPropertyAddress, true)
// 			.catch((err: Error) => err)
// 		validateErrorMessage(voteResult, 'vote count is 0')
// 	})
// 	it('Should fail to vote when already voted.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await secondPolicyInstance.vote(createdPropertyAddress, true, {
// 			from: user1,
// 		})
// 		const voteResult = await secondPolicyInstance
// 			.vote(createdPropertyAddress, true, {from: user1})
// 			.catch((err: Error) => err)
// 		validateErrorMessage(voteResult, 'already vote')
// 	})
// 	it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote when a Property owner votes for.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		let agreeCount = await dev.voteCounter.getAgreeCount(
// 			secondPolicyAddress
// 		)
// 		expect(agreeCount.toNumber()).to.be.equal(0)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
// 		await secondPolicyInstance.vote(createdPropertyAddress, true, {
// 			from: propertyAuther,
// 		})
// 		agreeCount = await dev.voteCounter.getAgreeCount(secondPolicyAddress)
// 		expect(agreeCount.toNumber()).to.be.equal(200)
// 	})
// 	it('The number of votes VoteTimes is added when the Property owner voted.', async () => {
// 		let times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await secondPolicyInstance.vote(createdPropertyAddress, true, {
// 			from: propertyAuther,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 	})
// 	it('VoteTimes votes will not be added when a vote by other than Property owner voted for.', async () => {
// 		let times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await secondPolicyInstance.vote(createdPropertyAddress, true, {
// 			from: user1,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 	})
// 	it('The number of lock-ups for it Property and the accumulated Market reward will be added to the vote against when a Property owner votes against.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		let agreeCount = await dev.voteCounter.getAgreeCount(
// 			secondPolicyAddress
// 		)
// 		expect(agreeCount.toNumber()).to.be.equal(0)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
// 		await secondPolicyInstance.vote(createdPropertyAddress, false, {
// 			from: propertyAuther,
// 		})
// 		agreeCount = await dev.voteCounter.getOppositeCount(secondPolicyAddress)
// 		expect(agreeCount.toNumber()).to.be.equal(200)
// 	})
// 	it('The number of votes VoteTimes is added when the Property owner votes against.', async () => {
// 		let times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await secondPolicyInstance.vote(createdPropertyAddress, false, {
// 			from: propertyAuther,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 	})
// 	it('VoteCounter votes will not be added when a vote by other than Property owner voted against.', async () => {
// 		let times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(0)
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await secondPolicyInstance.vote(createdPropertyAddress, false, {
// 			from: user1,
// 		})
// 		times = await getAbstentionTimes(dev, createdPropertyAddress)
// 		expect(times).to.be.equal(1)
// 	})
// 	it('When an account of other than Property owner votes for, the number of lock-ups in the Property by its account will be added to the vote.', async () => {
// 		const second = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
// 		const result = await dev.policyFactory.create(second.address, {
// 			from: user1,
// 		})
// 		const secondPolicyAddress = getPolicyAddress(result)
// 		// eslint-disable-next-line @typescript-eslint/await-thenable
// 		const secondPolicyInstance = await policyContract.at(
// 			secondPolicyAddress
// 		)
// 		let agreeCount = await dev.voteCounter.getAgreeCount(
// 			secondPolicyAddress
// 		)
// 		expect(agreeCount.toNumber()).to.be.equal(0)
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user1})
// 		await dev.dev.deposit(createdPropertyAddress, 100, {from: user2})
// 		await secondPolicyInstance.vote(createdPropertyAddress, true, {
// 			from: user1,
// 		})
// 		agreeCount = await dev.voteCounter.getAgreeCount(secondPolicyAddress)
// 		expect(agreeCount.toNumber()).to.be.equal(100)
// 	})
// })

// voteCounterからMarket.enabledが実行できる
// voteCounterからMarketのvoteができる
// voteCounterからPolicyのvoteができる

// policyFactory. getVotingGroupIndexのテスト

// Policyset円パン

// votecounter全般
