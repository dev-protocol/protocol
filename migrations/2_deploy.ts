import {addressConfig} from './addresses'

const handler = function(deployer, network, [owner]) {
	if (network === 'test') {
		return
	}

	;((deployer as unknown) as Promise<void>).then(async () => {
		/* Create the AddressConfig instance
		 * AddressConfig インスタンスを作成
		 */
		const [addressConfigInstance] = await Promise.all([
			artifacts.require('AddressConfig').at(addressConfig)
		])

		/* Verify the current sender is the correct owner
		 * msg.sender が正しいオーナーであることを確認
		 */
		if ((await addressConfigInstance._owner()) !== owner) {
			throw new Error('executing by unexpected owner')
		}

		/* Get contract addresses
		 * コントラクトアドレスを取得
		 */
		const [allocatorStorageAddress, allocatorAddress] = await Promise.all([
			addressConfigInstance.allocatorStorage(),
			addressConfigInstance.allocator()
		])

		/* Create contract instances from addresses
		 * コントラクトアドレスからインスタンスを作成
		 */
		const [allocatorStorageInstance, allocatorInstance] = await Promise.all([
			artifacts.require('AllocatorStorage').at(allocatorStorageAddress),
			artifacts.require('Allocator').at(allocatorAddress)
		])

		// 新コントラクトをデプロイ
		const decimals = artifacts.require('Decimals')

		// Library
		deployer.deploy(decimals)

		// Allocator
		deployer.link(decimals, artifacts.require('Allocator'))
		deployer.deploy(
			artifacts.require('Allocator'),
			addressConfigInstance.address
		)
		deployer.deploy(
			artifacts.require('AllocatorStorage'),
			addressConfigInstance.address
		)

		// 新しいコントラクトのアドレスを取得
		const newAllocatorAddress = artifacts.require('Allocator').address
		const newAllocatorStorageAddress = artifacts.require('AllocatorStorage')
			.address
		const newDecimalsAddress = artifacts.require('Decimals').address

		// AdressConfigにセット
		await Promise.all([
			addressConfigInstance.setAllocatorStorage(newAllocatorStorageAddress),
			addressConfigInstance.setAllocator(newAllocatorAddress)
		])

		console.log('allocator:' + newAllocatorAddress)
		console.log('allocator storage:' + newAllocatorStorageAddress)
		console.log('decimals:' + newDecimalsAddress)

		// 不要なコントラクトをkill
		await allocatorInstance.kill()
		await allocatorStorageInstance.kill()
	})
} as Truffle.Migration

export = handler
