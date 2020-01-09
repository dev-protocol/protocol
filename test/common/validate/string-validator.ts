import {validateErrorMessage} from '../../test-lib/utils'
import {StringValidatorInstance} from '../../../types/truffle-contracts'

contract('StringValidatorTest', ([deployer]) => {
	let stringValidator: StringValidatorInstance
	before(async () => {
		const stringValidatorContract = artifacts.require('StringValidator')
		stringValidator = await stringValidatorContract.new({
			from: deployer
		})
	})
	describe('StringValidator; validatePropertyName', () => {
		it('2 characters cause an error.', async () => {
			const result = await stringValidator
				.validatePropertyName('ab')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'name must be at least 3 and no more than 10 characters',
				false
			)
		})
		it('3 characters do not cause an error.', async () => {
			await stringValidator.validatePropertyName('abc')
		})
		it('10 characters cause an error.', async () => {
			await stringValidator.validatePropertyName('abcdefghij')
		})
		it('11 characters cause an error.', async () => {
			const result = await stringValidator
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
			const result = await stringValidator
				.validatePropertySymbol('ab')
				.catch((err: Error) => err)
			validateErrorMessage(
				result as Error,
				'symbol must be at least 3 and no more than 10 characters',
				false
			)
		})
		it('3 characters do not cause an error.', async () => {
			await stringValidator.validatePropertySymbol('abc')
		})
		it('10 characters cause an error.', async () => {
			await stringValidator.validatePropertySymbol('abcdefghij')
		})
		it('11 characters cause an error.', async () => {
			const result = await stringValidator
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
