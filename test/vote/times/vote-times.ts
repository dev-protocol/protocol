import {DevProtpcolInstance} from './../../lib/instance'
import {VoteTimesStorageInstance} from '../../../types/truffle-contracts'

contract(
	'VoteTimesTest',
	([
		deployer,
		marketFactory,
		propertyFactory,
		property,
		dummyProperty,
		voteCounter
	]) => {
		const dev = new DevProtpcolInstance(deployer)
		describe('VoteTimes; addVoteTimes, addVoteTimesByProperty, resetVoteTimesByProperty', () => {
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generateVoteTimes()
				await dev.generateVoteTimesStorage()
				await dev.generatePropertyGroup()
				await dev.addressConfig.setMarketFactory(marketFactory, {
					from: deployer
				})
				await dev.addressConfig.setPropertyFactory(propertyFactory, {
					from: deployer
				})
				await dev.addressConfig.setVoteCounter(voteCounter, {from: deployer})
				await dev.propertyGroup.addGroup(property, {from: propertyFactory})
				await dev.voteTimes.addVoteTime({from: marketFactory})
				await dev.voteTimes.addVoteTime({from: marketFactory})
				await dev.voteTimes.addVoteTimesByProperty(property, {
					from: voteCounter
				})
			})
			it('If the vote was held twice, but the vote was held only once, the number of abstentions will be 1.', async () => {
				const result = await dev.voteTimes.getAbstentionTimes(property)
				expect(result.toNumber()).to.be.equal(1)
			})
			it('When reset, the number of abstentions becomes 0.', async () => {
				await dev.voteTimes.resetVoteTimesByProperty(property, {
					from: propertyFactory
				})
				const result = await dev.voteTimes.getAbstentionTimes(property)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('If the number of votes is 0, the number of votes cast is the number of abstentions.', async () => {
				const result = await dev.voteTimes.getAbstentionTimes(dummyProperty)
				expect(result.toNumber()).to.be.equal(2)
			})
			it('Storage information can be taken over.', async () => {
				const storageAddress = await dev.voteTimesStorage.getStorageAddress({
					from: deployer
				})
				const newVoteTimesStorage = await dev.generateInstance<
					VoteTimesStorageInstance
				>('VoteTimesStorage')
				await newVoteTimesStorage.setStorage(storageAddress, {
					from: deployer
				})
				await dev.voteTimesStorage.changeOwner(newVoteTimesStorage.address, {
					from: deployer
				})
				await dev.addressConfig.setVoteTimesStorage(
					newVoteTimesStorage.address,
					{
						from: deployer
					}
				)
				await dev.voteTimes.addVoteTime({from: marketFactory})
				const result = await dev.voteTimes.getAbstentionTimes(property)
				expect(result.toNumber()).to.be.equal(1)
			})
		})
	}
)
