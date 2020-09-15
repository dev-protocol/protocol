/* eslint-disable no-undef */
import {DevCommonInstance} from './lib/instance/common'
import {Withdraw} from './lib/instance/withdraw'
import {WithdrawStorage} from './lib/instance/withdraw-storage'

const handler = async (
	callback: (err: Error | null) => void
): Promise<void> => {
	const dev = new DevCommonInstance(artifacts, 4000000, 10000000000)
	await dev.prepare()

	// Withdraw
	const withdraw = new Withdraw(dev)
	const nextWithdraw = await withdraw.create()
	await withdraw.set(nextWithdraw)

	// Withdraw storage
	const withdrawStorage = new WithdrawStorage(dev)
	const oldWithdrawStorage = await withdrawStorage.load()
	const nextWithdrawStorage = await withdrawStorage.create()
	await withdrawStorage.changeOwner(oldWithdrawStorage, nextWithdrawStorage)
	await withdrawStorage.set(nextWithdrawStorage)

	callback(null)
}

export = handler
