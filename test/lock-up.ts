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

contract('CanceledLockUpFlgTest', () => {
	const CanceledLockUpFlgContract = artifacts.require('CanceledLockUpFlg')
	describe('CanceledLockUpFlgTest; isCanceled', () => {
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
