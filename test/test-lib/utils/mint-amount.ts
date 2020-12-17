import BigNumber from 'bignumber.js'
import { DevProtocolInstance } from '../instance'
import { toBigNumber } from './common'
import { PropertyInstance } from '../../../types/truffle-contracts'

async function getWithdrawAmount(
	dev: DevProtocolInstance,
	propertyAddress: string
): Promise<[BigNumber, BigNumber]> {
	const cal = await dev.allocator
		.calculateMaxRewardsPerBlock()
		.then(toBigNumber)
	const policyAddress = await dev.addressConfig.policy()
	// eslint-disable-next-line @typescript-eslint/await-thenable
	const policyInstance = await artifacts.require('IPolicy').at(policyAddress)
	const value = await dev.lockup.getPropertyValue(propertyAddress)
	const share = await policyInstance
		.holdersShare(cal.toFixed(), value.toNumber())
		.then(toBigNumber)
	return [cal, share]
}

export async function getWithdrawHolderAmount(
	dev: DevProtocolInstance,
	propertyAddress: string,
	transitionalBlock = 1
): Promise<BigNumber> {
	const [, share] = await getWithdrawAmount(dev, propertyAddress)
	return share.times(transitionalBlock)
}

export async function getWithdrawInterestAmount(
	dev: DevProtocolInstance,
	calculateWithdrawableAmount: BigNumber,
	propertyAddress: string,
	transitionalBlock = 1
): Promise<BigNumber> {
	const [cal, share] = await getWithdrawAmount(dev, propertyAddress)
	const tmp = cal.minus(share)
	return calculateWithdrawableAmount.plus(tmp.times(transitionalBlock))
}

// eslint-disable-next-line max-params
export async function getWithdrawHolderSplitAmount(
	dev: DevProtocolInstance,
	calculateWithdrawableAmount: BigNumber,
	property: PropertyInstance,
	user: string,
	transitionalBlock = 1
): Promise<BigNumber> {
	const [, share] = await getWithdrawAmount(dev, property.address)
	const totalSupply = await property.totalSupply().then(toBigNumber)
	const balance = await property.balanceOf(user).then(toBigNumber)
	const tmp = share.div(totalSupply).times(balance)
	return calculateWithdrawableAmount.plus(tmp.times(transitionalBlock))
}
