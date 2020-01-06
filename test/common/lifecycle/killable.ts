import {validateErrorMessage} from '../../test-lib/error-utils'

contract('KillableTest', ([deployer, user]) => {
	const killableTestContract = artifacts.require('KillableTest')
	describe('Killable; kill', () => {
		it('コントラクトがkillされて関数が実行d系なくなる', async () => {
			const killableTest = await killableTestContract.new({
				from: deployer
			})
			const value = await killableTest.getValue()
			expect(value.toNumber()).to.be.equal(1)
			await killableTest.kill({from: deployer})
			const result = await killableTest.getValue().catch((err: Error) => err)
			expect(result.message).to.be.equal(
				"Returned values aren't valid, did it run Out of Gas?"
			)
		})
		it('デプロイしたアカウントしかkillできない', async () => {
			const killableTest = await killableTestContract.new({
				from: deployer
			})
			const result = await killableTest
				.kill({from: user})
				.catch((err: Error) => err)
			validateErrorMessage(result as Error, 'only owner method')
		})
	})
})
