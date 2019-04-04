// tslint:disable:no-unsafe-any
const factory = artifacts.require('Factory')

contract('Factory', () => {
	describe('Create new security', () => {
		it('Can create new security for packages.')

		it(
			'If the package already has security, should not be able to create new security.'
		)
	})

	describe('Destroy', () => {
		it('Only the owner can destroy this contract.')
	})
})
