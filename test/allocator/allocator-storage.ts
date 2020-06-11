import {DevProtocolInstance} from '../test-lib/instance'
import {
	AllocatorStorageInstance,
	EternalStorageInstance,
} from '../../types/truffle-contracts'

contract('AllocatorStorageTest', ([deployer, allocator, dummy]) => {
	const dev = new DevProtocolInstance(deployer)
	let allocatorStorage: AllocatorStorageInstance
	let eternalStorage: EternalStorageInstance
	before(async () => {
		await dev.generateAddressConfig()
		allocatorStorage = await artifacts.require('AllocatorStorage').new({
			from: deployer,
		})
		eternalStorage = await artifacts.require('EternalStorage').new({
			from: deployer,
		})
		await dev.addressConfig.setAllocator(allocator)
		// eslint-disable-next-line no-undef
		const key = web3.utils.soliditySha3(
			'_lastBlockNumber',
			'0xFEfC8Ffb329b6DfE755d24F86A19f604CEbDf3ce'
		)
		await eternalStorage.setUint(key, 10000)
		await allocatorStorage.setStorage(eternalStorage.address)
		await eternalStorage.changeOwner(allocatorStorage.address)
	})
	describe('AllocatorStorage; getLastBlockNumber', () => {
		it('Can get setted value.', async () => {
			const result = await allocatorStorage.getLastBlockNumber(
				'0x05BC991269a9730232a65ea7C471ABcC7D86A5B3'
			)
			expect(result.toNumber()).to.be.equal(10000)
		})
		it('Can get default value.', async () => {
			const result = await allocatorStorage.getLastBlockNumber(dummy)
			expect(result.toNumber()).to.be.equal(0)
		})
	})
})
