import {
	AllocatorInstance,
	StateInstance,
	DummyDEVInstance
} from '../types/truffle-contracts'

contract('Allocator', ([deployer, u1, u2]) => {
	const allocatorContract = artifacts.require('Allocator')
	const dummyDEVContract = artifacts.require('DummyDEV')
	const stateContract = artifacts.require('StateTest')

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

	describe('invest', () => {
		var dummyDEV: DummyDEVInstance
		var state: StateInstance
		var allocator: AllocatorInstance

		beforeEach(async () => {
			dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {
				from: deployer
			})

			state = await stateContract.new({from: deployer})
			await state.setToken(dummyDEV.address, {from: deployer})
			await state.setPropertyFactory(deployer, {from: deployer})
			await state.addProperty(u1, {from: deployer})

			allocator = await allocatorContract.new({from: deployer})
			await allocator.changeStateAddress(state.address, {from: deployer})

			await dummyDEV.approve(allocator.address, 40, {from: deployer})
		})

		it('is able to specify a Property Contract address', async () => {
			const result = await allocator
				.investToProperty(u2, 40, {from: deployer})
				.catch((err: Error) => err)

			expect(result).to.instanceOf(Error)
		})

		it('Sender burns the self specified number of DEVs', async () => {
			await allocator.investToProperty(u1, 40, {from: deployer})
			const ownedDEVs = await dummyDEV.balanceOf(deployer, {from: deployer})
			expect(ownedDEVs.toNumber()).to.be.equal(9960)
		})

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
})

// Const dummyDEV = await dummyDEVContract.new('Dev', 'DEV', 18, 10000, {
// 				from: deployer
// 			})
// 			const state = await stateContract.new({from: deployer})
// 			await state.setToken(dummyDEV.address, {from: deployer})

// 			const market = await marketContract.new(u1, false, {from: deployer})
// 			await market.changeStateAddress(state.address, {from: deployer})

// 			await dummyDEV.approve(market.address, 40, {from: deployer})

// 			await market.vote(10, {from: deployer})
// 			const firstTotalVotes = await market.totalVotes({from: deployer})

// 			expect(firstTotalVotes.toNumber()).to.be.equal(10)

// 			await market.vote(20, {from: deployer})
// 			const secondTotalVotes = await market.totalVotes({from: deployer})
// 			expect(secondTotalVotes.toNumber()).to.be.equal(30)

// const result = await market
// 				.vote(100, {from: deployer})
// 				.catch((err: Error) => err)
// 			expect(result).to.instanceOf(Error)
