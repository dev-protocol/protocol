/* eslint-disable no-undef */
import Web3 from 'web3'
import {
	prepare,
	createGraphQLFetcher,
	createEGSFetcher,
	createGetStorageLastCumulativeGlobalReward,
	createGetStorageLastCumulativeLockedUpAndBlock,
	createDifferenceCaller,
	createGetCumulativeLockedUpCaller,
	createInitializeStatesAtLockup,
	createQueue,
} from './lib/bulk-initialize-states-at-lockup'
import {graphql, ethgas} from './lib/api'
import {GraphQLResponse} from './lib/types'
const {CONFIG, EGS_TOKEN} = process.env
const {log: ____log} = console

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN) {
		return
	}

	const [from] = await (web3 as Web3).eth.getAccounts()

	const lockup = await prepare(CONFIG)
	____log('Generated Lockup contract', lockup.options)

	const fetchGraphQL = createGraphQLFetcher(graphql())
	const all = await (async () =>
		new Promise<GraphQLResponse['data']['account_lockup']>((resolve) => {
			const f = async (
				i = 0,
				prev: GraphQLResponse['data']['account_lockup'] = []
			): Promise<void> => {
				const {data} = await fetchGraphQL(i)
				const {account_lockup: items} = data
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

	const fetchGasPrice = createEGSFetcher(ethgas(EGS_TOKEN))

	const fetchFastestGasPrice = async () =>
		fetchGasPrice().then((res) =>
			(web3 as Web3).utils.toWei(`${res.fastest / 10}`, 'Gwei')
		)

	const lastCumulativeGlobalReward = createGetStorageLastCumulativeGlobalReward(
		lockup
	)
	const lastCumulativeLockedUpAndBlock = createGetStorageLastCumulativeLockedUpAndBlock(
		lockup
	)
	const difference = createDifferenceCaller(lockup)
	const getCumulativeLockedUp = createGetCumulativeLockedUpCaller(lockup)
	const initializeStatesAtLockup = createInitializeStatesAtLockup(lockup)(from)

	const targets = all.filter(({lockedup}) => Boolean(lockedup))
	____log('all targets', targets.length)

	const filteringTacks = targets.map(
		({property_address, account_address, ...x}) => async () => {
			const [cReward, {_cLocked, _block}] = await Promise.all([
				lastCumulativeGlobalReward()(property_address, account_address),
				lastCumulativeLockedUpAndBlock()(property_address, account_address),
			])
			const skip = [cReward, _cLocked, _block].every((y) => y !== '0')
			____log(
				'Should skip item',
				property_address,
				account_address,
				cReward,
				_cLocked,
				_block
			)
			return {property_address, account_address, skip, ...x}
		}
	)
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter((x) => !x.skip))
	____log('Should skip items', targets.length - shouldInitilizeItems.length)
	____log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems.map(
		({property_address, account_address, lockedup}) => async () => {
			const {block_number} = lockedup
			const res = await Promise.all([
				difference(block_number)(property_address),
				getCumulativeLockedUp(block_number)(property_address, account_address),
			])
			const reward = res[0]._reward
			const cLocked = res[1]._value
			const gasPrice = await fetchFastestGasPrice()
			____log(
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
					.on('transactionHash', (hash: string) =>
						____log('Created the transaction', hash)
					)
					.on('confirmation', resolve)
					.on('error', reject)
			})
			____log('Done initilization', property_address, account_address)
		}
	)

	createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
