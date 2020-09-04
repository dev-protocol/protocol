import Web3 from 'web3'
import {PropertyFactoryInstance} from '../../types/truffle-contracts'
import {AddressInfo, createInstance} from './common'

export async function createProperty(
	artifacts: Truffle.Artifacts,
	web3: Web3
): Promise<AddressInfo[]> {
	async function create(address: string, index: number): Promise<string> {
		const propertyFactory = await createInstance<PropertyFactoryInstance>(
			'PropertyFactory',
			artifacts
		)
		const eventLog = await propertyFactory.create(
			`NAME${index}`,
			`SYMBOL${index}`,
			address
		)
		const propertyAddress = await eventLog.logs.filter(
			(e: {event: string}) => e.event === 'Create'
		)[0].args._property
		console.log(`property${index}`)
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		console.log(`contract address:${propertyAddress}`)
		console.log(`account:${address}`)
		return propertyAddress
	}
	// eslint-disable-next-line padding-line-between-statements
	const result: AddressInfo[] = new Array<AddressInfo>()
	const userAddresses = await web3.eth.getAccounts()
	//* **Three do not hold a property contract***
	for (let i = 0; i < userAddresses.length; i++) {
		let propertyAddress
		if (i < userAddresses.length - 3) {
			// eslint-disable-next-line no-await-in-loop
			propertyAddress = await create(userAddresses[i], i)
		}
		// eslint-disable-next-line padding-line-between-statements
		const addressInfo: AddressInfo = {
			account: userAddresses[i],
			property: propertyAddress,
		}
		result.push(addressInfo)
	}
	// eslint-disable-next-line padding-line-between-statements
	return result
}
