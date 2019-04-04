// tslint:disable:no-unsafe-any
const useState = artifacts.require('UseState')

contract('UseState', () => {
	describe('State', () => {
		it('Change state address')

		it('Fail to change state address from a non-owner account')

		it('Get a State instance')

		it('After the state address has changed, returns a new State instance')
	})

	describe('Utility token', () => {
		it('Get a token address')
	})

	describe('Security token', () => {
		it('Get a security address of a package')

		it('Add a security address of a package')

		it('Get all securities address')
	})

	describe('Balance', () => {
		it(
			'Get the utility tokens balance of all holders from a security address stored in the state'
		)
	})
})
