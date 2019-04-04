// tslint:disable:no-unsafe-any
const useState = artifacts.require('UseState')

contract('UseState', () => {
	describe('State', () => {
		it('Only the owner can change the state address.')

		it('Get the State instance by calling "state()".')

		it(
			'After the state address has changed, "state()" returns a new state instance.'
		)
	})

	describe('Utility token', () => {
		it('Get the token address from state.')
	})

	describe('Security token', () => {
		it('Get the security address of package from state.')

		it('Add the security address of package to state.')

		it('Get all securities address from state.')
	})

	describe('Balance', () => {
		it(
			'Get the utility tokens balance of all holders from a security address stored in the state.'
		)
	})
})
