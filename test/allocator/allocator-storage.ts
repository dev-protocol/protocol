import {DevProtocolInstance} from '../test-lib/instance'
import {validateErrorMessage} from '../test-lib/error-utils'

contract(
	'AllocatorStorageTest',
	([deployer, metrics, allocator, dummyAllocator]) => {
		const dev = new DevProtocolInstance(deployer)
		before(async () => {
			await dev.generateAddressConfig()
			await dev.generateAllocatorStorage()
			await dev.addressConfig.setAllocator(allocator)
		})
		describe('AllocatorStorage; setAllocationBlockNumber, getLastBlockNumber', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setLastBlockNumber(metrics, 100, {
					from: allocator
				})
				const result = await dev.allocatorStorage.getLastBlockNumber(metrics)
				expect(result.toNumber()).to.be.equal(100)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setLastBlockNumber(metrics, 100, {from: dummyAllocator})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('AllocatorStorage; setBaseBlockNumber, getBaseBlockNumber', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setBaseBlockNumber(1000, {from: allocator})
				const result = await dev.allocatorStorage.getBaseBlockNumber()
				expect(result.toNumber()).to.be.equal(1000)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setBaseBlockNumber(1000, {from: dummyAllocator})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('AllocatorStorage; setPendingIncrement, getPendingIncrement', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setPendingIncrement(metrics, true, {
					from: allocator
				})
				const result = await dev.allocatorStorage.getPendingIncrement(metrics)
				expect(result).to.be.equal(true)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setPendingIncrement(metrics, true, {from: dummyAllocator})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('AllocatorStorage; setLastAllocationBlockEachMetrics, getLastAllocationBlockEachMetrics', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setLastAllocationBlockEachMetrics(
					metrics,
					10000,
					{from: allocator}
				)
				const result = await dev.allocatorStorage.getLastAllocationBlockEachMetrics(
					metrics
				)
				expect(result.toNumber()).to.be.equal(10000)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setLastAllocationBlockEachMetrics(metrics, 10000, {
						from: dummyAllocator
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
		describe('AllocatorStorage; setLastAssetValueEachMarketPerBlock, getLastAssetValueEachMarketPerBlock', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setLastAssetValueEachMarketPerBlock(
					metrics,
					1000000,
					{from: allocator}
				)
				const result = await dev.allocatorStorage.getLastAssetValueEachMarketPerBlock(
					metrics
				)
				expect(result.toNumber()).to.be.equal(1000000)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setLastAssetValueEachMarketPerBlock(metrics, 1000000, {
						from: dummyAllocator
					})
					.catch((err: Error) => err)
				validateErrorMessage(result as Error, 'this address is not proper')
			})
		})
	}
)
