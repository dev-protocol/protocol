import { DevProtocolObject } from '../../test-lib/instance'
import { DEFAULT_ADDRESS } from '../../test-lib/const'
import { validateErrorMessage } from '../../test-lib/utils/error'

contract('RegistryTest', ([deployer, other, setAddress1, policyFactory]) => {
	const dev = new DevProtocolObject(deployer)
	describe('get/set', () => {
		before(async () => {
			await dev.generateRegistry()
		})
		it('Value set by owner', async () => {
			const before = await dev.registry.get('Allocator')
			expect(before).to.be.equal(DEFAULT_ADDRESS)
			await dev.registry.set('Allocator', setAddress1, { from: deployer })
			const after = await dev.registry.get('Allocator')
			expect(after).to.be.equal(setAddress1)
		})
		it('Value set by non-owner', async () => {
			const result = await dev.registry
				.set('Allocator', setAddress1, {
					from: other,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'Ownable: caller is not the owner')
		})
	})
	describe('get/set(policy)', () => {
		before(async () => {
			await dev.generateRegistry()
		})
		it('Value set by PolicyFactory', async () => {
			const before = await dev.registry.get('Policy')
			expect(before).to.be.equal(DEFAULT_ADDRESS)
			await dev.registry.set('PolicyFactory', policyFactory, { from: deployer })
			await dev.registry.set('Policy', setAddress1, { from: policyFactory })
			const after = await dev.registry.get('Policy')
			expect(after).to.be.equal(setAddress1)
		})
		it('Value set by non-PolicyFactory', async () => {
			const result = await dev.registry
				.set('Policy', setAddress1, {
					from: deployer,
				})
				.catch((err: Error) => err)
			validateErrorMessage(result, 'caller is not the PolicyFactory')
		})
	})
})
