contract('Property', () => {
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

	describe('increase', () => {
		it('Sender burns the self specified number of DEVs')

		it(
			'The sender takes a new mint of Property Contract, depending on the total dividend amount of Property Contract and the ratio of DEVs incinerated by the sender'
		)

		it(
			'Should fail to increase when sent from other than a smart-contract address'
		)
	})

	describe('pay', () => {
		it('Sender burns the self specified number of DEVs')

		it(
			'The number of DEVs burned by the sender is added to the withdrawal amount'
		)

		it(
			'Should fail to payment when sent from other than a smart-contract address'
		)
	})

	describe('transfer', () => {
		it(
			"Execute the Allocator Contract's 'beforeBalanceChange' function before the 'transfer' function changes the balance"
		)
	})
})
