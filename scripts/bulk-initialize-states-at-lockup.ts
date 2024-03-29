import Web3 from 'web3'
import {
	prepare,
	createGraphQLFetcher,
	createGetStorageLastCumulativeGlobalReward,
	createGetStorageLastCumulativeLockedUpAndBlock,
	createDifferenceCaller,
	createGetCumulativeLockedUpCaller,
	createInitializeStatesAtLockup,
	createQueue,
} from './lib/bulk-initializer'
import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { graphql } from './lib/api'
import { GraphQLResponse, PromiseReturn } from './lib/types'
const { CONFIG, EGS_TOKEN } = process.env

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const [from] = await (web3 as Web3).eth.getAccounts()

	const lockup = await prepare(CONFIG)
	console.log('Generated Lockup contract', lockup.options)

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
	console.log('GraphQL fetched', all)

	const fetchFastestGasPrice = ethGasStationFetcher(EGS_TOKEN)

	const lastCumulativeGlobalReward =
		createGetStorageLastCumulativeGlobalReward(lockup)
	const lastCumulativeLockedUpAndBlock =
		createGetStorageLastCumulativeLockedUpAndBlock(lockup)
	const initializeStatesAtLockup = createInitializeStatesAtLockup(lockup)(from)

	console.log('all targets', all.length)

	const filteringTacks = all.map(
		({ property_address, account_address, ...x }) =>
			async () => {
				const [cReward, { _cLocked, _block }] = await Promise.all([
					lastCumulativeGlobalReward()(property_address, account_address),
					lastCumulativeLockedUpAndBlock()(property_address, account_address),
				])
				const skip = [cReward, _cLocked, _block].every((y) => y !== '0')
				console.log(
					'Should skip item?',
					skip,
					property_address,
					account_address,
					cReward,
					_cLocked,
					_block
				)
				return { property_address, account_address, skip, ...x }
			}
	)
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter((x) => !x.skip))
	console.log('Should skip items', all.length - shouldInitilizeItems.length)
	console.log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map(
		({ property_address, account_address, block_number }) =>
			async () => {
				const lockupAtThisTime = await prepare(CONFIG, block_number)
				const difference = createDifferenceCaller(lockupAtThisTime)
				const getCumulativeLockedUp =
					createGetCumulativeLockedUpCaller(lockupAtThisTime)
				const res:
					| Error
					| [
							PromiseReturn<ReturnType<ReturnType<typeof difference>>>,
							PromiseReturn<
								ReturnType<ReturnType<typeof getCumulativeLockedUp>>
							>
					  ] = await Promise.all([
					difference(block_number)(property_address),
					getCumulativeLockedUp(block_number)(property_address),
				]).catch((err) => new Error(err))
				if (res instanceof Error) {
					console.log(
						'Could be pre-DIP4 staking',
						property_address,
						account_address,
						block_number
					)
					return
				}

				const reward = res[0]._reward
				const cLocked = res[1]._value
				const gasPrice = await fetchFastestGasPrice()
				console.log(
					'Start initilization',
					property_address,
					account_address,
					reward,
					cLocked,
					gasPrice
				)

				await new Promise((resolve, reject) => {
					initializeStatesAtLockup(
						property_address,
						account_address,
						reward,
						cLocked,
						block_number.toString(),
						gasPrice
					)
						.on('transactionHash', (hash: string) => {
							console.log('Created the transaction', hash)
						})
						.on('confirmation', resolve)
						.on('error', reject)
				})
				console.log('Done initilization', property_address, account_address)
			}
	)

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(undefined)
}

export = handler
