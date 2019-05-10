// tslint:disable:no-unsafe-any
const distributorFactory = artifacts.require('DistributorFactory')

contract('DistributorFactory', () => {
	describe('Create distributor', () => {
		it('Create a distributor contract')

		it(
			'The distributor is created from the last run date to the previous day of this run day as a target term'
		)

		it(
			'Should fail to create a new distributor less than one day from the previous execution date'
		)

		it(
			'When creating a distributor for the first time, the deployed timestamp is used as the last run date'
		)

		it(
			'Newly issuing distribution tokens is the value of `mintVolumePerDay` multiplied by the target term days'
		)

		it(
			'Should fail to changes the value of `mintVolumePerDay` from a non-owner account'
		)
	})

	describe('Get timestamp', () => {
		it(
			'Use block time as 15 seconds and get the timestamp from the difference of block height'
		)

		it(
			'Change the block time used for timestamp calculation by changing the value of `secondsPerBlock`.'
		)
	})

	describe('Deposit', () => {
		it('Add the deposit value by sending ETH to `deposit` function')

		it(
			'ETH sent to the `createDistributor` function is also added to the deposit'
		)

		it(
			'When creating a new distributor, sending the deposit to the new distributor and reset the deposit'
		)
	})

	describe('Destroy', () => {
		it('Destruct this contract')

		it('Should fail to destruct this contract from a non-owner account')
	})
})
