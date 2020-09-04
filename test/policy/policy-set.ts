import {DevProtocolInstance} from '../test-lib/instance'
import {mine} from '../test-lib/utils/common'

contract('PolicySetTest', ([deployer, policyFactory]) => {
	describe('PolicySet; setVotingEndBlockNumber,voting', () => {
		const init2 = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generatePolicySet()
			await dev.generatePolicyGroup()
			await dev.generatePolicyFactory()
			const policy = await dev.getPolicy('PolicyTestForPolicyFactory', deployer)
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
			const policy = await dev.getPolicy('PolicyTestForPolicyFactory', deployer)
			await dev.policySet.setVotingEndBlockNumber(policy.address, {
				from: policyFactory,
			})
			let voting = await dev.policySet.voting(await dev.addressConfig.policy())
			expect(voting).to.be.equal(false)
			voting = await dev.policySet.voting(policy.address)
			expect(voting).to.be.equal(true)
			await mine(11)
			voting = await dev.policySet.voting(policy.address)
			expect(voting).to.be.equal(false)
		})
	})
})
