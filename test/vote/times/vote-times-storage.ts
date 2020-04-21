import {DevProtocolInstance} from '../../test-lib/instance'
import {validateAddressErrorMessage} from '../../test-lib/utils/error'

contract(
	'VoteTimesStorageTest',
	([deployer, voteTimes, dummyVoteTimes, property, property2]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateVoteTimesStorage()
			await dev.addressConfig.setVoteTimes(voteTimes, {from: deployer})
		})
		describe('VoteTimesStorage; getVoteTimes, setVoteTimes', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.voteTimesStorage.getVoteTimes({
					from: voteTimes,
				})
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.voteTimesStorage.setVoteTimes(3, {from: voteTimes})
				const result = await dev.voteTimesStorage.getVoteTimes({
					from: voteTimes,
				})
				expect(result.toNumber()).to.be.equal(3)
			})
			it('Cannot rewrite data from other than votetimes.', async () => {
				const result = await dev.voteTimesStorage
					.setVoteTimes(2, {from: dummyVoteTimes})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('VoteTimesStorage; getVoteTimesByProperty, setVoteTimesByProperty', () => {
			it('Initial value is 0.', async () => {
				const result = await dev.voteTimesStorage.getVoteTimesByProperty(
					property,
					{from: voteTimes}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('The set value can be taken as it is.', async () => {
				await dev.voteTimesStorage.setVoteTimesByProperty(property, 3, {
					from: voteTimes,
				})
				const result = await dev.voteTimesStorage.getVoteTimesByProperty(
					property,
					{from: voteTimes}
				)
				expect(result.toNumber()).to.be.equal(3)
			})
			it('If not set, initial value can be taken.', async () => {
				const result = await dev.voteTimesStorage.getVoteTimesByProperty(
					property2,
					{from: voteTimes}
				)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('Cannot rewrite data from other than votetimes.', async () => {
				const result = await dev.voteTimesStorage
					.setVoteTimesByProperty(property, 3, {from: dummyVoteTimes})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
