/* eslint-disable no-useless-call */
import bent from 'bent'
import Queue from 'p-queue'
import Web3 from 'web3'
import {Contract} from 'web3-eth-contract/types'
import {GraphQLResponse, SendTx} from './types'
import builtConfig from '../../build/contracts/AddressConfig.json'
import builtLockup from '../../build/contracts/Lockup.json'
import {AbiItem} from 'web3-utils/types'
export const prepare = async (
	configAddress: string,
	libWeb3: Web3,
	blockNumber?: number
) => {
	const configContract = new libWeb3.eth.Contract(
		builtConfig.abi as AbiItem[],
		configAddress
	)
	const lockupAddress = await configContract.methods
		.lockup()
		.call(undefined, blockNumber)
	const contract = new libWeb3.eth.Contract(
		builtLockup.abi as AbiItem[],
		lockupAddress
	)
	return contract
}

export const createGraphQLFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (offset = 0): Promise<GraphQLResponse> =>
	fetcher('/', {
		query: `{
			account_lockup(
				offset: ${offset},
				order_by: {block_number: desc}
			) {
				property_address
				account_address
				block_number
			}
		}`,
	}).then((r) => (r as unknown) as GraphQLResponse)
export const createGetStorageLastCumulativeGlobalReward = (
	lockup: Contract
) => (blockNumber?: number) => async (
	property: string,
	user: string
): Promise<string> =>
	lockup.methods
		.getStorageLastCumulativeGlobalReward(property, user)
		.call(undefined, blockNumber)
export const createGetStorageLastCumulativeLockedUpAndBlock = (
	lockup: Contract
) => (blockNumber?: number) => async (
	property: string,
	user: string
): Promise<{_cLocked: string; _block: string}> =>
	lockup.methods
		.getStorageLastCumulativeLockedUpAndBlock(property, user)
		.call(undefined, blockNumber)
export const createDifferenceCaller = (lockup: Contract) => (
	blockNumber?: number
) => async (property: string): Promise<{_reward: string}> =>
	lockup.methods.difference(property, 0).call(undefined, blockNumber)
export const createGetCumulativeLockedUpCaller = (lockup: Contract) => (
	blockNumber?: number
) => async (property: string): Promise<{_value: string}> =>
	lockup.methods.getCumulativeLockedUp(property).call(undefined, blockNumber)
export const createInitializeStatesAtLockup = (lockup: Contract) => (
	from: string
) => (
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
export const createQueue = (concurrency: number) => new Queue({concurrency})
