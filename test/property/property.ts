import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateAddressErrorMessage,
	validateErrorMessage,
	getPropertyAddress
} from '../test-lib/utils'

contract(
	'PropertyTest',
	([deployer, author, user, propertyFactory, lockup]) => {
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
				expect(
					(await propertyInstance.balanceOf(author)).toNumber()
				).to.be.equal(10000000)
			})
		})
		describe('Property; withdraw', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateVoteTimes()
				await dev.generateVoteTimesStorage()
				await dev.generatePropertyGroup()
				await dev.generatePropertyFactory()
				await dev.generateDev()
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
					.withdraw(user, 10, {from: deployer})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result as Error)
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.withdraw(user, 10, {from: lockup})
					.catch((err: Error) => err)
				validateErrorMessage(
					result as Error,
					'ERC20: transfer amount exceeds balance'
				)
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				await dev.dev.mint(propertyAddress, 10)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				await property.withdraw(user, 10, {from: lockup})
			})
		})
	}
)
