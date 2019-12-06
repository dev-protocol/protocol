contract('Allocator', ([deployer]) => {
	const addressConfigContract = artifacts.require('AddressConfig')
	const allocatorContract = artifacts.require('Allocator')

	describe('Allocator; allocate', () => {
		it("Calls Market Contract's calculate function mapped to Metrics Contract")

		it('Should fail to call when other than Metrics address is passed')

		it(
			'Should fail to call when the Metrics linked Property is the target of the abstention penalty'
		)

		describe('Allocator; Arguments to pass to calculate', () => {
			it('The first argument is the address of Metrics Contract')

			it('The second argument is last run block number')

			it(
				'The second argument is the block number of the end of the abstention penalty if the Metrics linked Property was the targeted of the abstention penalty'
			)

			it('The third argument is current block number')
		})

		it('Return ETH to the sender when sent it')
	})

	describe('Allocator; allocation', () => {
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

	describe('Allocator; calculatedCallback', () => {
		it(`
			last allocation block is 5760,
			mint per block is 50000,
			calculated asset value per block is 300,
			Market's total asset value per block is 7406907,
			number of assets per Market is 48568,
			number of assets total all Market is 547568;
			the incremented result is ${5760 * 50000 * (300 / 7406907) * (48568 / 547568)}`)

		it(
			'When after increment, update the value of `lastAssetValueEachMarketPerBlock`'
		)

		it(
			'Should fail to call the function when sent from other than Behavior Contract mapped to Metrics Contract'
		)

		it(
			'Should fail to call the function when it does not call in advance `allocate` function'
		)
	})

	describe('Allocator; withdraw', () => {
		describe('Allocator; Withdraw is mint', () => {
			it('Withdraw mints an ERC20 token specified in the State Contract')
		})

		describe('Allocator; Withdrawable amount', () => {
			it(
				'The withdrawable amount each holder is the number multiplied the balance of the price per Property Contract and the Property Contract of the sender'
			)

			it(
				'The withdrawal amount is always the full amount of the withdrawable amount'
			)

			it('When the withdrawable amount is 0, the withdrawal amount is 0')
		})

		describe('Allocator; Alice has sent 800 out of 1000 tokens to Bob. Bob has increased from 200 tokens to 1000 tokens. Price is 100', () => {
			describe('Allocator; Before increment', () => {
				it(`Alice's withdrawable amount is ${1000 * 100}`)

				it(`Bob's withdrawable amount is ${200 * 100}`)
			})

			describe('Allocator; After increment; New price is 120', () => {
				it(`Alice's withdrawable amount is ${1000 * 100 + 200 * 120}`)

				it(`Bob's withdrawable amount is ${200 * 100 + 1000 * 120}`)
			})

			it(
				'Should fail to call `beforeBalanceChange` when sent from other than Property Contract address'
			)
		})
	})

	describe('Allocator; kill', () => {
		it('Destruct this contract')

		it(
			'Should fail to destruct this contract when sent from the non-owner account'
		)
	})
})

contract('AllocationBlockNumberTest', ([key1, key2, key3]) => {
	const allocationBlockNumberContract = artifacts.require(
		'AllocationBlockNumber'
	)
	describe('AllocationBlockNumber; getLastAllocationBlockNumber', () => {
		let allocationBlockNumber: any
		beforeEach(async () => {
			allocationBlockNumber = await allocationBlockNumberContract.new()
			await allocationBlockNumber.setWithNow(key1)
		})
		it('The block number of the set timing has been acquired', async () => {
			const blockNumber = await allocationBlockNumber.getLastAllocationBlockNumber(
				key1
			)
			// eslint-disable-next-line no-undef
			const web3BlockNumber = await web3.eth.getBlockNumber()
			expect(blockNumber.toNumber()).to.be.equal(web3BlockNumber)
		})
		it('Behavior when not set', async () => {
			const blockNumber = await allocationBlockNumber.getLastAllocationBlockNumber(
				key2
			)
			const blockNumber2 = await allocationBlockNumber.getLastAllocationBlockNumber(
				key3
			)
			expect(blockNumber.toNumber()).to.be.equal(blockNumber2.toNumber())
		})
	})
})
