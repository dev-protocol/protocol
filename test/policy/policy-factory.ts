import { IPolicyInstance } from '../../types/truffle-contracts'
import { DevProtocolInstance } from '../test-lib/instance'

import { collectsEth } from '../test-lib/utils/common'
import { getPropertyAddress } from '../test-lib/utils/log'
import {
	validateNotOwnerErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract(
	'PolicyFactory',
	([deployer, dummyPolicy, user1, propertyAuther, ...accounts]) => {
		before(async () => {
			await collectsEth(deployer)(accounts)
		})
		describe('PolicyFactory; createPolicy', () => {
			const dev = new DevProtocolInstance(deployer)
			let policy: IPolicyInstance
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicyFactory(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
				])
			})
			it('If the first Policy, the Policy becomes valid.', async () => {
				policy = await dev.getPolicy('PolicyTestForPolicyFactory', user1)
				await dev.policyFactory.create(policy.address, {
					from: user1,
				})
				const curentPolicyAddress = await dev.addressConfig.policy()
				expect(curentPolicyAddress).to.be.equal(policy.address)
			})
		})
		describe('PolicyFactory; forceAttach', () => {
			const dev = new DevProtocolInstance(deployer)
			let createdPropertyAddress: string
			beforeEach(async () => {
				await dev.generateAddressConfig()
				await dev.generateDev()
				await dev.generateDevMinter()
				await Promise.all([
					dev.generatePolicyGroup(),
					dev.generatePolicyFactory(),
					dev.generateMarketFactory(),
					dev.generateMarketGroup(),
					dev.generatePropertyGroup(),
					dev.generatePropertyFactory(),
					dev.generateLockup(),
					dev.generateAllocator(),
					dev.generateWithdraw(),
					dev.generateMetricsGroup(),
				])
				await dev.dev.mint(user1, 10000, { from: deployer })
				await dev.generatePolicy('PolicyTestForPolicyFactory')
				const propertyCreateResult = await dev.propertyFactory.create(
					'test',
					'TST',
					propertyAuther
				)
				createdPropertyAddress = getPropertyAddress(propertyCreateResult)
				await dev.metricsGroup.__setMetricsCountPerProperty(
					createdPropertyAddress,
					1
				)
			})
			it('can not be performed by anyone other than the owner.', async () => {
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy, { from: user1 })
					.catch((err: Error) => err)
				validateNotOwnerErrorMessage(result)
			})
			it('can not specify anything other than policy.', async () => {
				const result = await dev.policyFactory
					.forceAttach(dummyPolicy)
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
	}
)
