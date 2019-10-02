contract('Property', ([deployer, u1]) => {
	const marketContract = artifacts.require('Market')
	const dummyDEVContract = artifacts.require('DummyDEV')
	const stateContract = artifacts.require('State')

	describe('Initialize Property Contract', () => {
		it(
			'Holder of the total supply amount is address passed in the first argument'
		)

		it('The `owner` is address passed in the first argument')

		it('Token name is string passed in the second argument')

		it('Token symbol is string passed in the third argument')

		it('The `decimals` is uint passed in the fourth argument')

		it('Total supply is string passed in the fifth argument')
	})

	describe('pay', () => {
		it('Sender burns the self specified number of DEVs', async () => {})

		// TODO Withdrawable incrementをたたけばいい
		it(
			'The number of DEVs burned by the sender is added to the withdrawal amount'
		)

		it(
			'Should fail to payment when sent from other than a smart-contract address'
		)

		it(
			'Should fail to payment when Sender try to send more DEVs than Sender owned DEVs'
		)
	})

	describe('transfer', () => {
		it(
			"Execute the Allocator Contract's 'beforeBalanceChange' function before the 'transfer' function changes the balance"
		)
	})
})
