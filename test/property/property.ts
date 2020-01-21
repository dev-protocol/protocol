import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateAddressErrorMessage,
	getPropertyAddress
} from '../test-lib/utils'

contract('PropertyTest', ([deployer, author, user, propertyFactory]) => {
	const propertyContract = artifacts.require('Property')
	describe('Property; constructor', () => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
		})
		it('Cannot be created from other than factory', async () => {
			const result = await propertyContract
				.new(dev.addressConfig.address, author, 'sample', 'SAMPLE', {
					from: deployer
				})
				.catch((err: Error) => err)
			validateAddressErrorMessage(result as Error)
		})
		it('The author, decimal places, and number of issues are fixed values', async () => {
			await dev.addressConfig.setPropertyFactory(propertyFactory)
			const propertyInstance = await propertyContract.new(
				dev.addressConfig.address,
				author,
				'sample',
				'SAMPLE',
				{
					from: propertyFactory
				}
			)
			expect(await propertyInstance.author()).to.be.equal(author)
			expect((await propertyInstance.decimals()).toNumber()).to.be.equal(18)
			expect((await propertyInstance.balanceOf(author)).toNumber()).to.be.equal(
				10000000
			)
		})
	})
	describe('Property; withdrawDev', () => {
		const dev = new DevProtocolInstance(deployer)
		let propertyAddress: string
		beforeEach(async () => {
			await dev.generateAddressConfig()
			await dev.generateLockup()
			await dev.generateLockupStorage()
			await dev.generateVoteTimes()
			await dev.generateVoteTimesStorage()
			await dev.generatePropertyGroup()
			await dev.generatePropertyFactory()
			const result = await dev.propertyFactory.create(
				'sample',
				'SAMPLE',
				author,
				{
					from: user
				}
			)
			propertyAddress = getPropertyAddress(result)
		})
		it('When executed from other than the lockup address', async () => {
			// eslint-disable-next-line @typescript-eslint/await-thenable
			const property = await propertyContract.at(propertyAddress)
			const result = await property
				.withdrawDev(user, {from: deployer})
				.catch((err: Error) => err)
			validateAddressErrorMessage(result as Error)
		})
		it('When withdrawn successfully')
	})
})
