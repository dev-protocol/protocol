import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { config } from 'dotenv'
import {
	prepare,
	createMetricsGroup,
	createQueue,
	setInitialCumulativeHoldersRewardCap,
	createGraphQLPropertyAuthenticationPropertyFetcher,
	createWithdrawableRewardPerProperty,
	estimateGasInitialCumulativeHoldersRewardCap,
} from './lib/bulk-initializer'
import { graphql } from './lib/api'
import { GraphQLPropertyAuthenticationPropertyResponse } from './lib/types'
const { log: ____log } = console

config()
const { CONFIG: configAddress, EGS_TOKEN: egsApiKey } = process.env

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!configAddress || !egsApiKey) {
		return
	}

	/**
	 * ==========================
	 * Prepare required functions
	 * ==========================
	 */
	const [from] = await web3.eth.getAccounts()
	const lockup = await prepare(configAddress, web3)
	____log('load Lockup contract', lockup.options)
	const metricsGroup = await createMetricsGroup(configAddress, web3)
	____log('load metricsGroup contract', metricsGroup.options)
	const fetchFastestGasPrice = ethGasStationFetcher(egsApiKey)
	const withdrawableRewardPerProperty = createWithdrawableRewardPerProperty(
		metricsGroup,
		web3
	)
	const setLockupCap = setInitialCumulativeHoldersRewardCap(lockup)(from)
	const estimateSetLockupCap = estimateGasInitialCumulativeHoldersRewardCap(
		lockup
	)(from)
	const fetchGraphQL = createGraphQLPropertyAuthenticationPropertyFetcher(
		graphql()
	)

	/**
	 * ====================
	 * Fetch all Properties
	 * ====================
	 */
	type R = GraphQLPropertyAuthenticationPropertyResponse['data']['property_authentication']
	const authinticatedPropertoes = await (async () => {
		const f = async (i = 0, prev: R = []): Promise<R> => {
			const { data } = await fetchGraphQL(i)
			const { property_authentication: items } = data
			const next = [...prev, ...items]
			return items.length > 0 ? f(i + items.length, next) : next
		}

		return f()
	})()
	const properties = authinticatedPropertoes.map((data) => {
		return data.property
	})
	____log('GraphQL fetched', properties)
	____log('all targets', properties.length)

	/**
	 * ====================================================
	 * Filter to only Properties that has withdrable reward
	 * ====================================================
	 */
	const filteringTasks = properties.map((property) => async () => {
		const unwithdrawn = await withdrawableRewardPerProperty(property)
		const hasUnwithdrawn = unwithdrawn !== '0'
		____log('Should skip item?', !hasUnwithdrawn, property)
		return { property, hasUnwithdrawn }
	})
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTasks)
		.then((done) => done.filter(({ hasUnwithdrawn }) => hasUnwithdrawn))
	____log('Should skip items', properties.length - shouldInitilizeItems.length)
	____log('Should set items', shouldInitilizeItems.length)

	/**
	 * ==================
	 * Run initialization
	 * ==================
	 */
	const initializeTasks = shouldInitilizeItems.map((data) => async () => {
		const { property } = data
		const gasPrice = await fetchFastestGasPrice()
		____log('Start set', property, gasPrice)

		const callable = await estimateSetLockupCap(property, gasPrice)
			.then(() => true)
			.catch((err) => {
				console.error(err)
				return false
			})
		if (callable) {
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
		}

		____log('Done initilization', property)
	})

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
