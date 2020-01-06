import {DevProtocolInstance} from './../../lib/instance'
import {validateErrorMessage} from '../../lib/error-utils'

contract('StringValidatorTest', ([deployer]) => {
	const dev = new DevProtocolInstance(deployer)
	before(async () => {
		await dev.generateStringValidator()
	})
	describe('StringValidator; validatePropertyName', () => {
		it('2 characters cause an error.', async () => {
			const result = await dev.stringValidator
				.validatePropertyName('ab')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'name must be at least 3 and no more than 10 characters',
				false
			)
		})
		it('3 characters do not cause an error.', async () => {
			await dev.stringValidator.validatePropertyName('abc')
		})
		it('10 characters cause an error.', async () => {
			await dev.stringValidator.validatePropertyName('abcdefghij')
		})
		it('11 characters cause an error.', async () => {
			const result = await dev.stringValidator
				.validatePropertyName('abcdefghijk')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'name must be at least 3 and no more than 10 characters',
				false
			)
		})
	})
	describe('StringValidator; validatePropertySymbol', () => {
		it('2 characters cause an error.', async () => {
			const result = await dev.stringValidator
				.validatePropertySymbol('ab')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'symbol must be at least 3 and no more than 10 characters',
				false
			)
		})
		it('3 characters do not cause an error.', async () => {
			await dev.stringValidator.validatePropertySymbol('abc')
		})
		it('10 characters cause an error.', async () => {
			await dev.stringValidator.validatePropertySymbol('abcdefghij')
		})
		it('11 characters cause an error.', async () => {
			const result = await dev.stringValidator
				.validatePropertySymbol('abcdefghijk')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'symbol must be at least 3 and no more than 10 characters',
				false
			)
		})
	})
})
