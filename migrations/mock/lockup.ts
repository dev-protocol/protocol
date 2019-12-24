// Import {DummyDEVInstance} from '../../types/truffle-contracts'
import {AddressInfo} from './interface'
import {getDummyDevInstance} from './token'
import BigNumber from 'bignumber.js'

export async function lockup(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[]
): Promise<void> {
	const LockupContract = artifacts.require('Lockup')
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const lockup = await LockupContract.at(LockupContract.address)
	const dummyDev = await getDummyDevInstance(artifacts)
	const tmp = await dummyDev.decimals()
	const decimals = 10 ** tmp.toNumber()
	await lockup.lockup(
		addressInfo[0].property!,
		new BigNumber(20000 * decimals),
		{from: addressInfo[0].account}
	)
	const value = await lockup.getValue(
		addressInfo[0].property!,
		addressInfo[0].account
	)
	console.log(value)
}
