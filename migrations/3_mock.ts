import {setAddressConfig} from './mock/config'
import {createStorage} from './mock/storage'
import {createPolicy} from './mock/policy'
import {createProperty} from './mock/property'

const handler = async function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	console.log('[set contract address to AddressConfig]')
	await setAddressConfig(artifacts)
	console.log('---finish---')
	console.log('[create storage]')
	await createStorage(artifacts)
	console.log('---finish---')
	console.log('[create policy]')
	await createPolicy(artifacts)
	console.log('---finish---')
	console.log('[create property]')
	// eslint-disable-next-line no-undef
	await createProperty(artifacts, web3)
	console.log('---finish---')
} as Truffle.Migration

export = handler
