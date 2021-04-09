/* eslint-disable max-nested-callbacks */
import { DEFAULT_ADDRESS } from '../test-lib/const'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('Patch', ([config, upgrader]) => {
	const contract = artifacts.require
	describe('constructor', () => {
		it('get address that is set at constructor.', async () => {
			const patch = await contract('PatchTemplate').new(config, upgrader)
			const configAddress = await patch.config()
			expect(configAddress).to.equal(config)
			const upgraderAddress = await patch.upgrader()
			expect(upgraderAddress).to.equal(upgrader)
			const ownerbleAddress = await patch.ownerble()
			expect(ownerbleAddress).to.equal(DEFAULT_ADDRESS)
		})
	})
	describe('deploy', () => {
		describe('success', () => {
			it('deploy contracts.', async () => {
				const patch = await contract('PatchTemplate').new(config, upgrader)
				await patch.deploy({ from: upgrader })
				const ownerbleAddress = await patch.ownerble()
				expect(ownerbleAddress).to.not.equal(DEFAULT_ADDRESS)
			})
		})
		describe('fail', () => {
			it('Cannot be executed from other than Upgrader.', async () => {
				const patch = await contract('PatchTemplate').new(config, upgrader)
				const result = await patch.deploy().catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
	})
})
