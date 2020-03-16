import {DevProtocolInstance} from '../test-lib/instance'
import {getPropertyAddress} from '../test-lib/utils/log'
import {validateErrorMessage} from '../test-lib/utils/error'

contract('PropertyFactoryTest', ([deployer, user, user2, marketFactory]) => {
	const dev = new DevProtocolInstance(deployer)
	const propertyContract = artifacts.require('Property')
	describe('PropertyFactory; create', () => {
		let propertyAddress: string
		before(async () => {
			await dev.generateAddressConfig()
			await Promise.all([
				dev.generatePropertyFactory(),
				dev.generatePropertyGroup(),
				dev.generateVoteTimes(),
				dev.generateVoteTimesStorage()
			])
			await dev.addressConfig.setMarketFactory(marketFactory)
			const result = await dev.propertyFactory.create(
				'sample',
				'SAMPLE',
				user,
				{
					from: user2
				}
			)
			propertyAddress = getPropertyAddress(result)
		})

		it('Create a new property contract and emit create event telling created property address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const deployedProperty = await propertyContract.at(propertyAddress)
			const name = await deployedProperty.name({from: user2})
			const symbol = await deployedProperty.symbol({from: user2})
			const decimals = await deployedProperty.decimals({from: user2})
			const totalSupply = await deployedProperty.totalSupply({from: user2})
			const author = await deployedProperty.author({from: user2})
			expect(name).to.be.equal('sample')
			expect(symbol).to.be.equal('SAMPLE')
			expect(decimals.toNumber()).to.be.equal(18)
			expect(totalSupply.toNumber()).to.be.equal(10000000000000000000000000)
			expect(author).to.be.equal(user)
		})

		it('2 characters name cause an error.', async () => {
			const result = await dev.propertyFactory
				.create('te', 'TEST', user, {
					from: user2
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'name must be at least 3 and no more than 10 characters'
			)
		})
		it('3 characters name donot cause an error.', async () => {
			const result = await dev.propertyFactory.create('tes', 'TEST', user, {
				from: user2
			})
			const propertyAddress = getPropertyAddress(result)
			// eslint-disable-next-line no-undef
			const isAddress = web3.utils.isAddress(propertyAddress)
			expect(isAddress).to.be.equal(true)
		})
		it('10 characters name cause an error.', async () => {
			const result = await dev.propertyFactory.create(
				'0123456789',
				'TEST',
				user,
				{
					from: user2
				}
			)
			const propertyAddress = getPropertyAddress(result)
			// eslint-disable-next-line no-undef
			const isAddress = web3.utils.isAddress(propertyAddress)
			expect(isAddress).to.be.equal(true)
		})
		it('11 characters name cause an error.', async () => {
			const result = await dev.propertyFactory
				.create('01234567890', 'TEST', user, {
					from: user2
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'name must be at least 3 and no more than 10 characters'
			)
		})
		it('2 characters symbol cause an error.', async () => {
			const result = await dev.propertyFactory
				.create('test', 'TE', user, {
					from: user2
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'symbol must be at least 3 and no more than 10 characters'
			)
		})
		it('3 characters symbol donot cause an error.', async () => {
			const result = await dev.propertyFactory.create('test', 'TES', user, {
				from: user2
			})
			const propertyAddress = getPropertyAddress(result)
			// eslint-disable-next-line no-undef
			const isAddress = web3.utils.isAddress(propertyAddress)
			expect(isAddress).to.be.equal(true)
		})
		it('10 characters symbol cause an error.', async () => {
			const result = await dev.propertyFactory.create(
				'test',
				'0123456789',
				user,
				{
					from: user2
				}
			)
			const propertyAddress = getPropertyAddress(result)
			// eslint-disable-next-line no-undef
			const isAddress = web3.utils.isAddress(propertyAddress)
			expect(isAddress).to.be.equal(true)
		})
		it('11 characters symbol cause an error.', async () => {
			const result = await dev.propertyFactory
				.create('test', '01234567890', user, {
					from: user2
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'symbol must be at least 3 and no more than 10 characters'
			)
		})
		it('Adds a new property contract address to state contract', async () => {
			const isProperty = await dev.propertyGroup.isGroup(propertyAddress)
			expect(isProperty).to.be.equal(true)
		})
		it('Pause and release of pause can only be executed by deployer.', async () => {
			let result = await dev.propertyFactory
				.pause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.propertyFactory.pause({from: deployer})
			result = await dev.propertyFactory
				.unpause({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'PauserRole: caller does not have the Pauser role'
			)
			await dev.propertyFactory.unpause({from: deployer})
		})
		it('Cannot run if paused.', async () => {
			await dev.propertyFactory.pause({from: deployer})
			const result = await dev.propertyFactory
				.create('sample2', 'SAMPLE2', user, {
					from: user2
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'You cannot use that')
		})
		it('Can be executed when pause is released', async () => {
			await dev.propertyFactory.unpause({from: deployer})
			const createResult = await dev.propertyFactory.create(
				'sample2',
				'SAMPLE2',
				user,
				{
					from: user2
				}
			)
			const tmpPropertyAddress = getPropertyAddress(createResult)
			const result = await dev.propertyGroup.isGroup(tmpPropertyAddress, {
				from: deployer
			})
			expect(result).to.be.equal(true)
		})
		it('The number of votes for each property is the total number of votes at the creation timing', async () => {
			await dev.voteTimes.addVoteTime({from: marketFactory})
			const createResult = await dev.propertyFactory.create(
				'sample3',
				'SAMPLE3',
				user,
				{
					from: user2
				}
			)
			const tmpPropertyAddress = getPropertyAddress(createResult)
			const voteTimeByProperty = await dev.voteTimesStorage.getVoteTimesByProperty(
				propertyAddress
			)
			expect(voteTimeByProperty.toNumber()).to.be.equal(0)
			const voteTimeByPropertyNow = await dev.voteTimesStorage.getVoteTimesByProperty(
				tmpPropertyAddress
			)
			expect(voteTimeByPropertyNow.toNumber()).to.be.equal(1)
		})
	})
})
