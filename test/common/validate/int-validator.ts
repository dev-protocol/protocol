import {validateErrorMessage} from '../../test-lib/error-utils'
import {IntValidatorInstance} from '../../../types/truffle-contracts'

contract('IntValidatorTest', ([deployer]) => {
	let intValidator: IntValidatorInstance
	before(async () => {
		const intValidatorContract = artifacts.require('IntValidator')
		intValidator = await intValidatorContract.new({
			from: deployer
		})
	})
	describe('IntValidator; validateEmpty', () => {
		it('0 cause an error.', async () => {
			const result = await intValidator
				.validateEmpty(0)
				.catch((err: Error) => err)
			validateErrorMessage(result as Error, 'this int is not proper', false)
		})
		it('other 0 do not cause an error.', async () => {
			await intValidator.validateEmpty(100)
		})
	})
})
