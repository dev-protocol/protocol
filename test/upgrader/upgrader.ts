import {
	AddressConfigInstance,
	UpgraderInstance,
	PatchPlaneInstance,
} from '../../types/truffle-contracts'
import { validateErrorMessage } from '../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../test-lib/const'

contract('Upgrader', ([admin, operator, user1, dummy]) => {
	const getUpgrader = async (): Promise<
		[UpgraderInstance, AddressConfigInstance]
	> => {
		const addressConfig = await artifacts.require('AddressConfig').new()
		const upgrader = await artifacts
			.require('Upgrader')
			.new(addressConfig.address)
		await upgrader.addOperator(operator)
		return [upgrader, addressConfig]
	}

	// Const getPatchSetUpgrader = async (): Promise<
	// 	[UpgraderInstance, AddressConfigInstance, PatchPlaneInstance]
	// > => {
	// 	const addressConfig = await artifacts.require('AddressConfig').new()
	// 	const upgrader = await artifacts
	// 		.require('Upgrader')
	// 		.new(addressConfig.address)
	// 	await upgrader.addOperator(operator)
	// 	const patch = await artifacts.require('PatchPlane').new(upgrader.address)
	// 	await upgrader.setPatch(patch.address)
	// 	return [upgrader, addressConfig, patch]
	// }

	describe('constructor', () => {
		it('it can get the set AddressConfig address.', async () => {
			const [upgrader, addressConfig] = await getUpgrader()
			const addressConfigAddress = await upgrader.addressConfig()
			expect(addressConfigAddress).to.be.equal(addressConfig.address)
		})
	})
	const getAdminAndOperatorAddresses = (): string[] => {
		return [admin, operator]
	}

	describe('setPatch', () => {
		describe('success', () => {
			it('patchコントラクトのアドレスをセットできる', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader] = await getUpgrader()
					const patch = await artifacts
						.require('PatchPlane')
						.new(upgrader.address)
					await upgrader.setPatch(patch.address, { from: executer })
					expect(await upgrader.patch()).to.be.equal(patch.address)
					expect(await upgrader.patchSetter()).to.be.equal(executer)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
		describe('fail', () => {
			it('adminかoperator権限がないとエラーになる', async () => {
				const [upgrader] = await getUpgrader()
				const result = await upgrader
					.setPatch(dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
			it('upgraderが違うとエラーになる', async () => {
				const [upgrader] = await getUpgrader()
				const patch = await artifacts.require('PatchPlane').new(dummy)

				const result = await upgrader
					.setPatch(patch.address, { from: operator })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'upgrader is different')
			})
		})
	})

	describe('forceAttachPolicy', () => {
		describe('success', () => {
			it('patchコントラクトのアドレスをセットできる', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader, addressConfig] = await getUpgrader()
					const policyFactory = await artifacts
						.require('PolicyFactory')
						.new(addressConfig.address)
					const policyGroup = await artifacts
						.require('PolicyGroup')
						.new(addressConfig.address)
					await policyGroup.createStorage()
					await addressConfig.setPolicyFactory(policyFactory.address)
					await addressConfig.setPolicyGroup(policyGroup.address)
					const dip1 = await artifacts
						.require('DIP1')
						.new(addressConfig.address)
					const dip7 = await artifacts
						.require('DIP7')
						.new(addressConfig.address)
					await policyFactory.transferOwnership(upgrader.address)
					await policyGroup.transferOwnership(upgrader.address)
					await policyFactory.create(dip1.address)
					await policyFactory.create(dip7.address)
					expect(await addressConfig.policy()).to.be.equal(dip1.address)
					await upgrader.forceAttachPolicy(dip7.address, { from: executer })
					expect(await addressConfig.policy()).to.be.equal(dip7.address)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
		describe('fail', () => {
			it('adminかoperator権限がないとエラーになる', async () => {
				const [upgrader] = await getUpgrader()
				const result = await upgrader
					.forceAttachPolicy(dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})

	describe('addUpgradeEvent', () => {
		describe('fail', () => {
			it('patchがないとエラーになる', async () => {
				const [upgrader] = await getUpgrader()
				const result = await upgrader
					.addUpgradeEvent('dummy', dummy, dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
	})

	describe('addMinter', () => {
		describe('success', () => {
			it.only('patchコントラクトのアドレスをセットできる', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader, addressConfig] = await getUpgrader()
					const dev = await artifacts.require('Dev').new(addressConfig.address)
					await addressConfig.setToken(dev.address)
					await dev.addMinter(upgrader.address)
					let isMinter = await dev.isMinter(dummy)
					expect(isMinter).to.be.equal(false)
					await upgrader.addMinter(dummy, { from: executer })
					isMinter = await dev.isMinter(dummy)
					expect(isMinter).to.be.equal(true)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
	})
})
