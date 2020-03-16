import {LockupInstance, DevInstance} from '../../types/truffle-contracts'
import {AddressInfo, createInstance} from './common'
import BigNumber from 'bignumber.js'

export async function lockup(
	artifacts: Truffle.Artifacts,
	addressInfo: AddressInfo[]
): Promise<void> {
	async function innerLockup(
		account: string,
		propertyAddress: string,
		value: number
	): Promise<void> {
		const bigValue = new BigNumber(value * decimals)
		await dev.deposit(propertyAddress, bigValue, {from: account})
		const resultValue = await lockup.getValue(propertyAddress, account)
		const lockupValue = new BigNumber(resultValue).dividedBy(
			new BigNumber(decimals)
		)
		console.log(
			`   property:${propertyAddress}  value:${lockupValue.toNumber()}`
		)
	}

	const lockup = await createInstance<LockupInstance>('Lockup', artifacts)
	const dev = await createInstance<DevInstance>('Dev', artifacts)
	const tmp = await dev.decimals()
	const decimals = 10 ** tmp.toNumber()

	console.log('account:' + addressInfo[0].account)
	await innerLockup(addressInfo[0].account, addressInfo[0].property!, 20000)
	await innerLockup(addressInfo[0].account, addressInfo[2].property!, 10000)
	await innerLockup(addressInfo[0].account, addressInfo[6].property!, 5000)

	console.log('account:' + addressInfo[1].account)
	await innerLockup(addressInfo[1].account, addressInfo[0].property!, 10000)
	await innerLockup(addressInfo[1].account, addressInfo[3].property!, 5000)
	await innerLockup(addressInfo[1].account, addressInfo[5].property!, 3000)

	console.log('account:' + addressInfo[3].account)
	await innerLockup(addressInfo[3].account, addressInfo[1].property!, 30000)

	console.log('account:' + addressInfo[5].account)
	await innerLockup(addressInfo[5].account, addressInfo[5].property!, 100)
	await innerLockup(addressInfo[5].account, addressInfo[6].property!, 50)

	console.log('account:' + addressInfo[8].account)
	await innerLockup(addressInfo[8].account, addressInfo[6].property!, 40000)

	console.log('account:' + addressInfo[9].account)
	await innerLockup(addressInfo[9].account, addressInfo[0].property!, 10000)
}
