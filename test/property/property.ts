/* eslint-disable @typescript-eslint/await-thenable */
import { DevProtocolInstance } from '../test-lib/instance'
import { getPropertyAddress, getTransferToAddress } from '../test-lib/utils/log'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { toBigNumber, splitValue } from '../test-lib/utils/common'
import { getEventValue, waitForEvent } from '../test-lib/utils/event'

contract(
	'PropertyTest',
	([deployer, author, user, propertyFactory, lockup, transfer, nextAuthor]) => {
		const propertyContract = artifacts.require('Property')
		describe('Property; constructor', () => {
			const dev = new DevProtocolInstance(deployer)
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyFactory()
				await dev.generatePolicyGroup()
				await dev.generatePolicy()
			})
			it('Cannot be created from other than factory', async () => {
				const result = await propertyContract
					.new(dev.addressConfig.address, author, 'sample', 'SAMPLE', {
						from: deployer,
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
						from: propertyFactory,
					}
				)
				const tenMillion = toBigNumber(1000).times(10000).times(1e18)
				expect(await propertyInstance.author()).to.be.equal(author)
				expect((await propertyInstance.decimals()).toNumber()).to.be.equal(18)
				const authorBalance = await propertyInstance
					.balanceOf(author)
					.then(toBigNumber)
				const treasuryBalance = await propertyInstance
					.balanceOf(dev.treasury.address)
					.then(toBigNumber)
				const [predictedAutherBalance, predictedTreasuryBalance] = splitValue(
					tenMillion
				)
				expect(authorBalance.toFixed()).to.be.equal(
					predictedAutherBalance.toFixed()
				)
				expect(treasuryBalance.toFixed()).to.be.equal(
					predictedTreasuryBalance.toFixed()
				)
				expect(
					(await propertyInstance.totalSupply().then(toBigNumber)).toFixed()
				).to.be.equal(tenMillion.toFixed())
			})
		})
		describe('Property; changeAuthor', () => {
			const dev = new DevProtocolInstance(deployer)
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyFactory()
				await dev.generatePolicyGroup()
				await dev.generatePolicy()
			})
			it('Executing a changeAuthor function with a non-Author.', async () => {
				await dev.addressConfig.setPropertyFactory(propertyFactory)
				const propertyInstance = await propertyContract.new(
					dev.addressConfig.address,
					author,
					'sample',
					'SAMPLE',
					{
						from: propertyFactory,
					}
				)
				const result = await propertyInstance
					.changeAuthor(nextAuthor)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal sender')
			})
			it('Author is changed.', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				expect(await propertyInstance.author()).to.be.equal(author)
				await propertyInstance.changeAuthor(nextAuthor, {
					from: author,
				})
				expect(await propertyInstance.author()).to.be.equal(nextAuthor)
			})
			it('Should emit ChangeAuthor event from PropertyFactory', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				void propertyInstance.changeAuthor(nextAuthor, {
					from: author,
				})
				const watcher = getEventValue(dev.propertyFactory)
				const event = await Promise.all([
					watcher('ChangeAuthor', '_property'),
					watcher('ChangeAuthor', '_beforeAuthor'),
					watcher('ChangeAuthor', '_afterAuthor'),
				])
				expect(event).to.deep.equal([propertyAddress, author, nextAuthor])
			})
		})
		describe('Property; changeName', () => {
			const dev = new DevProtocolInstance(deployer)
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyFactory()
				await dev.generatePolicyGroup()
				await dev.generatePolicy()
			})
			it('Should fail to call when the sender is not author', async () => {
				await dev.addressConfig.setPropertyFactory(propertyFactory)
				const propertyInstance = await propertyContract.new(
					dev.addressConfig.address,
					author,
					'sample',
					'SAMPLE',
					{
						from: propertyFactory,
					}
				)
				const result = await propertyInstance
					.changeName('next-name')
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal sender')
			})
			it('Change the name', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				expect(await propertyInstance.name()).to.be.equal('sample')
				await propertyInstance.changeName('next-name', {
					from: author,
				})
				expect(await propertyInstance.name()).to.be.equal('next-name')
			})
			it('Should emit ChangeName event from PropertyFactory', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				void propertyInstance.changeName('next-name', {
					from: author,
				})
				const watcher = getEventValue(dev.propertyFactory)
				const event = await Promise.all([
					watcher('ChangeName', '_property'),
					watcher('ChangeName', '_old'),
					watcher('ChangeName', '_new'),
				])
				expect(event).to.deep.equal([propertyAddress, 'sample', 'next-name'])
			})
		})
		describe('Property; changeSymbol', () => {
			const dev = new DevProtocolInstance(deployer)
			before(async () => {
				await dev.generateAddressConfig()
				await dev.generatePolicyFactory()
				await dev.generatePolicyGroup()
				await dev.generatePolicy()
			})
			it('Should fail to call when the sender is not author', async () => {
				await dev.addressConfig.setPropertyFactory(propertyFactory)
				const propertyInstance = await propertyContract.new(
					dev.addressConfig.address,
					author,
					'sample',
					'SAMPLE',
					{
						from: propertyFactory,
					}
				)
				const result = await propertyInstance
					.changeSymbol('NEXTSYMBOL')
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal sender')
			})
			it('Change the symbol', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				expect(await propertyInstance.symbol()).to.be.equal('SAMPLE')
				await propertyInstance.changeSymbol('NEXTSYMBOL', {
					from: author,
				})
				expect(await propertyInstance.symbol()).to.be.equal('NEXTSYMBOL')
			})
			it('Should emit ChangeSymbol event from PropertyFactory', async () => {
				await dev.generatePropertyFactory()
				await dev.generatePropertyGroup()
				const transaction = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author
				)
				const propertyAddress = getPropertyAddress(transaction)
				const propertyInstance = await propertyContract.at(propertyAddress)
				void propertyInstance.changeSymbol('NEXTSYMBOL', {
					from: author,
				})
				const watcher = getEventValue(dev.propertyFactory)
				const event = await Promise.all([
					watcher('ChangeSymbol', '_property'),
					watcher('ChangeSymbol', '_old'),
					watcher('ChangeSymbol', '_new'),
				])
				expect(event).to.deep.equal([propertyAddress, 'SAMPLE', 'NEXTSYMBOL'])
			})
		})
		describe('Property; withdraw', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateDev(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
				])
				await dev.generatePolicy()
				const result = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author,
					{
						from: user,
					}
				)
				propertyAddress = getPropertyAddress(result)
			})
			it('When executed from other than the lockup address', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.withdraw(user, 10, { from: deployer })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.withdraw(user, 10, { from: lockup })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'ERC20: transfer amount exceeds balance')
			})
			it('Dev token balance does not exist in property contract', async () => {
				await dev.addressConfig.setLockup(lockup)
				await dev.dev.mint(propertyAddress, 10)
				const property = await propertyContract.at(propertyAddress)
				await property.withdraw(user, 10, { from: lockup })
			})
		})
		describe('Property; transfer', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateAllocator(),
					dev.generateWithdraw(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateMetricsGroup(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
				])
				await dev.generatePolicy('PolicyTestForProperty')
				const result = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author,
					{
						from: user,
					}
				)
				propertyAddress = getPropertyAddress(result)
			})
			it('An error occurs if the address is invalid', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transfer(DEFAULT_ADDRESS, 10, { from: user })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('An error occurs if the value is invalid', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transfer(transfer, 0, { from: user })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal transfer value')
			})
			it('transfer success', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property.transfer(transfer, 10, { from: author })
				const toAddress = getTransferToAddress(result)
				expect(toAddress).to.be.equal(transfer)
			})
		})
		describe('Property; transferFrom', () => {
			const dev = new DevProtocolInstance(deployer)
			let propertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generateAllocator(),
					dev.generateWithdraw(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateMetricsGroup(),
					dev.generatePolicyFactory(),
					dev.generatePolicyGroup(),
				])
				await dev.generatePolicy('PolicyTestForProperty')
				const result = await dev.propertyFactory.create(
					'sample',
					'SAMPLE',
					author,
					{
						from: user,
					}
				)
				propertyAddress = getPropertyAddress(result)
			})
			it('An error occurs if the from address is invalid', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transferFrom(DEFAULT_ADDRESS, transfer, 10, { from: user })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('An error occurs if the to address is invalid', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transferFrom(transfer, DEFAULT_ADDRESS, 10, { from: user })
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
			it('An error occurs if the value is invalid', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transferFrom(author, transfer, 0, { from: user })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal transfer value')
			})
			it('get an error, dont have enough allowance', async () => {
				const property = await propertyContract.at(propertyAddress)
				const result = await property
					.transferFrom(author, transfer, 10, {
						from: author,
					})
					.catch((err: Error) => err)
				validateErrorMessage(result, 'ERC20: transfer amount exceeds allowance')
			})
			it('transfer success', async () => {
				const property = await propertyContract.at(propertyAddress)
				await property.approve(author, 10, {
					from: author,
				})
				const result = await property.transferFrom(author, transfer, 10, {
					from: author,
				})
				const toAddress = getTransferToAddress(result)
				expect(toAddress).to.be.equal(transfer)
			})
		})
	}
)
