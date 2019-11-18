contract('Allocator', () => {
	describe('allocate', () => {
		it("Calls Market Contract's calculate function mapped to Metrics Contract")

		it('Should fail to re-run if within one day from the last run date')

		describe('Arguments to pass to calculate', () => {
			it('The first argument is the address of Metrics Contract')

			it('The second argument is last run timestamp')

			it('The third argument is yesterday timestamp')
		})

		describe('Timestamp', () => {
			it('Change the value of seconds per block')

			it(
				'Should fail to change the value of seconds per block when sent from the non-owner account'
			)
		})

		it('The sent ETH will be returned to the sender')
	})

	describe('calculatedCallback', () => {
		it(
			`
			'lastTotalAllocationValuePerBlock' is 300,
			Metrics's 'lastAllocationValueEachMetrics' is 20,
			the target period is 11520 block(2 days),
			the current calculated index value is 100,
			'mintPerBlock' is 5,
			total number of metrics is 10000,
			and mapped market's total number of metrics is 500;
			the result is ${(((100 / 11520 / (300 - 20 + 100 / 11520)) * 5 * 500) / 1000) *
				11520}`
		)

		it(
			`When after increment, change the value of 'lastTotalAllocationValuePerBlock' is ${300 -
				20 +
				100 / 11520}`
		)

		it(
			'Should fail to call the function when sent from other than Behavior Contract mapped to Metrics Contract'
		)

		it(
			'Should fail to call the function when does not call in advance `allocate` function'
		)
	})

	describe('updateAllocateValue', () => {
		it(
			`
			'totalPaymentValue' is 90000,
			'initialPaymentBlock' is 1,
			and 'lastPaymentBlock' is 28800.
			When the block is 40320,
			if pays 2000,
			'mintPerBlock' becomes ${(92000 / (40320 - 1)) *
				(2000 / (40320 - 28800) / (92000 / (40320 - 1)))}.`
		)
	})

	describe('withdraw', () => {
		describe('Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the State Contract')
		})

		describe('Withdrawable amount', () => {
			it(
				'The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender'
			)

			it(
				'The withdrawal amount is always the full amount of the withdrawable amount'
			)

			it('When the withdrawable amount is 0, the withdrawal amount is 0')

			it("When 'increment' is executed, the withdrawable amount increases")
		})

		describe('Alice has sent 800 out of 1000 tokens to Bob. Bob has increased from 200 tokens to 1000 tokens. Price is 100', () => {
			describe('Before increment', () => {
				it(`Alice's withdrawable amount is ${1000 * 100}`)

				it(`Bob's withdrawable amount is ${200 * 100}`)
			})

			describe('After increment; New price is 120', () => {
				it(`Alice's withdrawable amount is ${1000 * 100 + 200 * 120}`)

				it(`Bob's withdrawable amount is ${200 * 100 + 1000 * 120}`)
			})

			it(
				"Should fail to execute 'beforeBalanceChange' when sent from the not Repository Contract address"
			)
		})
	})

	describe('kill', () => {
		it('Destruct this contract')

		it(
			'Should fail to destruct this contract when sent from the non-owner account'
		)
	})
})
