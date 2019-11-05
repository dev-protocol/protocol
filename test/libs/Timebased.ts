contract('TimebasedTest', () => {
	const timebasedTestContract = artifacts.require('libs/TimebasedTest')
	describe('TimebasedTest; t_timestamp', () => {
		it('t_timestamp', async () => {
			const timebasedTest = await timebasedTestContract.new()
			const timestamp = await timebasedTest.t_timestamp()
			const secondsPerBlock = await timebasedTest.t_secondsPerBlock()
			const blockHeight = await timebasedTest.t_blockHeight()
			const blockNumber = await timebasedTest.t_blockNumber()
			const diff = blockNumber - blockHeight
			const sec = diff * secondsPerBlock
			const time = Number(await timebasedTest.t_time())
			const currentTime = time + sec
			expect(timestamp.toNumber()).to.be.equal(currentTime)
		})
	})
})
