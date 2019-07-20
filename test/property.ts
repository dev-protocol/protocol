contract('Property', () => {
	describe('Initialize Property Contract', () => {
		it(
			'The holder of the total supply amount of Property Contract is sender address by default'
		)
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

	describe('contribute', () => {
		it('Sender burns the self specified number of DEVs')

		it(
			'The number of DEVs burned by the sender is added to the withdrawal amount'
		)

		it(
			'Should fail to contribute when sent from other than a smart-contract address'
		)
	})

	describe('cancelContribute', () => {
		it(
			'When unauthenticated, the sender can withdrawal the number of DEVs self burned'
		)

		it('Should fail to cancel when the Property Contract is authenticated')
	})

	describe('transfer', () => {
		it(
			"Execute the Allocator Contract's 'beforeBalanceChange' function before the 'transfer' function changes the balance"
		)
	})
})
