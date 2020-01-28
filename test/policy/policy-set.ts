import {DevProtocolInstance} from '../test-lib/instance'
import {validateAddressErrorMessage, DEFAULT_ADDRESS} from '../test-lib/utils'

contract(
	'PolicySetTest',
	([
		deployer,
		policyFactory,
		dummyPolicyFactory,
		policy1,
		policy2,
		policy3
	]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generatePolicySet()
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer
			})
			await dev.policySet.addSet(policy1, {from: policyFactory})
			await dev.policySet.addSet(policy2, {from: policyFactory})
		})
		describe('PolicySet; addSet', () => {
			it('Can not execute addSet without policyGroup address', async () => {
				const result = await dev.policySet
					.addSet(policy3, {
						from: dummyPolicyFactory
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicySet; count', () => {
			it('Can get setted policy count', async () => {
				const result = await dev.policySet.count()
				expect(result.toNumber()).to.be.equal(2)
			})
		})
		describe('PolicySet; get', () => {
			it('Can get setted policy using index', async () => {
				let result = await dev.policySet.get(0)
				expect(result).to.be.equal(policy1)
				result = await dev.policySet.get(1)
				expect(result).to.be.equal(policy2)
			})
		})
		describe('PolicySet; deleteAll', () => {
			it('Can not get setted policy using index', async () => {
				await dev.policySet.deleteAll({from: policyFactory})
				let result = await dev.policySet.get(0)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
				result = await dev.policySet.get(1)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
			})
			it('Can not execute deleteAll without policyFactory address', async () => {
				const result = await dev.policySet
					.deleteAll({from: dummyPolicyFactory})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
