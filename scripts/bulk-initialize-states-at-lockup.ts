/* eslint-disable no-useless-call */
/* eslint-disable no-undef */
import bent from 'bent'
import Queue from 'p-queue'
import Web3 from 'web3'
import {Contract} from 'web3-eth-contract/types'
const {CONFIG, EGS_TOKEN} = process.env
const {log: ____log} = console
type GraphQLResponse = {
	data: {
		account_lockup: Array<{
			property_address: string
			account_address: string
			lockedup: {
				block_number: number
			}
		}>
	}
}
type EGSResponse = {
	fast: number
	fastest: number
	safeLow: number
	average: number
	block_time: number
	blockNum: number
	speed: number
	safeLowWait: number
	avgWait: number
	fastWait: number
	fastestWait: number
}
type GasPriceFetcher = () => Promise<string>
type SendTx = {
	on: (event: 'confirmation' | 'error', callback: () => void) => SendTx
}

const graphql = () =>
	bent('https://api.devprtcl.com/v1/graphql', 'POST', 'json')
const ethgas = (token: string) =>
	bent(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${token}`, 'json')
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

const createGraphQLFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (offset = 0): Promise<GraphQLResponse> =>
	fetcher('/', {
		query: `{
			account_lockup(
				offset: ${offset},
				distinct_on: [account_address, property_address],
				order_by: [
					{account_address: desc_nulls_last},
					{property_address: desc_nulls_last}
					{lockedup: {block_number: desc_nulls_last}}
			  	]
			) {
				property_address
				account_address
				lockedup {
					block_number
				}
			}
		}`,
	}).then((r) => (r as unknown) as GraphQLResponse)
const createEGSFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (): Promise<EGSResponse> =>
	fetcher('').then((r) => (r as unknown) as EGSResponse)
const createGetStorageLastCumulativeGlobalReward = (lockup: Contract) => (
	blockNumber?: number
) => async (property: string, user: string): Promise<string> =>
	lockup.methods
		.getStorageLastCumulativeGlobalReward(property, user)
		.call(undefined, blockNumber)
const createGetStorageLastCumulativeLockedUpAndBlock = (lockup: Contract) => (
	blockNumber?: number
) => async (
	property: string,
	user: string
): Promise<{_cLocked: string; _block: string}> =>
	lockup.methods
		.getStorageLastCumulativeLockedUpAndBlock(property, user)
		.call(undefined, blockNumber)
const createDifferenceCaller = (lockup: Contract) => (
	blockNumber?: number
) => async (property: string): Promise<{_reward: string}> =>
	lockup.methods.difference(property).call(undefined, blockNumber)
const createGetCumulativeLockedUpCaller = (lockup: Contract) => (
	blockNumber?: number
) => async (property: string, user: string): Promise<{_value: string}> =>
	lockup.methods
		.getCumulativeLockedUp(property, user)
		.call(undefined, blockNumber)
const createInitializeStatesAtLockup = (lockup: Contract) => (from: string) => (
	property: string,
	user: string,
	reward: string,
	cLocked: string,
	block: string,
	gasPrice: string
	// eslint-disable-next-line max-params
): SendTx =>
	lockup.methods
		.initializeStatesAtLockup(property, user, reward, cLocked, block)
		.send({gasPrice, from})
const createQueue = (concurrency: number) => new Queue({concurrency})

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
	____log(await fetchFastestGasPrice())

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
	const filteringTacks = targets.map(
		({property_address, account_address, ...x}) => async () => {
			const [cReward, {_cLocked, _block}] = await Promise.all([
				lastCumulativeGlobalReward()(property_address, account_address),
				lastCumulativeLockedUpAndBlock()(property_address, account_address),
			])
			const skip = [cReward, _cLocked, _block].every((y) => y !== '0')
			____log('Skip', property_address, account_address)
			return {property_address, account_address, skip, ...x}
		}
	)
	const shouldInitilizeItems = await createQueue(10)
		.addAll(filteringTacks)
		.then((done) => done.filter((x) => !x.skip))

	const initializeTasks = shouldInitilizeItems.map(
		({property_address, account_address, lockedup}) => async () => {
			const {block_number} = lockedup
			const res = await Promise.all([
				difference(block_number)(property_address),
				getCumulativeLockedUp(block_number)(property_address, account_address),
			])
			const reward = res[0]._reward
			const cLocked = res[1]._value
			____log(property_address, account_address, reward, cLocked)

			const gasPrice = await fetchFastestGasPrice()
			await new Promise((resolve, reject) => {
				initializeStatesAtLockup(
					property_address,
					account_address,
					reward,
					cLocked,
					block_number.toString(),
					gasPrice
				)
					.on('confirmation', resolve)
					.on('error', reject)
			})
		}
	)

	createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(null)
}

export = handler
