contract('TokenValueTest', () => {
	const TokenValueContract = artifacts.require('TokenValue')
	describe('TokenValueTest; hasTokenByProperty', () => {
		it('has token by property', async () => {
			const tokenValue = await TokenValueContract.new()
			await tokenValue.set(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				10
			)
			let result = await tokenValue.hasTokenByProperty(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(result).to.be.equal(true)
			result = await tokenValue.hasTokenByProperty(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0x32A5598b078Ad20287f210803a6ad5D96C8df1d1'
			)
			expect(result).to.be.equal(false)
		})
	})
})

contract('CanceledLockupFlgTest', () => {
	const CanceledLockUpFlgContract = artifacts.require('CanceledLockupFlg')
	describe('CanceledLockupFlgTest; isCanceled', () => {
		it('is canceled', async () => {
			const canceled = await CanceledLockUpFlgContract.new()
			await canceled.setCancelFlg(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			let result = await canceled.isCanceled(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(result).to.be.equal(true)
			result = await canceled.isCanceled(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0x32A5598b078Ad20287f210803a6ad5D96C8df1d1'
			)
			expect(result).to.be.equal(false)
		})
	})
})

contract('ReleasedBlockNumberTest', () => {
	const ReleasedBlockNumberContract = artifacts.require('ReleasedBlockNumber')
	describe('ReleasedBlockNumberTest; setBlockNumber', () => {
		it('set blockNumber', async () => {
			const canceled = await ReleasedBlockNumberContract.new()
			// eslint-disable-next-line no-warning-comments
			// TODO assert
			await canceled.setBlockNumber(
				'0x2d6ab242bc13445954ac46e4eaa7bfa6c7aca167',
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				30
			)
		})
	})
})

contract('LockupTest', ([deployer]) => {
	const lockupContract = artifacts.require('Lockup')
	const addressConfigContract = artifacts.require('config/AddressConfig')
	const propertyGroupContract = artifacts.require('property/PropertyGroup')

	describe('LockupTest; getTokenValue', () => {
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
	describe('LockupTest; cnacel', () => {
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
				'Returned error: VM Exception while processing transaction: revert this address is not property contract. -- Reason given: this address is not property contract..'
			)
		})
	})
})
