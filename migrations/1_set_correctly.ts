import Web3 from 'web3'
import {addressConfig, property, market, metrics} from './addresses'
import {toBigNumber} from '../test/test-lib/utils/common'
import BigNumber from 'bignumber.js'

const expected = {
	endBlock: toBigNumber('9647486'),
	calclatedResult: toBigNumber('282'),
	lockedValue: toBigNumber('0'),
	totalLockedValue: toBigNumber('467000000000000000000'),
	totalAssets: toBigNumber('1571'),
	allocationResult: toBigNumber('15135211357674806527948'),
	incorrectAllocationResult: toBigNumber('3787821725082588096476872'),
	incorrectMarketValue: toBigNumber('29230412980127'),
	correctMarketValue: toBigNumber('7315364860307660')
}

const createRewardsAmountKey = (prop: string): string =>
	Web3.utils.keccak256(`_rewardsAmount${prop}`)
const createCumulativePriceKey = (prop: string): string =>
	Web3.utils.keccak256(`_cumulativePrice${prop}`)
const lastAssetValueEachMarketPerBlockKey = (prop: string): string =>
	Web3.utils.keccak256(`_lastAssetValueEachMarketPerBlock${prop}`)
const lastAssetValueEachMetricsKey = (prop: string): string =>
	Web3.utils.keccak256(`_lastAssetValueEachMetrics${prop}`)

const price = (value: BigNumber): BigNumber =>
	value.times(toBigNumber('1000000000000000000')).div(10000000)

const handler = function(deployer, network, [owner]) {
	if (network === 'test') {
		return
	}

	;((deployer as unknown) as Promise<void>)
		.then(async () => {
			/* Create the AddressConfig instance
			 * AddressConfig インスタンスを作成
			 */
			const [addressConfigInstance] = await Promise.all([
				artifacts.require('AddressConfig').at(addressConfig)
			])

			/* Verify the current sender is the correct owner
			 * msg.sender が正しいオーナーであることを確認
			 */
			if ((await addressConfigInstance._owner()) !== owner) {
				throw new Error('executing by unexpected owner')
			}

			/* Get contract addresses
			 * コントラクトアドレスを取得
			 */
			const [
				withdrawStorageAddress,
				allocatorStorageAddress,
				policyAddress,
				allocatorAddress
			] = await Promise.all([
				addressConfigInstance.withdrawStorage(),
				addressConfigInstance.allocatorStorage(),
				addressConfigInstance.policy(),
				addressConfigInstance.allocator()
			])

			/* Create contract instances from addresses
			 * コントラクトアドレスからインスタンスを作成
			 */
			const [
				withdrawStorageInstanse,
				allocatorStorageInstance,
				policyInstance,
				allocatorInstance
			] = await Promise.all([
				artifacts.require('WithdrawStorage').at(withdrawStorageAddress),
				artifacts.require('AllocatorStorage').at(allocatorStorageAddress),
				artifacts.require('Policy').at(policyAddress),
				artifacts.require('Allocator').at(allocatorAddress)
			])

			/* Calculate the correct allocation amount
			 * 正しい allocation 値を計算
			 */
			const allocationResult = await (async () => {
				/* Calculate the correct block time
				 * 正しいブロック期間を計算
				 */
				const blocks = await (async () => {
					const baseBlock = await allocatorStorageInstance
						.getBaseBlockNumber()
						.then(toBigNumber)
					return expected.endBlock.minus(baseBlock)
				})()

				/* Calculate the mintable amount
				 * ミント可能な値を計算
				 */
				const mint = await policyInstance
					.rewards(expected.totalLockedValue, expected.totalAssets)
					.then(toBigNumber)

				/* Calculate the correct asset value
				 * 正しい資産価値を計算
				 */
				const value = await (async () => {
					const assetValue = await policyInstance
						.assetValue(expected.calclatedResult, expected.lockedValue)
						.then(toBigNumber)
					const basis = await allocatorInstance.basis().then(toBigNumber)
					return assetValue.times(basis).div(blocks)
				})()

				const marketValue = value
				const assets = expected.totalAssets
				const totalAssets = expected.totalAssets

				/* Run and return the result
				 * 実行して結果を返却
				 */
				return allocatorInstance
					.allocation(blocks, mint, value, marketValue, assets, totalAssets)
					.then(toBigNumber)
			})()

			/* Verify the result equals expected value
			 * 正しい allocation 値が事前の計算通りであることを確認
			 */
			if (!allocationResult.isEqualTo(expected.allocationResult)) {
				throw new Error('unexpected allocation result')
			}

			/* Get the EthernalStorage address from the Each Storage
			 * 各Storage から EthernalStorage のアドレスを取得
			 */
			const [
				WithdrawEternalStorageAddress,
				AllocatorEternalStorageAddress
			] = await Promise.all([
				withdrawStorageInstanse.getStorageAddress(),
				allocatorStorageInstance.getStorageAddress()
			])

			/* Create the EthernalStorage instance from the address
			 * アドレスから EthernalStorage インスタンスを作成
			 */
			const [
				withdrawEternalStorageInstance,
				allocatorEternalStorageInstance
			] = await Promise.all([
				artifacts.require('EternalStorage').at(WithdrawEternalStorageAddress),
				artifacts.require('EternalStorage').at(AllocatorEternalStorageAddress)
			])

			/* Get the incorrect states
			 * 誤った状態を取得
			 */
			const [
				originalRewardsAmount,
				originalCumulativePrice,
				originalLastAssetValueEachMarketPerBlock,
				originalLastAssetValueEachMetricsKey
			] = await Promise.all([
				withdrawEternalStorageInstance
					.getUint(createRewardsAmountKey(property))
					.then(toBigNumber),
				withdrawEternalStorageInstance
					.getUint(createCumulativePriceKey(property))
					.then(toBigNumber),
				allocatorEternalStorageInstance
					.getUint(lastAssetValueEachMarketPerBlockKey(market))
					.then(toBigNumber),
				allocatorEternalStorageInstance
					.getUint(lastAssetValueEachMetricsKey(metrics))
					.then(toBigNumber)
			])

			/* Verify the incorrect states are equals to the incorrect states that expected
			 * 誤った状態が事前に取得した誤った状態と等しいことを確認
			 */
			if (
				!originalRewardsAmount.isEqualTo(expected.incorrectAllocationResult) &&
				!originalCumulativePrice.isEqualTo(
					price(expected.incorrectAllocationResult)
				) &&
				!originalLastAssetValueEachMarketPerBlock.isEqualTo(
					expected.incorrectMarketValue
				) &&
				!originalLastAssetValueEachMetricsKey.isEqualTo(
					expected.incorrectAllocationResult
				)
			) {
				throw new Error('got an unexpected value')
			}

			const correctRewardsAmount = allocationResult.toFixed()
			const correctCumulativePrice = price(allocationResult).toFixed()
			const correctMarketValue = expected.correctMarketValue.toFixed()

			/* Change the owner to rewrite states
			 * 状態を書き換えるためにオーナーを変更
			 */
			await withdrawStorageInstanse.changeOwner(owner)
			await allocatorStorageInstance.changeOwner(owner)

			/* Rewrite the RewardsAmount with the correct value
			 * 正しい値で RewardsAmount を書き換える
			 */
			await withdrawEternalStorageInstance.setUint(
				createRewardsAmountKey(property),
				correctRewardsAmount
			)

			/* Rewrite the CumulativePrice with the correct value
			 * 正しい値で CumulativePrice を書き換える
			 */
			await withdrawEternalStorageInstance.setUint(
				createCumulativePriceKey(property),
				correctCumulativePrice
			)

			/* Rewrite the LastAssetValueEachMarketPerBlockKey with the correct value
			 * 正しい値で LastAssetValueEachMarketPerBlockKey を書き換える
			 */
			await allocatorEternalStorageInstance.setUint(
				lastAssetValueEachMarketPerBlockKey(metrics),
				correctMarketValue
			)

			/* Rewrite the lastAssetValueEachMetricsKey with the correct value
			 * 正しい値で lastAssetValueEachMetricsKey を書き換える
			 */
			await allocatorEternalStorageInstance.setUint(
				lastAssetValueEachMetricsKey(market),
				correctRewardsAmount
			)

			/* Revert the owner
			 * オーナーを元に戻す
			 */
			await withdrawEternalStorageInstance.changeOwner(withdrawStorageAddress)
			await allocatorEternalStorageInstance.changeOwner(allocatorStorageAddress)
		})
		.then(() => {
			console.error('*** COMPLETED! ***')
		})
		.catch(err => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
