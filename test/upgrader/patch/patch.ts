/* eslint-disable max-nested-callbacks */
import { AddressConfigInstance } from '../../../types/truffle-contracts'
import { validateErrorMessage } from '../../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../../test-lib/const'

contract('Patch', ([deployer, upgrader]) => {
	describe('constructor', () => {
		it('セットしたupgraderが取得できる', async () => {
			const patch = await artifacts.require('PatchPlane').new(upgrader)
			const upgraderAddress = await patch.upgrader()
			expect(upgraderAddress).to.be.equal(upgrader)
		})
	})

	describe('setConfigAddress', () => {
		describe('success', () => {
			it('セットしたconfigアドレスが取得できる.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				const addressConfig = await artifacts.require('AddressConfig').new()
				expect(await patch.config()).to.be.equal(DEFAULT_ADDRESS)
				await patch.setConfigAddress(addressConfig.address, { from: upgrader })
				expect(await patch.config()).to.be.equal(addressConfig.address)
			})
		})
		describe('fail', () => {
			it('upgrader以外からはセットできない.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				const result = await patch
					.setConfigAddress(DEFAULT_ADDRESS)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
			it('pauseされていたらセットできない.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				await patch.pause()
				const result = await patch
					.setConfigAddress(DEFAULT_ADDRESS, { from: upgrader })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'Pausable: paused')
			})
		})
	})

	describe('afterRun', () => {
		describe('success', () => {
			it('addressConfigのオーナーをupgraderにセットできる.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				const addressConfig = await artifacts.require('AddressConfig').new()
				await addressConfig.transferOwnership(patch.address)
				await patch.setConfigAddress(addressConfig.address, { from: upgrader })
				expect(await addressConfig.owner()).to.be.equal(patch.address)
				await patch.afterRun({ from: upgrader })
				expect(await addressConfig.owner()).to.be.equal(upgrader)
			})
		})
		describe('fail', () => {
			it('upgrader以外からはセットできない.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				const result = await patch.afterRun().catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
			it('pauseされていたらセットできない.', async () => {
				const patch = await artifacts.require('PatchPlane').new(upgrader)
				await patch.pause()
				const result = await patch
					.afterRun({ from: upgrader })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'Pausable: paused')
			})
		})
	})
})

contract('PatchAllocator', ([deployer, operator, current]) => {
	const getUpgraderEvent = async (
		addressConfig: AddressConfigInstance,
		patchName: string
	): Promise<any> => {
		const upgrader = await artifacts
			.require('Upgrader')
			.new(addressConfig.address)
		await upgrader.addOperator(operator)
		await addressConfig.transferOwnership(upgrader.address)
		const patch = await artifacts.require(patchName).new(upgrader.address)
		await upgrader.setPatch(patch.address)
		const tx = await upgrader.execute({ from: operator })
		const eventArgs = tx.logs.filter((log: Truffle.TransactionLog) => {
			return log.event === 'Upgrade'
		})[0].args
		return eventArgs
	}

	describe.only('afterDeploy', () => {
		it('Allocatorが更新される', async () => {
			const addressConfig = await artifacts.require('AddressConfig').new()
			await addressConfig.setAllocator(current)

			const eventArgs = await getUpgraderEvent(addressConfig, 'PatchAllocator')

			const next = await addressConfig.allocator()
			expect(next).to.be.not.equal(current)
			expect(eventArgs._name).to.be.equal('Allocator')
			expect(eventArgs._current).to.be.equal(current)
			expect(eventArgs._next).to.be.equal(next)
		})

		it('MarketFactoryが更新される', async () => {
			const addressConfig = await artifacts.require('AddressConfig').new()
			await addressConfig.setMarketFactory(current)

			const eventArgs = await getUpgraderEvent(
				addressConfig,
				'PatchMarketFactory'
			)

			const next = await addressConfig.marketFactory()
			expect(next).to.be.not.equal(current)
			expect(eventArgs._name).to.be.equal('MarketFactory')
			expect(eventArgs._current).to.be.equal(current)
			expect(eventArgs._next).to.be.equal(next)
		})

		it('MetricsFactoryが更新される', async () => {
			const addressConfig = await artifacts.require('AddressConfig').new()
			await addressConfig.setMetricsFactory(current)

			const eventArgs = await getUpgraderEvent(
				addressConfig,
				'PatchMetricsFactory'
			)

			const next = await addressConfig.metricsFactory()
			expect(next).to.be.not.equal(current)
			expect(eventArgs._name).to.be.equal('MetricsFactory')
			expect(eventArgs._current).to.be.equal(current)
			expect(eventArgs._next).to.be.equal(next)
		})

		it('PropertyFactoryが更新される', async () => {
			const addressConfig = await artifacts.require('AddressConfig').new()
			await addressConfig.setPropertyFactory(current)

			const eventArgs = await getUpgraderEvent(
				addressConfig,
				'PatchPropertyFactory'
			)

			const next = await addressConfig.propertyFactory()
			expect(next).to.be.not.equal(current)
			expect(eventArgs._name).to.be.equal('PropertyFactory')
			expect(eventArgs._current).to.be.equal(current)
			expect(eventArgs._next).to.be.equal(next)
		})

		it('Withdrawが更新される', async () => {
			const addressConfig = await artifacts.require('AddressConfig').new()
			const ownerbleContract = await artifacts.require('OwnerbleContract').new()
			await addressConfig.setWithdraw(ownerbleContract.address)

			const eventArgs = await getUpgraderEvent(addressConfig, 'PatchWithdraw')

			const next = await addressConfig.withdraw()
			expect(next).to.be.not.equal(current)
			expect(eventArgs._name).to.be.equal('Withdraw')
			expect(eventArgs._current).to.be.equal(current)
			expect(eventArgs._next).to.be.equal(next)
		})
	})
})
