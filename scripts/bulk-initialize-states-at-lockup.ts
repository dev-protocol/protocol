/* eslint-disable no-undef */
import bent from 'bent'
import Web3 from 'web3'
const {CONFIG} = process.env
const {log: ____log} = console

const prepare = async (configAddress: string) => {
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(configAddress),
	])
	const [lockup] = await Promise.all<any>([
		artifacts.require('Lockup').at(await config.lockup()),
	])
	const contract = new (web3 as Web3).eth.Contract(lockup.abi, lockup.address)
	return contract
}

type GraphQLResponse = {
	data: {
		property_factory_create: Array<{
			property: string
			lockedup: Array<{block_number: number; from_address: string}>
		}>
	}
}
const fetch = async (): Promise<GraphQLResponse> =>
	bent('POST', 'json')('https://api.devprtcl.com/v1/graphql', {
		query: `{
			property_factory_create(order_by: {allocation_aggregate: {sum: {result: desc_nulls_last}}}) {
				property
				lockedup(distinct_on: [from_address], order_by: [{from_address: desc}, {block_number: desc}]) {
					block_number
					from_address
				}
			}
		}`,
	}).then((r) => (r as unknown) as GraphQLResponse)

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG) {
		return
	}

	const lockup = await prepare(CONFIG)
	____log('Generated Lockup contract', lockup.options)

	const data = await fetch()
	____log('GraphQL fetched', data)

	callback(null)
}

export = handler
