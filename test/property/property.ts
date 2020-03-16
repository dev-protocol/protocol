import {DevProtocolInstance} from '../test-lib/instance'
import {getPropertyAddress} from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validateAddressErrorMessage
} from '../test-lib/utils/error'
import {DEFAULT_ADDRESS} from '../test-lib/const'

contract(
	'PropertyTest',
	([deployer, author, user, propertyFactory, lockup, transfer]) => {
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
				validateAddressErrorMessage(result)
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
				).to.be.equal(10000000000000000000000000)
			})
		})
		describe('Property; withdraw', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateDev()
				])
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
				validateAddressErrorMessage(result)
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.withdraw(user, 10, {from: lockup})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'ERC20: transfer amount exceeds balance')
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				await dev.dev.mint(propertyAddress, 10)
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				await property.withdraw(user, 10, {from: lockup})
			})
		})
		describe('Property; transfer', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateAllocator(),
					dev.generateAllocatorStorage(),
					dev.generateWithdraw(),
					dev.generateWithdrawStorage(),
					dev.generateVoteTimes(),
					dev.generateVoteTimesStorage(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory()
				])
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
			it('An error occurs if the address is invalid', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transfer(DEFAULT_ADDRESS, 10, {from: user})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('An error occurs if the value is invalid', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transfer(transfer, 0, {from: user})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal transfer value')
			})
			it('transfer success', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const property = await propertyContract.at(propertyAddress)
				await property.transfer(transfer, 10, {from: author})
			})
		})
	}
)
