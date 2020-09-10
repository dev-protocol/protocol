/* eslint-disable no-useless-call */
import bent from 'bent'
import Queue from 'p-queue'
import Web3 from 'web3'
import {Contract} from 'web3-eth-contract/types'
import {
	GraphQLResponse,
	SendTx,
	GraphQLPropertyFactoryCreateResponse,
} from './types'
import builtConfig from '../../build/contracts/AddressConfig.json'
import builtLockup from '../../build/contracts/Lockup.json'
import builtMetricsGroup from '../../build/contracts/MetricsGroup.json'
import builtDev from '../../build/contracts/Dev.json'
import builtWithdrawStorage from '../../build/contracts/WithdrawStorage.json'
import {AbiItem} from 'web3-utils/types'
export const createRegistry = (configAddress: string, libWeb3: Web3) =>
	new libWeb3.eth.Contract(builtConfig.abi as AbiItem[], configAddress)
export const prepare = async (
	configAddress: string,
	libWeb3: Web3,
	blockNumber?: number
) => {
	const configContract = createRegistry(configAddress, libWeb3)
	const lockupAddress = await configContract.methods
		.lockup()
		.call(undefined, blockNumber)
	const contract = new libWeb3.eth.Contract(
		builtLockup.abi as AbiItem[],
		lockupAddress
	)
	return contract
}

export const createMetricsGroup = async (
	configAddress: string,
	libWeb3: Web3
) => {
	const configContract = createRegistry(configAddress, libWeb3)
	const metricsGroupAddress = await configContract.methods.metricsGroup().call()
	const contract = new libWeb3.eth.Contract(
		builtMetricsGroup.abi as AbiItem[],
		metricsGroupAddress
	)
	return contract
}

export const createWithdrawMigration = (address: string, libWeb3: Web3) =>
	new libWeb3.eth.Contract([] as AbiItem[], address)

export const createWithdrawStorage = (address: string, libWeb3: Web3) =>
	new libWeb3.eth.Contract(builtWithdrawStorage.abi as AbiItem[], address)

export const createDev = (address: string, libWeb3: Web3) =>
	new libWeb3.eth.Contract(builtDev.abi as AbiItem[], address)

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
export const createGraphQLPropertyFactoryCreateFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (offset = 0): Promise<GraphQLPropertyFactoryCreateResponse> =>
	fetcher('/', {
		query: `{
				property_factory_create(
					offset: ${offset}
				) {
					property
					authentication_aggregate {
						aggregate {
							count
						}
					}
				}
			}`,
	}).then((r) => (r as unknown) as GraphQLPropertyFactoryCreateResponse)
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
export const createGetStorageLastCumulativePropertyInterest = (
	lockup: Contract
) => (blockNumber?: number) => async (
	property: string,
	user: string
): Promise<string> =>
	lockup.methods
		.getStorageLastCumulativePropertyInterest(property, user)
		.call(undefined, blockNumber)
export const createGetMetricsCountPerProperty = (
	metricsGroup: Contract
) => async (property: string): Promise<string> =>
	metricsGroup.methods.getMetricsCountPerProperty(property).call()

export const createDifferenceCaller = (lockup: Contract) => (
	blockNumber?: number
) => async (
	property: string
): Promise<{
	_reward: string
	_holdersAmount: string
	_holdersPrice: string
	_interestAmount: string
	_interestPrice: string
}> => lockup.methods.difference(property, 0).call(undefined, blockNumber)
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
export const createInitializeLastCumulativePropertyInterest = (
	lockup: Contract
) => (from: string) => (
	property: string,
	user: string,
	interest: string,
	gasPrice: string
): SendTx =>
	lockup.methods
		.initializeLastCumulativePropertyInterest(property, user, interest)
		.send({gasPrice, from})
export const create__SetMetricsCountPerProperty = (
	metricsGroupMigration: Contract
) => (from: string) => (
	property: string,
	value: string,
	gasPrice: string
): SendTx =>
	metricsGroupMigration.methods
		.__setMetricsCountPerProperty(property, value)
		.send({gasPrice, from})
export const createGetLastCumulativeHoldersRewardCaller = (
	withdrawStorage: Contract
) => async (property: string, user: string): Promise<string> =>
	withdrawStorage.methods.getLastCumulativeHoldersReward(property, user).call()

export const createSetLastCumulativeHoldersReward = (
	withdrawMigration: Contract
) => (from: string) => (
	property: string,
	user: string,
	value: string,
	gasPrice: string
): SendTx =>
	withdrawMigration.methods
		.setLastCumulativeHoldersReward(property, user, value)
		.send({gasPrice, from})

export const createQueue = (concurrency: number) => new Queue({concurrency})
