contract(
	'AllocationBlockNumberTest',
	([deployer, allocator, key1, key2, key3]) => {
		const allocationBlockNumberContract = artifacts.require(
			'AllocationBlockNumber'
		)
		const addressConfigContract = artifacts.require('AddressConfig')
		describe('AllocationBlockNumber; getLastAllocationBlockNumber', () => {
			let allocationBlockNumber: any
			beforeEach(async () => {
				const addressConfig = await addressConfigContract.new({from: deployer})
				await addressConfig.setAllocator(allocator)
				allocationBlockNumber = await allocationBlockNumberContract.new(
					addressConfig.address,
					{from: deployer}
				)
				await allocationBlockNumber.setWithNow(key1, {from: allocator})
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
	}
)
