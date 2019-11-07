contract('LastAllocationTimeTest', () => {
	const lastAllocationTimeContract = artifacts.require('LastAllocationTime')
	describe('LastAllocationTimeTest; getTimeInfo', () => {
		it('get time info', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			const timeInfo = await lastAllocationTime.getTimeInfo()
			const secOfOneDay = timeInfo[0].toNumber() - timeInfo[1].toNumber()
			expect(secOfOneDay).to.be.equal(86400)
		})
	})
	describe('LastAllocationTimeTest; getlLstAllocationTime', () => {
		it('not set time', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			const timestamp = await lastAllocationTime.getLastAllocationTime(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(timestamp.toNumber()).to.be.equal(0)
		})
		it('set time', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			await lastAllocationTime.setLastAllocationTime(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				1573092650
			)
			const timestamp = await lastAllocationTime.getLastAllocationTime(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(timestamp.toNumber()).to.be.equal(1573092650)
		})
	})
	describe('LastAllocationTimeTest; ensureDiffDays', () => {
		it('not set time', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			let err = null
			try {
				await lastAllocationTime.ensureDiffDays(
					'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
					1573006250
				)
			} catch (error) {
				err = error
			}

			expect(err.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert From timestamp is lower then to timestamp'
			)
		})
		it('set time', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			lastAllocationTime.setLastAllocationTime(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				1673006250
			)
			await lastAllocationTime.ensureDiffDays(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				1973006250
			)
		})
		it('set same time', async () => {
			const lastAllocationTime = await lastAllocationTimeContract.new()
			lastAllocationTime.setLastAllocationTime(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				1573006250
			)
			let err = null
			try {
				await lastAllocationTime.ensureDiffDays(
					'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
					1573006250
				)
			} catch (error) {
				err = error
			}

			expect(err.message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert Expected an interval is one day or more'
			)
		})
	})
})
