import {DevProtocolInstance} from '../test-lib/instance'
import {getPropertyAddress} from '../test-lib/utils/log'
import {validateErrorMessage} from '../test-lib/utils/error'
import {toBigNumber} from '../test-lib/utils/common'

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
			])
			await dev.addressConfig.setMarketFactory(marketFactory)
			const result = await dev.propertyFactory.create(
				'sample',
				'SAMPLE',
				user,
				{
					from: user2,
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
			const totalSupply = await deployedProperty
				.totalSupply({from: user2})
				.then(toBigNumber)
			const author = await deployedProperty.author({from: user2})
			expect(name).to.be.equal('sample')
			expect(symbol).to.be.equal('SAMPLE')
			expect(decimals.toNumber()).to.be.equal(18)
			expect(totalSupply.toFixed()).to.be.equal(
				toBigNumber(1000).times(10000).times(1e18).toFixed()
			)
			expect(author).to.be.equal(user)
		})

		it('2 characters name cause an error.', async () => {
			const result = await dev.propertyFactory
				.create('te', 'TEST', user, {
					from: user2,
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'name must be at least 3 and no more than 10 characters'
			)
		})
		it('3 characters name donot cause an error.', async () => {
			const result = await dev.propertyFactory.create('tes', 'TEST', user, {
				from: user2,
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
					from: user2,
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
					from: user2,
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
					from: user2,
				})
				.catch((err: Error) => err)
			validateErrorMessage(
				result,
				'symbol must be at least 3 and no more than 10 characters'
			)
		})
		it('3 characters symbol donot cause an error.', async () => {
			const result = await dev.propertyFactory.create('test', 'TES', user, {
				from: user2,
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
					from: user2,
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
					from: user2,
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
	})
})
