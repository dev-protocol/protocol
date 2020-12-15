import Web3 from 'web3'
import {
	prepare,
	createGraphQLFetcher,
	createDifferenceCaller,
	createGetStorageLastCumulativePropertyInterest,
	createInitializeLastCumulativePropertyInterest,
	createQueue,
} from './lib/bulk-initializer'
import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { graphql } from './lib/api'
import { GraphQLResponse, PromiseReturn } from './lib/types'
const { CONFIG, EGS_TOKEN } = process.env
const { log: ____log } = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const [from] = await (web3 as Web3).eth.getAccounts()

	const lockup = await prepare(CONFIG, web3)
	____log('Generated Lockup contract', lockup.options)

	const fetchGraphQL = createGraphQLFetcher(graphql())
	const all = await (async () =>
		new Promise<GraphQLResponse['data']['account_lockup']>((resolve) => {
			const f = async (
				i = 0,
				prev: GraphQLResponse['data']['account_lockup'] = []
			): Promise<void> => {
				const { data } = await fetchGraphQL(i)
				const { account_lockup: items } = data
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

	const fetchFastestGasPrice = ethGasStationFetcher(EGS_TOKEN)

	const lastCumulativePropertyInterest = createGetStorageLastCumulativePropertyInterest(
		lockup
	)
	const initializeLastCumulativePropertyInterest = createInitializeLastCumulativePropertyInterest(
		lockup
	)(from)

	____log('all targets', all.length)

	const filteringTacks = all.map(
		({ property_address, account_address, block_number }) => async () => {
			const res = await lastCumulativePropertyInterest()(
				property_address,
				account_address
			)
			const skip = res !== '0'
			____log(
				'Should skip item?',
				skip,
				property_address,
				account_address,
				res,
				block_number
			)
			return { property_address, account_address, skip, block_number }
		}
	)
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter((x) => !x.skip))
	____log('Should skip items', all.length - shouldInitilizeItems.length)
	____log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map(
		({ property_address, account_address, block_number }) => async () => {
			const lockupAtThisTime = await prepare(CONFIG, web3, block_number)
			const difference = createDifferenceCaller(lockupAtThisTime)
			const res:
				| Error
				| PromiseReturn<
						ReturnType<ReturnType<typeof difference>>
				  > = await difference(block_number)(property_address).catch(
				(err) => new Error(err)
			)
			if (res instanceof Error) {
				____log(
					'Could be pre-DIP4 staking',
					property_address,
					account_address,
					block_number
				)
				return
			}

			const interest = res._interestAmount
			const gasPrice = await fetchFastestGasPrice()
			____log(
				'Start initilization',
				property_address,
				account_address,
				interest,
				gasPrice
			)

			await new Promise((resolve, reject) => {
				initializeLastCumulativePropertyInterest(
					property_address,
					account_address,
					interest,
					gasPrice
				)
					.on('transactionHash', (hash: string) =>
						____log('Created the transaction', hash)
					)
					.on('confirmation', resolve)
					.on('error', reject)
			})
			____log('Done initilization', property_address, account_address)
		}
	)

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
