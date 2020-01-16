import {validateErrorMessage} from '../test-lib/utils'

contract('PropertyTest', ([deployer, ui]) => {
	const lockupContract = artifacts.require('Lockup')
	const propertyFactoryContract = artifacts.require('PropertyFactory')
	const propertyContract = artifacts.require('Property')
	const propertyGroupContract = artifacts.require('PropertyGroup')
	const addressConfigContract = artifacts.require('AddressConfig')
	const voteTimesContract = artifacts.require('VoteTimes')
	const voteTimesStorageContract = artifacts.require('VoteTimesStorage')
	const decimalsLibrary = artifacts.require('Decimals')
	describe('Property; withdrawDev', () => {
		let propertyFactory: any
		let propertyGroup: any
		let addressConfig: any
		let propertyAddress: any
		let voteTimes: any
		let lockup: any
		let property: any
		beforeEach(async () => {
			addressConfig = await addressConfigContract.new({from: deployer})
			const decimals = await decimalsLibrary.new({from: deployer})
			await lockupContract.link('Decimals', decimals.address)
			lockup = await lockupContract.new(addressConfig.address)
			voteTimes = await voteTimesContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setVoteTimes(voteTimes.address, {
				from: deployer
			})
			const voteTimesStorage = await voteTimesStorageContract.new(
				addressConfig.address,
				{
					from: deployer
				}
			)
			await voteTimesStorage.createStorage()
			await addressConfig.setVoteTimesStorage(voteTimesStorage.address, {
				from: deployer
			})
			propertyGroup = await propertyGroupContract.new(addressConfig.address, {
				from: deployer
			})
			propertyGroup.createStorage()
			await addressConfig.setPropertyGroup(propertyGroup.address, {
				from: deployer
			})

			await addressConfig.setLockup(lockup.address, {
				from: deployer
			})
			propertyFactory = await propertyFactoryContract.new(
				addressConfig.address,
				{from: deployer}
			)
			await addressConfig.setPropertyFactory(propertyFactory.address, {
				from: deployer
			})
			const result = await propertyFactory.create('sample', 'SAMPLE', ui, {
				from: ui
			})
			propertyAddress = await result.logs.filter(
				(e: {event: string}) => e.event === 'Create'
			)[0].args._property
		})
		it('When executed from other than the lockup address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			property = await propertyContract.at(propertyAddress)
			const result = await property
				.withdrawDev(ui, {from: deployer})
				.catch((err: Error) => err)
			validateErrorMessage(result as Error, 'this address is not proper')
		})
		it('When lockup value is 0', async () => {
			// Will be described later
		})
		it('When withdrawn successfully', async () => {
			// Will be described later
		})
	})
})
