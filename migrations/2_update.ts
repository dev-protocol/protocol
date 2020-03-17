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
			console.log('*** Update PropertyFactory address in the AddressConfig ***')

			return Promise.all([
				addressConfigInstance.setPropertyFactory(
					artifacts.require('PropertyFactory').address
				)
			])
		})
		.then(() => {
			console.log('*** ALL COMPLETED! ***')
		})
		.catch(err => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
