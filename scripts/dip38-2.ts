import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import {
	prepare,
	createMetricsGroup,
	createQueue,
	setInitialCumulativeHoldersRewardCap,
	createGraphQLPropertyFactoryCreatePropertyFetcher,
	createHasAssetsPerProperty,
} from './lib/bulk-initializer'
import { graphql } from './lib/api'
import { GraphQLPropertyFactoryCreatePropertyResponse } from './lib/types'
const { log: ____log } = console

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	const [from] = await web3.eth.getAccounts()
	const lockup = await prepare(configAddress, web3)
	____log('load Lockup contract', lockup.options)
	const metricsGroup = await createMetricsGroup(configAddress, web3)
	____log('load metricsGroup contract', metricsGroup.options)

	const fetchGraphQL = createGraphQLPropertyFactoryCreatePropertyFetcher(
		graphql()
	)
	const all = await (async () =>
		new Promise<
			GraphQLPropertyFactoryCreatePropertyResponse['data']['property_factory_create']
		>((resolve) => {
			const f = async (
				i = 0,
				prev: GraphQLPropertyFactoryCreatePropertyResponse['data']['property_factory_create'] = []
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
	____log('GraphQL fetched', all)
	____log('all targets', all.length)
	const fetchFastestGasPrice = ethGasStationFetcher(egsApiKey)
	const hasAssetsPerProperty = createHasAssetsPerProperty(metricsGroup)

	const setLockupCap = setInitialCumulativeHoldersRewardCap(lockup)(from)
	const filteringTacks = all.map(({ property, ...x }) => async () => {
		const hasAssets = await hasAssetsPerProperty(property)
		____log('Should skip item?', !hasAssets, property)
		return { property, hasAssets, ...x }
	})
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter(({ hasAssets }) => hasAssets))
	____log('Should skip items', all.length - shouldInitilizeItems.length)
	____log('Should set items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map((data) => async () => {
		const { property } = data
		const gasPrice = await fetchFastestGasPrice()
		____log('Start set', property, gasPrice)

		await new Promise((resolve) => {
			setLockupCap(property, gasPrice)
				.on('transactionHash', (hash: string) => {
					____log('Created the transaction', hash)
				})
				.on('confirmation', resolve)
				.on('error', (err) => {
					console.error(err)
					resolve(err)
				})
		})
		____log('Done initilization', property)
	})

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
