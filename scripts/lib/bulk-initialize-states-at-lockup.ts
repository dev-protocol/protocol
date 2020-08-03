/* eslint-disable no-undef */
/* eslint-disable no-useless-call */
import bent from 'bent'
import Queue from 'p-queue'
import Web3 from 'web3'
import {Contract} from 'web3-eth-contract/types'
import {GraphQLResponse, EGSResponse, SendTx} from './types'
export const prepare = async (configAddress: string) => {
	const [config] = await Promise.all([
		artifacts.require('AddressConfig').at(configAddress),
	])
	const [lockup] = await Promise.all<any>([
		artifacts.require('Lockup').at(await config.lockup()),
	])
	const contract = new (web3 as Web3).eth.Contract(lockup.abi, lockup.address)
	return contract
}

export const createGraphQLFetcher = (
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
export const createEGSFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (): Promise<EGSResponse> =>
	fetcher('').then((r) => (r as unknown) as EGSResponse)
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
) => async (property: string, user: string): Promise<{_value: string}> =>
	lockup.methods
		.getCumulativeLockedUp(property, user)
		.call(undefined, blockNumber)
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
