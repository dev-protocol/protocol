import {DevProtocolInstance} from './../../lib/instance'

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
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert name must be at least 3 and no more than 10 characters'
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
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert name must be at least 3 and no more than 10 characters'
			)
		})
	})
	describe('StringValidator; validatePropertySymbol', () => {
		it('2 characters cause an error.', async () => {
			const result = await dev.stringValidator
				.validatePropertySymbol('ab')
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert symbol must be at least 3 and no more than 10 characters'
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
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert symbol must be at least 3 and no more than 10 characters'
			)
		})
	})
})
