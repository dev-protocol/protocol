import {DevProtocolInstance} from '../test-lib/instance'
import {
	validateAddressErrorMessage,
	validatePauseErrorMessage,
} from '../test-lib/utils/error'

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
					from: allocator,
				})
				const result = await dev.allocatorStorage.getLastBlockNumber(metrics)
				expect(result.toNumber()).to.be.equal(100)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setLastBlockNumber(metrics, 100, {from: dummyAllocator})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
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
				validateAddressErrorMessage(result)
			})
		})
		describe('AllocatorStorage; setPendingIncrement, getPendingIncrement', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setPendingIncrement(metrics, true, {
					from: allocator,
				})
				const result = await dev.allocatorStorage.getPendingIncrement(metrics)
				expect(result).to.be.equal(true)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setPendingIncrement(metrics, true, {from: dummyAllocator})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
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
						from: dummyAllocator,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('AllocatorStorage; setPendingLastBlockNumber, getPendingLastBlockNumber', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setPendingLastBlockNumber(metrics, 1000000, {
					from: allocator,
				})
				const result = await dev.allocatorStorage.getPendingLastBlockNumber(
					metrics
				)
				expect(result.toNumber()).to.be.equal(1000000)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setPendingLastBlockNumber(metrics, 1000000, {
						from: dummyAllocator,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('AllocatorStorage; setWaitUntilAllocatable, getWaitUntilAllocatable', () => {
			it('Can get setted value.', async () => {
				await dev.allocatorStorage.setWaitUntilAllocatable(1000000, {
					from: allocator,
				})
				const result = await dev.allocatorStorage.getWaitUntilAllocatable()
				expect(result.toNumber()).to.be.equal(1000000)
			})
			it('Cannot rewrite data from other than allocator.', async () => {
				const result = await dev.allocatorStorage
					.setWaitUntilAllocatable(1000000, {
						from: dummyAllocator,
					})
					.catch((err: Error) => err)
				validateAddressErrorMessage(result)
			})
		})
		describe('AllocatorStorage; pause, unpause', () => {
			it('if owner execute pause method, owner cannot use set function.', async () => {
				await dev.allocatorStorage.pause()
				const res = await dev.allocatorStorage
					.setLastBlockNumber(metrics, 100, {
						from: allocator,
					})
					.catch((err: Error) => err)
				validatePauseErrorMessage(res)
				await dev.allocatorStorage.unpause()
				await dev.allocatorStorage.setLastBlockNumber(metrics, 10000000, {
					from: allocator,
				})
				const result = await dev.allocatorStorage.getLastBlockNumber(metrics)
				expect(result.toNumber()).to.be.equal(10000000)
			})
		})
	}
)
