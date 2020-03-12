import {addressConfig} from './addresses'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	;((deployer as unknown) as Promise<void>)
		.then(async () => {
			console.log('*** Create the AddressConfig instanse from the address ***')
			return artifacts.require('AddressConfig').at(addressConfig)
		})
		.then(async addressConfigInstance => {
			console.log(
				'*** DONE: Created the AddressConfig ***',
				addressConfigInstance.address
			)
			console.log(
				'*** Update Allocator and AllocatorStorage address in the AddressConfig ***'
			)

			const prevAllocator = await addressConfigInstance.allocator()
			const prevAllocatorStorage = await addressConfigInstance.allocatorStorage()
			return Promise.all([
				prevAllocator,
				prevAllocatorStorage,
				addressConfigInstance.setAllocator(
					artifacts.require('Allocator').address
				),
				addressConfigInstance.setAllocatorStorage(
					artifacts.require('AllocatorStorage').address
				)
			])
		})
		.then(async ([prevAllocator, prevAllocatorStorage]) => {
			console.log('*** DONE: Updated AddressConfig ***')
			console.log(
				'*** Create instances no longer used Allocator and AllocatorStorage ***'
			)

			return Promise.all([
				artifacts.require('Allocator').at(prevAllocator),
				artifacts.require('AllocatorStorage').at(prevAllocatorStorage)
			])
		})
		.then(async ([allocator, allocatorStorage]) => {
			console.log('*** DONE: Created the instances ***')
			console.log('*** Kill no longer used Allocator and AllocatorStorage ***')

			return Promise.all([allocator.kill(), allocatorStorage.kill()])
		})
		.then(() => {
			console.log('*** DONE: Killed unused contracts ***')
			console.log('*** ALL COMPLETED! ***')
		})
		.catch(err => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
