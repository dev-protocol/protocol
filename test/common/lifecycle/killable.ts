import { validateErrorMessage } from '../../test-lib/utils/error'

contract('KillableTest', ([deployer, user]) => {
	const killableTestContract = artifacts.require('KillableTest')
	describe('Killable; kill', () => {
		it('The contract is killed and the function cannot be executed', async () => {
			const killableTest = await killableTestContract.new({
				from: deployer,
			})
			const value = await killableTest.getValue()
			expect(value.toNumber()).to.be.equal(1)
			await killableTest.kill({ from: deployer })
			const result = await killableTest.getValue().catch((err: Error) => err)
			validateErrorMessage(
				result,
				"Returned values aren't valid, did it run Out of Gas?",
				false
			)
		})
		it('Only deployed accounts can be killed', async () => {
			const killableTest = await killableTestContract.new({
				from: deployer,
			})
			const result = await killableTest
				.kill({ from: user })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'only owner method')
		})
	})
})
