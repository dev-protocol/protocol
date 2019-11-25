contract('Allocator', ([deployer]) => {
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const allocatorContract = artifacts.require('Allocator')

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

	describe('allocation', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the result is ${5760 *
				50000 *
				(300 / 7406907) *
				(48568 / 547568)}`, async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const allocator = await allocatorContract.new(addressConfig.address, {
				from: deployer
			})
			const result = await allocator.allocation(
				5760,
				50000,
				300,
				7406907,
				48568,
				547568
			)
			expect(result.toNumber()).to.be.equal(
				~~(5760 * 50000 * (300 / 7406907) * (48568 / 547568))
			)
		})
	})

	describe('calculatedCallback', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the incremented result is ${5760 * 50000 * (300 / 7406907) * (48568 / 547568)}`)

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

contract('AllocationBlockNumberTest', ([deployer]) => {
	const allocationBlockNumberContract = artifacts.require(
		'AllocationBlockNumber'
	)
	describe('get/set', () => {
		var allocationBlockNumber: any
		beforeEach(async () => {
			allocationBlockNumber = await allocationBlockNumberContract.new({
				from: deployer
			})
			await allocationBlockNumber.setLastAllocationBlockNumber(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
		})
		it('get/set', async () => {
			const blockNumber = await allocationBlockNumber.getLastAllocationBlockNumber(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			// eslint-disable-next-line no-undef
			const web3BlockNumber = await web3.eth.getBlockNumber()
			expect(blockNumber.toNumber()).to.be.equal(web3BlockNumber)
		})
		it('get defoult value', async () => {
			const blockNumber = await allocationBlockNumber.getLastAllocationBlockNumber(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167'
			)
			const blockNumber2 = await allocationBlockNumber.getLastAllocationBlockNumber(
				'0xfbDBcF1EbE27245E3488541f19CAC902E53239a4'
			)
			expect(blockNumber.toNumber()).to.be.equal(blockNumber2.toNumber())
		})
	})
})
