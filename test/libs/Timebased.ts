contract('TimebasedTest', () => {
	const timebasedTestContract = artifacts.require('libs/TimebasedTest')
	describe('TimebasedTest; t_timestamp', () => {
		it('t_timestamp', async () => {
			const timebasedTest = await timebasedTestContract.new()
			const timestamp = await timebasedTest.t_timestamp()
			const timestamp2 = await timebasedTest.t_timestamp()
			// eslint-disable-next-line no-undef
			assert.isTrue(
				timestamp.toNumber() <= timestamp2.toNumber(),
				"10000 wasn't in the first account"
			)
		})
	})
})
