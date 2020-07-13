// TODO

// import {DevProtocolInstance} from '../test-lib/instance'
// import {validateAddressErrorMessage} from '../test-lib/utils/error'

// contract(
// 	'VoteCounterStorageTest',
// 	([deployer, voteCounter, dummyVoteCounter, user, sender, property]) => {
// 		const dev = new DevProtocolInstance(deployer)
// 		before(async () => {
// 			await dev.generateAddressConfig()
// 			await dev.generateVoteCounterStorage()
// 			await dev.addressConfig.setVoteCounter(voteCounter, {from: deployer})
// 		})
// 		describe('VoteCounterStorage; getAlreadyVoteFlg, setAlreadyVoteFlg', () => {
// 			it('Initial value is false.', async () => {
// 				const result = await dev.voteCounterStorage.getAlreadyVoteFlg(
// 					user,
// 					sender,
// 					property,
// 					{from: voteCounter}
// 				)
// 				expect(result).to.be.equal(false)
// 			})
// 			it('The set value can be taken as it is.', async () => {
// 				await dev.voteCounterStorage.setAlreadyVoteFlg(user, sender, property, {
// 					from: voteCounter,
// 				})
// 				const result = await dev.voteCounterStorage.getAlreadyVoteFlg(
// 					user,
// 					sender,
// 					property,
// 					{from: voteCounter}
// 				)
// 				expect(result).to.be.equal(true)
// 			})
// 			it('Cannot rewrite data from other than votecounter.', async () => {
// 				const result = await dev.voteCounterStorage
// 					.setAlreadyVoteFlg(user, sender, property, {from: dummyVoteCounter})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 		})
// 		describe('VoteCounterStorage; getAgreeCount, setAgreeCount', () => {
// 			it('Initial value is 0.', async () => {
// 				const result = await dev.voteCounterStorage.getAgreeCount(sender, {
// 					from: voteCounter,
// 				})
// 				expect(result.toNumber()).to.be.equal(0)
// 			})
// 			it('The set value can be taken as it is.', async () => {
// 				await dev.voteCounterStorage.setAgreeCount(sender, 10, {
// 					from: voteCounter,
// 				})
// 				const result = await dev.voteCounterStorage.getAgreeCount(sender, {
// 					from: voteCounter,
// 				})
// 				expect(result.toNumber()).to.be.equal(10)
// 			})
// 			it('Cannot rewrite data from other than votecounter.', async () => {
// 				const result = await dev.voteCounterStorage
// 					.setAgreeCount(sender, 10, {from: dummyVoteCounter})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 		})
// 		describe('VoteCounterStorage; getOppositeCount, setOppositeCount', () => {
// 			it('Initial value is 0.', async () => {
// 				const result = await dev.voteCounterStorage.getOppositeCount(sender, {
// 					from: voteCounter,
// 				})
// 				expect(result.toNumber()).to.be.equal(0)
// 			})
// 			it('The set value can be taken as it is.', async () => {
// 				await dev.voteCounterStorage.setOppositeCount(sender, 10, {
// 					from: voteCounter,
// 				})
// 				const result = await dev.voteCounterStorage.getOppositeCount(sender, {
// 					from: voteCounter,
// 				})
// 				expect(result.toNumber()).to.be.equal(10)
// 			})
// 			it('Cannot rewrite data from other than votecounter.', async () => {
// 				const result = await dev.voteCounterStorage
// 					.setOppositeCount(sender, 10, {from: dummyVoteCounter})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 		})
// 	}
// )
