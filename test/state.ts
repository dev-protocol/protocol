// tslint:disable:no-unsafe-any
const state = artifacts.require('State')

contract('State', () => {
	describe('Roles', () => {
		it('Owners should be able to add operators.')

		it('Non-owner accounts should not be able to add operators.')
	})

	describe('Utility token', () => {
		it('Token default value is 0x98626E2C9231f03504273d55f397409deFD4a093.')

		it('Only the owner can change the utility token address.')
	})

	describe('Security token', () => {
		it('Operators can add security token addresses.')

		it('Non-owner accounts should not be able to add security token address.')

		it('Can not add the same address.')

		it('Get the security address from a package name.')

		it('Get all securities address.')
	})

	describe('Balance', () => {
		it('Get the utility tokens balance of all holders from a security address.')
	})
})
