/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import {
	prepare,
	createQueue,
	createDev,
	// Already nonexistent value
	// createWithdrawMigration,
	createWithdrawStorage,
	createGetLastCumulativeHoldersRewardCaller,
	createDifferenceCaller,
	// Already nonexistent value
	// createSetLastCumulativeHoldersReward,
} from './lib/bulk-initializer'
import { ethGasStationFetcher } from '@devprotocol/util-ts'
import { PromiseReturn } from './lib/types'
const { CONFIG, EGS_TOKEN, WITHDRAW_STORAGE, WITHDRAW_MIGRATION } = process.env

const DEV = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'
const withdrawContracts = [
	'0x76fd43840c3944bfaa9da24125d76d7a85cf5269',
	'0xc86f49bfa6f7c9aebaece655651b915dc124a3d6',
	'0x2b56e1e9bf814a6658cb55898efdd61170c682d9',
	'0x2ecefc14a8fc0f52f9345b2fc069fe46defe6e54',
	'0xa10d4f23d87c75af4489406089615e650431034b',
	'0x64b0990c8e663b3202589c32dc0e11ac2b1aede7',
	'0x44a19177a4837cab0178747279bcecbebd6330f2',
	'0xfe11597d2b26f1aa63fb8ac33ee86915cb466e5d',
]

const handler = async (
	callback: (err: Error | undefined) => void
): Promise<void> => {
	if (!CONFIG || !EGS_TOKEN || !WITHDRAW_STORAGE || !WITHDRAW_MIGRATION) {
		return
	}

	// Unused value
	// const [from] = await (web3 as Web3).eth.getAccounts()

	const fetchAllWithdrawEvents = async (devContract: Contract) =>
		devContract.getPastEvents('Transfer', {
			filter: {
				from: '0x0000000000000000000000000000000000000000',
			},
			fromBlock: 0,
			toBlock: 'latest',
		})

	const dev = createDev(DEV)
	// Already nonexistent value
	// const setLastCumulativeHoldersReward = createSetLastCumulativeHoldersReward(
	// 	createWithdrawMigration(WITHDRAW_MIGRATION, web3)
	// )(from)
	const getLastCumulativeHoldersReward =
		createGetLastCumulativeHoldersRewardCaller(
			createWithdrawStorage(WITHDRAW_STORAGE)
		)
	const all = await fetchAllWithdrawEvents(dev)

	const fetchFastestGasPrice = ethGasStationFetcher(EGS_TOKEN)

	const filter = all.map(({ transactionHash, ...x }) => async () => {
		const {
			from: sender,
			to,
			input,
		} = await (web3 as Web3).eth.getTransaction(transactionHash)
		const toWithdraw = to ? withdrawContracts.includes(to.toLowerCase()) : false
		const propertyAddress = toWithdraw ? `0x${input.slice(-40)}` : undefined
		const alreadyInitialized = await (toWithdraw && propertyAddress
			? getLastCumulativeHoldersReward(propertyAddress, sender).then(
					(x) => x !== '0'
			  )
			: false)
		const skip = alreadyInitialized || !toWithdraw
		console.log('Should skip?', skip, propertyAddress, transactionHash)
		return { skip, sender, propertyAddress, ...x }
	})

	const filteredItems = await createQueue(10)
		.addAll(filter)
		.then((data) => data.filter((i) => !i.skip))
		.catch(console.error)

	if (!filteredItems) {
		console.log('Error')
		return
	}

	const createKey = (el: any) => `${el.propertyAddress ?? ''}${el.sender}`
	const propertyUserMap = new Map([
		[createKey(filteredItems[0]), filteredItems[0]],
	])
	filteredItems.forEach((item) => {
		const key = createKey(item)
		const stored = propertyUserMap.get(key)
		if (stored === undefined || stored.blockNumber < item.blockNumber) {
			propertyUserMap.set(key, item)
		}
	})
	const shouldInitilizeItems = Array.from(propertyUserMap.values())

	console.log('Should skip items', all.length - shouldInitilizeItems.length)
	console.log('Should initilize items', shouldInitilizeItems.length)

	const initializeTasks = shouldInitilizeItems
		? shouldInitilizeItems.map(
				({ propertyAddress, sender, skip, blockNumber }) =>
					async () => {
						if (!propertyAddress) {
							console.log('Property address is not found')
							return
						}

						if (skip) {
							console.log('This item should skip', propertyAddress, sender)
							return
						}

						const lockup = await prepare(CONFIG, blockNumber)
						const diff = createDifferenceCaller(lockup)

						const res:
							| Error
							| PromiseReturn<ReturnType<ReturnType<typeof diff>>> = await diff(
							blockNumber
						)(propertyAddress).catch((err) => new Error(err))
						if (res instanceof Error) {
							console.log(
								'Failed on fetch `difference`. Maybe the block is pre-DIP4.',
								propertyAddress,
								sender,
								blockNumber
							)
							return
						}

						const lastPrice = res._holdersPrice
						if (lastPrice === '0') {
							console.log(
								'Last price is 0.',
								propertyAddress,
								sender,
								blockNumber
							)
							return
						}

						const gasPrice = await fetchFastestGasPrice()
						console.log(
							'Start initilization',
							propertyAddress,
							sender,
							lastPrice,
							gasPrice
						)

						// Already nonexistent value
						// await new Promise((resolve) => {
						// 	setLastCumulativeHoldersReward(
						// 		propertyAddress,
						// 		sender,
						// 		lastPrice,
						// 		gasPrice
						// 	)
						// 		.on('transactionHash', (hash: string) =>
						// 			console.log('Created the transaction', hash)
						// 		)
						// 		.on('confirmation', resolve)
						// 		.on('error', (err) => {
						// 			console.error(err)
						// 			resolve(err)
						// 		})
						// })
						// console.log(
						// 	'Done initilization',
						// 	propertyAddress,
						// 	sender,
						// 	blockNumber,
						// 	lastPrice
						// )
					}
		  )
		: []

	await createQueue(2).addAll(initializeTasks).catch(console.error)

	callback(undefined)
}

export = handler
