/* eslint-disable no-undef */
import Web3 from 'web3'
import {
	prepare,
	createQueue,
	createGraphQLPropertyFactoryCreateFetcher,
	createGetMetricsCountPerProperty,
	createMetricsGroupMigration,
	create__SetMetricsCountPerProperty,
} from './lib/bulk-initializer'
import {createFastestGasPriceFetcher} from './lib/ethgas'
import {graphql, ethgas} from './lib/api'
import {GraphQLPropertyFactoryCreateResponse} from './lib/types'
const {CONFIG, EGS_TOKEN} = process.env
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const [from] = await (web3 as Web3).eth.getAccounts()

	const lockup = await prepare(CONFIG, web3)
	____log('Generated Lockup contract', lockup.options)

	const fetchGraphQL = createGraphQLPropertyFactoryCreateFetcher(graphql())
	const all = await (async () =>
		new Promise<
			GraphQLPropertyFactoryCreateResponse['data']['property_factory_create']
		>((resolve) => {
			const f = async (
				i = 0,
				prev: GraphQLPropertyFactoryCreateResponse['data']['property_factory_create'] = []
			): Promise<void> => {
				const {data} = await fetchGraphQL(i)
				const {property_factory_create: items} = data
				const next = [...prev, ...items]
				if (items.length > 0) {
					f(i + items.length, next).catch(console.error)
				} else {
					resolve(next)
				}
			}

			f().catch(console.error)
		}))()
	____log('GraphQL fetched', all)
	____log('all targets', all.length)

	const fetchFastestGasPrice = createFastestGasPriceFetcher(
		ethgas(EGS_TOKEN),
		web3
	)

	const metricsGroupMigration = await createMetricsGroupMigration(CONFIG, web3)
	const getMetricsCountPerProperty = createGetMetricsCountPerProperty(
		metricsGroupMigration
	)
	const setMetricsCountPerProperty = create__SetMetricsCountPerProperty(
		metricsGroupMigration
	)(from)

	const filteringTacks = all.map(({property, ...x}) => async () => {
		const asses = await getMetricsCountPerProperty(property)
		const skip = asses !== '0'
		____log('Should skip item?', skip, property)
		return {property, skip, ...x}
	})
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter((x) => !x.skip))
	____log('Should skip items', all.length - shouldInitilizeItems.length)
	____log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map((data) => async () => {
		const {property} = data
		const assets = data.authentication_aggregate.aggregate.count
		const gasPrice = await fetchFastestGasPrice()
		____log('Start initilization', property, assets, gasPrice)

		await new Promise((resolve, reject) => {
			setMetricsCountPerProperty(property, assets.toString(), gasPrice)
				.on('transactionHash', (hash: string) =>
					____log('Created the transaction', hash)
				)
				.on('confirmation', resolve)
				.on('error', reject)
		})
		____log('Done initilization', property, assets)
	})

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
