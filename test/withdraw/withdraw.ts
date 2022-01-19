
import { init } from './withdraw-common'
import { DevProtocolInstance } from '../test-lib/instance'
import {
	MetricsInstance,
	PropertyInstance,
	IPolicyInstance,
	MarketInstance,
} from '../../types/truffle-contracts'
import BigNumber from 'bignumber.js'
import {
	mine,
	toBigNumber,
	getBlock,
	splitValue,
} from '../test-lib/utils/common'
import {
	getWithdrawHolderAmount,
	getWithdrawHolderSplitAmount,
} from '../test-lib/utils/mint-amount'
import { getPropertyAddress, getMarketAddress } from '../test-lib/utils/log'
import { SHARE_OF_TREASURY } from '../test-lib/const'
import { getEventValue } from '../test-lib/utils/event'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'
import {
	validateErrorMessage,
	validateAddressErrorMessage,
} from '../test-lib/utils/error'

contract('WithdrawTest', ([deployer, user1, user2, user3, user4]) => {
    let dev: DevProtocolInstance
	let property: PropertyInstance
	let snapshot: Snapshot
	let snapshotId: string

	before(async () => {
		;[dev, ,property] = await init(deployer, user3)
	})

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('Withdraw; withdraw', () => {
        it('should fail to call when passed address is not property contract', async () => {
			const res = await dev.withdraw
				.withdraw(deployer)
				.catch((err: Error) => err)
			validateAddressErrorMessage(res)
		})
		it(`should fail to call when hasn't withdrawable amount`, async () => {
			const res = await dev.withdraw
				.withdraw(property.address, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(res, 'withdraw value is 0')
		})
	})
	describe('Withdraw; devMinter', () => {
		it('get the address of the DevMinter contract.', async () => {
			const devMinterAddress = await dev.withdraw.devMinter()
			expect(devMinterAddress).to.be.equal(dev.devMinter.address)
		})
	})
})
