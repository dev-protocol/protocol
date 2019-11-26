contract('TokenValueTest', ([property, sender1, sender2, sender3]) => {
	const TokenValueContract = artifacts.require('TokenValue')
	describe('TokenValueTest; set and get', () => {
		it('Set the amount that locking up tokens', async () => {
			const tokenValue = await TokenValueContract.new()
			await tokenValue.set(property, sender1, 10)
			const result = await tokenValue.get(property, sender1)
			expect(result.toNumber()).to.be.equal(10)
		})
		it('Add tokens amount to already added amount', async () => {
			const tokenValue = await TokenValueContract.new()
			await tokenValue.set(property, sender1, 10)
			const first = await tokenValue.get(property, sender1)
			expect(first.toNumber()).to.be.equal(10)
			await tokenValue.set(property, sender1, 90)
			const second = await tokenValue.get(property, sender1)
			expect(second.toNumber()).to.be.equal(100)
		})
		it('Returns 0 when not locked up', async () => {
			const tokenValue = await TokenValueContract.new()
			const result = await tokenValue.get(property, sender1)
			expect(result.toNumber()).to.be.equal(0)
		})
	})
	describe('TokenValueTest; getByProperty', () => {
		it('Get the amount of total locked up tokens to the Property', async () => {
			const tokenValue = await TokenValueContract.new()
			await tokenValue.set(property, sender1, 7356)
			await tokenValue.set(property, sender2, 6457)
			await tokenValue.set(property, sender3, 7568)
			const result = await tokenValue.getByProperty(property)
			expect(result.toNumber()).to.be.equal(7356 + 6457 + 7568)
		})
	})
	describe('TokenValueTest; hasTokenByProperty', () => {
		it('has token by property', async () => {
			const tokenValue = await TokenValueContract.new()
			await tokenValue.set(property, sender1, 10)
			let result = await tokenValue.hasTokenByProperty(property, sender1)
			expect(result).to.be.equal(true)
			result = await tokenValue.hasTokenByProperty(property, sender2)
			expect(result).to.be.equal(false)
		})
	})
})

contract('CanceledLockupFlgTest', ([property, sender1, sender2]) => {
	const CanceledLockUpFlgContract = artifacts.require('CanceledLockupFlg')
	describe('CanceledLockupFlgTest; isCanceled', () => {
		it('is canceled', async () => {
			const canceled = await CanceledLockUpFlgContract.new()
			await canceled.setCancelFlg(property, sender1, true)
			let result = await canceled.isCanceled(property, sender1)
			expect(result).to.be.equal(true)
			result = await canceled.isCanceled(property, sender2)
			expect(result).to.be.equal(false)
		})
	})
})

contract('ReleasedBlockNumberTest', ([property, sender1, sender2]) => {
	const ReleasedBlockNumberContract = artifacts.require('ReleasedBlockNumber')
	describe('ReleasedBlockNumberTest; setBlockNumber', () => {
		var canceled: any
		beforeEach(async () => {
			canceled = await ReleasedBlockNumberContract.new()
			await canceled.setBlockNumber(property, sender1, 10)
		})
		it('set blockNumber', async () => {
			let result = await canceled.canRlease(property, sender1)
			expect(result).to.be.equal(false)
			for (var i = 0; i < 20; i++) {
				// eslint-disable-next-line no-await-in-loop
				await new Promise(function(resolve) {
					// eslint-disable-next-line no-undef
					web3.currentProvider.send(
						{
							jsonrpc: '2.0',
							method: 'evm_mine',
							params: [],
							id: 0
						},
						resolve
					)
				})
			}

			result = await canceled.canRlease(property, sender1)
			expect(result).to.be.equal(true)
			await canceled.clear(property, sender1)
			result = await canceled.canRlease(property, sender1)
			expect(result).to.be.equal(false)
		})
		it('other address', async () => {
			const result = await canceled.canRlease(property, sender2)
			expect(result).to.be.equal(false)
		})
	})
})

contract('LockupTest', ([deployer]) => {
	const lockupContract = artifacts.require('Lockup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')

	describe('getTokenValue', () => {
		it('not set token value', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const lockup = await lockupContract.new(addressConfig.address)
			const result = await lockup.getTokenValue(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(result.toNumber()).to.be.equal(0)
		})
	})
	describe('cancel', () => {
		it('not property address', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const propertyGroup = await propertyGroupContract.new(
				addressConfig.address,
				{from: deployer}
			)
			await addressConfig.setPropertyGroup(propertyGroup.address)
			const lockup = await lockupContract.new(addressConfig.address)
			const result = await lockup
				.cancel('0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167')
				.catch((err: Error) => err)
			expect(result.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert this address is not property contract -- Reason given: this address is not property contract.'
			)
		})
	})
	describe('withdraw', () => {
		it('address is not property contract', async () => {})
		it('lockup is not canceled', async () => {})
		it('waiting for release', async () => {})
		it('dev token is not locked', async () => {})
		it('success', async () => {})
	})
})
