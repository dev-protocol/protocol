contract('TimebasedTest', () => {
	const timebasedContract = artifacts.require('libs/Timebased')
	describe('TimebasedTest; timestamp', () => {
		it('timestamp', async () => {
			const timebased = await timebasedContract.new()
			const timestamp = await timebased.timestamp()
			const timestamp2 = await timebased.timestamp()
			// eslint-disable-next-line no-undef
			assert.isTrue(
				timestamp.toNumber() <= timestamp2.toNumber(),
				"10000 wasn't in the first account"
			)
		})
	})
})
