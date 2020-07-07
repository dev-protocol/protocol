// Import {DevProtocolInstance} from '../test-lib/instance'
// import {getPropertyAddress, getTransferToAddress} from '../test-lib/utils/log'
// import {
// 	validateErrorMessage,
// 	validateAddressErrorMessage,
// } from '../test-lib/utils/error'
// import {DEFAULT_ADDRESS} from '../test-lib/const'
// import {toBigNumber} from '../test-lib/utils/common'

// contract(
// 	'PropertyTest',
// 	([deployer, author, user, propertyFactory, lockup, transfer]) => {
// 		const propertyContract = artifacts.require('Property')
// 		describe('Property; constructor', () => {
// 			const dev = new DevProtocolInstance(deployer)
// 			before(async () => {
// 				await dev.generateAddressConfig()
// 			})
// 			it('Cannot be created from other than factory', async () => {
// 				const result = await propertyContract
// 					.new(dev.addressConfig.address, author, 'sample', 'SAMPLE', {
// 						from: deployer,
// 					})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('The author, decimal places, and number of issues are fixed values', async () => {
// 				await dev.addressConfig.setPropertyFactory(propertyFactory)
// 				const propertyInstance = await propertyContract.new(
// 					dev.addressConfig.address,
// 					author,
// 					'sample',
// 					'SAMPLE',
// 					{
// 						from: propertyFactory,
// 					}
// 				)
// 				const tenMillion = toBigNumber(1000).times(10000).times(1e18)
// 				expect(await propertyInstance.author()).to.be.equal(author)
// 				expect((await propertyInstance.decimals()).toNumber()).to.be.equal(18)
// 				expect(
// 					(await propertyInstance.balanceOf(author).then(toBigNumber)).toFixed()
// 				).to.be.equal(tenMillion.toFixed())
// 				expect(
// 					(await propertyInstance.totalSupply().then(toBigNumber)).toFixed()
// 				).to.be.equal(tenMillion.toFixed())
// 			})
// 		})
// 		describe('Property; withdraw', () => {
// 			const dev = new DevProtocolInstance(deployer)
// 			let propertyAddress: string
// 			beforeEach(async () => {
// 				await dev.generateAddressConfig()
// 				await Promise.all([
// 					dev.generateVoteTimes(),
// 					dev.generateVoteTimesStorage(),
// 					dev.generatePropertyGroup(),
// 					dev.generatePropertyFactory(),
// 					dev.generateDev(),
// 				])
// 				const result = await dev.propertyFactory.create(
// 					'sample',
// 					'SAMPLE',
// 					author,
// 					{
// 						from: user,
// 					}
// 				)
// 				propertyAddress = getPropertyAddress(result)
// 			})
// 			it('When executed from other than the lockup address', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.withdraw(user, 10, {from: deployer})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('Dev token balance does not exist in property contract', async () => {
// 				await dev.addressConfig.setLockup(lockup)
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.withdraw(user, 10, {from: lockup})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'ERC20: transfer amount exceeds balance')
// 			})
// 			it('Dev token balance does not exist in property contract', async () => {
// 				await dev.addressConfig.setLockup(lockup)
// 				await dev.dev.mint(propertyAddress, 10)
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				await property.withdraw(user, 10, {from: lockup})
// 			})
// 		})
// 		describe('Property; transfer', () => {
// 			const dev = new DevProtocolInstance(deployer)
// 			let propertyAddress: string
// 			beforeEach(async () => {
// 				await dev.generateAddressConfig()
// 				await Promise.all([
// 					dev.generateAllocator(),
// 					dev.generateWithdraw(),
// 					dev.generateWithdrawStorage(),
// 					dev.generateVoteTimes(),
// 					dev.generateVoteTimesStorage(),
// 					dev.generatePropertyGroup(),
// 					dev.generatePropertyFactory(),
// 					dev.generateLockup(),
// 					dev.generateMetricsGroup(),
// 					dev.generatePolicyFactory(),
// 					dev.generatePolicyGroup(),
// 					dev.generatePolicySet(),
// 				])
// 				const policy = await artifacts.require('PolicyTestForProperty').new()
// 				await dev.policyFactory.create(policy.address)
// 				const result = await dev.propertyFactory.create(
// 					'sample',
// 					'SAMPLE',
// 					author,
// 					{
// 						from: user,
// 					}
// 				)
// 				propertyAddress = getPropertyAddress(result)
// 			})
// 			it('An error occurs if the address is invalid', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transfer(DEFAULT_ADDRESS, 10, {from: user})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('An error occurs if the value is invalid', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transfer(transfer, 0, {from: user})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'illegal transfer value')
// 			})
// 			it('transfer success', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property.transfer(transfer, 10, {from: author})
// 				const toAddress = getTransferToAddress(result)
// 				expect(toAddress).to.be.equal(transfer)
// 			})
// 		})
// 		describe('Property; transferFrom', () => {
// 			const dev = new DevProtocolInstance(deployer)
// 			let propertyAddress: string
// 			beforeEach(async () => {
// 				await dev.generateAddressConfig()
// 				await Promise.all([
// 					dev.generateAllocator(),
// 					dev.generateWithdraw(),
// 					dev.generateWithdrawStorage(),
// 					dev.generateVoteTimes(),
// 					dev.generateVoteTimesStorage(),
// 					dev.generatePropertyGroup(),
// 					dev.generatePropertyFactory(),
// 					dev.generateLockup(),
// 					dev.generateMetricsGroup(),
// 					dev.generatePolicyFactory(),
// 					dev.generatePolicyGroup(),
// 					dev.generatePolicySet(),
// 				])
// 				const policy = await artifacts.require('PolicyTestForProperty').new()
// 				await dev.policyFactory.create(policy.address)
// 				const result = await dev.propertyFactory.create(
// 					'sample',
// 					'SAMPLE',
// 					author,
// 					{
// 						from: user,
// 					}
// 				)
// 				propertyAddress = getPropertyAddress(result)
// 			})
// 			it('An error occurs if the from address is invalid', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transferFrom(DEFAULT_ADDRESS, transfer, 10, {from: user})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('An error occurs if the to address is invalid', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transferFrom(transfer, DEFAULT_ADDRESS, 10, {from: user})
// 					.catch((err: Error) => err)
// 				validateAddressErrorMessage(result)
// 			})
// 			it('An error occurs if the value is invalid', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transferFrom(author, transfer, 0, {from: user})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'illegal transfer value')
// 			})
// 			it('get an error, dont have enough allowance', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				const result = await property
// 					.transferFrom(author, transfer, 10, {
// 						from: author,
// 					})
// 					.catch((err: Error) => err)
// 				validateErrorMessage(result, 'ERC20: transfer amount exceeds allowance')
// 			})
// 			it('transfer success', async () => {
// 				// eslint-disable-next-line @typescript-eslint/await-thenable
// 				const property = await propertyContract.at(propertyAddress)
// 				await property.approve(author, 10, {
// 					from: author,
// 				})
// 				const result = await property.transferFrom(author, transfer, 10, {
// 					from: author,
// 				})
// 				const toAddress = getTransferToAddress(result)
// 				expect(toAddress).to.be.equal(transfer)
// 			})
// 		})
// 	}
// )
