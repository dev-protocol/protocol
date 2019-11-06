contract('TimebasedTest', () => {
	const timebasedTestContract = artifacts.require('libs/TimebasedTest')
	describe('TimebasedTest; t_timestamp', () => {
		it('t_timestamp', async () => {
			const timebasedTest = await timebasedTestContract.new()
			const timestamp = await timebasedTest.t_timestamp()
			await timebasedTest.t_setSecondsPerBlock(10)
			const timestamp2 = await timebasedTest.t_timestamp()
			console.log(timestamp.toNumber())
			console.log(timestamp2.toNumber())
			// Const timebasedTest = await timebasedTestContract.new()
			// const blockNumber = await timebasedTest.t_blockNumber()
			// const secondsPerBlock = await timebasedTest.t_secondsPerBlock()
			// const blockHeight = await timebasedTest.t_blockHeight()
			// const timestamp = await timebasedTest.t_timestamp()
			// const diff = blockNumber - blockHeight
			// const sec = diff * secondsPerBlock
			// console.log(sec)
			// const time = Number(await timebasedTest.t_time())
			// console.log(time)
			// const currentTime = time + sec
			// expect(timestamp.toNumber()).to.be.equal(currentTime)
		})
	})
})
