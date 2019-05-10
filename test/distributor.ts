// tslint:disable:no-unsafe-any
const distributor = artifacts.require('Distributor')

contract('Distributor', () => {
	describe('Oraclize', () => {
		it('Send Oraclize queries as soon as it is created')

		it(
			'Should fail to all Oraclize queries when the ETH balance of this contract is insufficient'
		)

		it('When failed to Oraclize, self-destruct the creator as an address')

		it('Oraclize gets the downloads count of each npm packages')
	})

	describe('Payout', () => {
		it(
			"Distribution token's total supply increases after `payout` function are executed"
		)

		it(
			"Repository Contract's `total` and `price` increases after `payout` function are executed"
		)

		it('Destination of newly issued part is each repository contract')

		it(
			'Distributions per repository contract is equal to "each_packages_downloads / all_packages_downloads * total_distributions"'
		)

		it(
			'When all packages payout is done, self-destruct this contract and send ETH to the creator of this contract'
		)

		it('Should fail to payout already executed')

		it('Force execute payout to all repository contracts')
	})
})
