import {DevProtocolInstance} from '../test-lib/instance'
import {validateAddressErrorMessage} from '../test-lib/utils/error'
import {DEFAULT_ADDRESS} from '../test-lib/const'
import {mine} from '../test-lib/utils/common'

contract(
	'PolicySetTest',
	([
		deployer,
		policyFactory,
		dummyPolicyFactory,
		policy1,
		policy2,
		policy3,
	]) => {
		const init = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generatePolicySet()
			await dev.addressConfig.setPolicyFactory(policyFactory, {
				from: deployer,
			})
			await dev.policySet.addSet(policy1, {from: policyFactory})
			await dev.policySet.addSet(policy2, {from: policyFactory})
			return dev
		}

		describe('PolicySet; addSet', () => {
			it('Can not execute addSet without policyGroup address', async () => {
				const dev = await init()
				const result = await dev.policySet
					.addSet(policy3, {
						from: dummyPolicyFactory,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicySet; count', () => {
			it('Can get setted policy count', async () => {
				const dev = await init()
				const result = await dev.policySet.count()
				expect(result.toNumber()).to.be.equal(2)
			})
		})
		describe('PolicySet; get', () => {
			it('Can get setted policy using index', async () => {
				const dev = await init()
				let result = await dev.policySet.get(0)
				expect(result).to.be.equal(policy1)
				result = await dev.policySet.get(1)
				expect(result).to.be.equal(policy2)
			})
		})
		describe('PolicySet; reset', () => {
			it('Can not get setted policy using index', async () => {
				const dev = await init()
				let idx = await dev.policySet.getVotingGroupIndex()
				expect(idx.toNumber()).to.be.equal(0)
				await dev.policySet.reset({from: policyFactory})
				let result = await dev.policySet.get(0)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
				result = await dev.policySet.get(1)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
				idx = await dev.policySet.getVotingGroupIndex()
				expect(idx.toNumber()).to.be.equal(1)
			})
			it('Can not execute reset without policyFactory address', async () => {
				const dev = await init()
				const result = await dev.policySet
					.reset({from: dummyPolicyFactory})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('PolicySet; setVotingEndBlockNumber,voting', () => {
			const init2 = async (): Promise<DevProtocolInstance> => {
				const dev = new DevProtocolInstance(deployer)
				await dev.generateAddressConfig()
				await dev.generatePolicySet()
				await dev.generatePolicyGroup()
				await dev.generatePolicyFactory()
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policyFactory.create(policy.address, {
					from: deployer,
				})
				return dev
			}

			it('can get to see if you can vote or not.', async () => {
				const dev = await init2()
				await dev.addressConfig.setPolicyFactory(policyFactory, {
					from: deployer,
				})
				const policy = await dev.getPolicy(
					'PolicyTestForPolicyFactory',
					deployer
				)
				await dev.policySet.setVotingEndBlockNumber(policy.address, {
					from: policyFactory,
				})
				let voting = await dev.policySet.voting(
					await dev.addressConfig.policy()
				)
				expect(voting).to.be.equal(false)
				voting = await dev.policySet.voting(policy.address)
				expect(voting).to.be.equal(true)
				await mine(11)
				voting = await dev.policySet.voting(policy.address)
				expect(voting).to.be.equal(false)
			})
		})
	}
)
