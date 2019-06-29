contract('Distributor', () => {
	describe('setMintVolumePerDay', () => {
		it('Change the value of mint volume per day')

		it(
			'Should fail to change the value of mint volume per day when sent from the non-owner account'
		)
	})

	describe('distribute', () => {
		describe('Fetch the number of downloads', () => {
			it('Fetch the specify Repository Contract mapped OSS number of downloads')

			it(
				'Should fail to fetch the number of downloads when not exists Repository Contract'
			)
		})

		describe('Target period', () => {
			it('Target period is from the last run to yesterday')

			it('Should fail to re-run if within one day from the last run date')
		})

		describe('Increment dividends', () => {
			it(
				`
				'totalDownloadsPerDay' is 100,
				the target period is 1 day,
				the previous download count is x,
				the current download count is y,
				and 'mintVolumePerDay' is 5;
				the result is y ÷ (100 - x + y) * 5`
			)

			it(
				"When after increment, change the value of 'totalDownloadsPerDay' is (100 - x + y)"
			)
		})

		describe('Timestamp', () => {
			it('Change the value of seconds per block')

			it(
				'Should fail to change the value of seconds per block when sent from the non-owner account'
			)
		})

		it('The sent ETH will be returned to the sender')
	})

	describe('withdraw', () => {
		describe('Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the State Contract')
		})

		describe('Withdrawable amount', () => {
			it(
				'The withdrawable amount each holder is the number multiplied the balance of the price per Repository Contract and the Repository Contract of the sender'
			)

			it(
				'The withdrawal amount is always the full amount of the withdrawable amount'
			)

			it('When the withdrawable amount is 0, the withdrawal amount is 0')
		})
	})
})
