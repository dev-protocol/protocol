// tslint:disable:no-unsafe-any
const state = artifacts.require('State')

contract('State', () => {
	describe('Roles', () => {
		it('Add operators')

		it('Fail to add operator from a non-owner account')
	})

	describe('Utility token', () => {
		it('Token default value is 0x98626E2C9231f03504273d55f397409deFD4a093.')

		it('Change the utility token address')

		it('Fail to change the utility token address from a non-owner account')
	})

	describe('Security token', () => {
		it('Add security token address')

		it('Fail to add security token address from a non-operator account')

		it('Fail to add security token address when the exists same security')

		it('Get the security address by package name')

		it('Get all securities address')
	})

	describe('Balance', () => {
		it('Get the utility tokens balance of all holders from a security address.')
	})
})
