// Unused value
// import Web3 from 'web3'
import {
	prepare,
	createQueue,
	createGraphQLPropertyFactoryCreateFetcher,
	createGetMetricsCountPerProperty,
	// Already nonexistent value
	// create__SetMetricsCountPerProperty,
} from './lib/bulk-initializer'
import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { graphql } from './lib/api'
import { GraphQLPropertyFactoryCreateResponse } from './lib/types'
const { CONFIG, EGS_TOKEN } = process.env

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	// Unused value
	// const [from] = await (web3 as Web3).eth.getAccounts()

	const lockup = await prepare(CONFIG, web3)
	console.log('Generated Lockup contract', lockup.options)

	const fetchGraphQL = createGraphQLPropertyFactoryCreateFetcher(graphql())
	const all = await (async () =>
		new Promise<
			GraphQLPropertyFactoryCreateResponse['data']['property_factory_create']
		>((resolve) => {
			const f = async (
				i = 0,
				prev: GraphQLPropertyFactoryCreateResponse['data']['property_factory_create'] = []
			): Promise<void> => {
				const { data } = await fetchGraphQL(i)
				const { property_factory_create: items } = data
				const next = [...prev, ...items]
				if (items.length > 0) {
					f(i + items.length, next).catch(console.error)
				} else {
					resolve(next)
				}
			}

			f().catch(console.error)
		}))()
	console.log('GraphQL fetched', all)
	console.log('all targets', all.length)

	const fetchFastestGasPrice = ethGasStationFetcher(EGS_TOKEN)

	const getMetricsCountPerProperty = createGetMetricsCountPerProperty({} as any)
	// Already nonexistent value
	// const setMetricsCountPerProperty = create__SetMetricsCountPerProperty(
	// 	{} as any
	// )(from)

	const filteringTacks = all.map(({ property, ...x }) => async () => {
		const asses = await getMetricsCountPerProperty(property)
		const skip =
			asses !== '0' || x.authentication_aggregate.aggregate.count === 0
		console.log('Should skip item?', skip, property)
		return { property, skip, ...x }
	})
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter(({ skip }) => !skip))
	console.log('Should skip items', all.length - shouldInitilizeItems.length)
	console.log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map((data) => async () => {
		const { property } = data
		const assets = data.authentication_aggregate.aggregate.count
		const gasPrice = await fetchFastestGasPrice()
		console.log('Start initilization', property, assets, gasPrice)

		// Already nonexistent value
		// await new Promise((resolve) => {
		// 	setMetricsCountPerProperty(property, assets.toString(), gasPrice)
		// 		.on('transactionHash', (hash: string) =>
		// 			console.log('Created the transaction', hash)
		// 		)
		// 		.on('confirmation', resolve)
		// 		.on('error', (err) => {
		// 			console.error(err)
		// 			resolve(err)
		// 		})
		// })
		// console.log('Done initilization', property, assets)
	})

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(undefined)
}

export = handler
