import {validateAddressErrorMessage} from '../../test-lib/utils/error'
import {DEFAULT_ADDRESS} from '../../test-lib/const'
import {AddressValidatorInstance} from '../../../types/truffle-contracts'
import {DevProtocolInstance} from '../../test-lib/instance'

contract(
	'AddressValidatorTest',
	([
		deployer,
		validatedAddress,
		market,
		property,
		metrics,
		policy,
		marketFactory,
		propertyFactory,
		metricsFactory,
		policyFactory,
	]) => {
		let addressValidator: AddressValidatorInstance
		before(async () => {
			const addressValidatorContract = artifacts.require('AddressValidator')
			addressValidator = await addressValidatorContract.new({
				from: deployer,
			})
		})
		describe('AddressValidator; validateIllegal', () => {
			it('normal address do not cause an error.', async () => {
				await addressValidator.validateIllegalAddress(validatedAddress)
			})
			it('default address cause an error.', async () => {
				const result = await addressValidator
					.validateIllegalAddress(DEFAULT_ADDRESS)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
		})
		describe('AddressValidator; validateGroup, validateGroups', () => {
			let dev: DevProtocolInstance
			before(async () => {
				dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePropertyGroup(),
					dev.generateMarketGroup(),
					dev.generateMetricsGroup(),
					dev.generatePolicyGroup(),
				])
				await Promise.all([
					dev.addressConfig.setPropertyFactory(propertyFactory),
					dev.addressConfig.setMarketFactory(marketFactory),
					dev.addressConfig.setMetricsFactory(metricsFactory),
					dev.addressConfig.setPolicyFactory(policyFactory),
				])
				await Promise.all([
					dev.propertyGroup.addGroup(property, {from: propertyFactory}),
					dev.marketGroup.addGroup(market, {from: marketFactory}),
					dev.metricsGroup.addGroup(metrics, {from: metricsFactory}),
					dev.policyGroup.addGroup(policy, {from: policyFactory}),
				])
			})
			it('No error occurs if the address belongs to a market group.', async () => {
				await addressValidator.validateGroup(market, dev.marketGroup.address)
			})
			it('No error occurs if the address belongs to a market group.', async () => {
				const result = await addressValidator
					.validateGroup(property, dev.marketGroup.address)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
			it('No error occurs if the address belongs to a property group.', async () => {
				await addressValidator.validateGroup(
					property,
					dev.propertyGroup.address
				)
			})
			it('No error occurs if the address belongs to a property group.', async () => {
				const result = await addressValidator
					.validateGroup(metrics, dev.propertyGroup.address)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
			it('No error occurs if the address belongs to a metrics group.', async () => {
				await addressValidator.validateGroup(metrics, dev.metricsGroup.address)
			})
			it('No error occurs if the address belongs to a metrics group.', async () => {
				const result = await addressValidator
					.validateGroup(policy, dev.metricsGroup.address)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
			it('No error occurs if the address belongs to a policy group.', async () => {
				await addressValidator.validateGroup(policy, dev.policyGroup.address)
			})
			it('No error occurs if the address belongs to a policy group.', async () => {
				const result = await addressValidator
					.validateGroup(market, dev.policyGroup.address)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
			it('No error occurs if you belong to either group(ver1).', async () => {
				await addressValidator.validateGroups(
					policy,
					dev.policyGroup.address,
					dev.metricsGroup.address
				)
			})
			it('No error occurs if you belong to either group(ver2).', async () => {
				await addressValidator.validateGroups(
					metrics,
					dev.policyGroup.address,
					dev.metricsGroup.address
				)
			})
			it('An error occurs if you do not belong to either group.', async () => {
				const result = await addressValidator
					.validateGroups(
						market,
						dev.policyGroup.address,
						dev.metricsGroup.address
					)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
		})
		describe('AddressValidator; validateAddress, validateAddresses', () => {
			it('No error if addresses are the same.', async () => {
				await addressValidator.validateAddress(market, market)
			})
			it('An error occurs if the address is different.', async () => {
				const result = await addressValidator
					.validateAddress(market, policy)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
			it('No error if either address is the same(ver1).', async () => {
				await addressValidator.validateAddresses(market, market, policy)
			})
			it('No error if either address is the same(ver2).', async () => {
				await addressValidator.validateAddresses(market, policy, market)
			})
			it('No error if either address is the same(ver3).', async () => {
				await addressValidator.validate3Addresses(
					property,
					policy,
					market,
					property
				)
			})
			it('An error will occur if the address is different for both.', async () => {
				const result = await addressValidator
					.validateAddresses(market, policy, metrics)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result, false)
			})
		})
	}
)
