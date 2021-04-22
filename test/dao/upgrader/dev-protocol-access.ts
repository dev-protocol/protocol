import {
	AddressConfigInstance,
	DevProtocolAccessInstance,
} from '../../../types/truffle-contracts'
import { validateErrorMessage } from '../../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../../test-lib/const'

contract('DevProtocolAccess', ([admin, operator, user1, dummy]) => {
	const getTestInstance = async (): Promise<
		[DevProtocolAccessInstance, AddressConfigInstance]
	> => {
		const addressConfig = await artifacts.require('AddressConfig').new()
		const upgrader = await artifacts
			.require('DevProtocolAccess')
			.new(addressConfig.address)
		await upgrader.addOperator(operator)
		return [upgrader, addressConfig]
	}

	const getAdminAndOperatorAddresses = (): string[] => {
		return [admin, operator]
	}

	describe('constructor', () => {
		it('it can get the set AddressConfig address.', async () => {
			const [upgrader, addressConfig] = await getTestInstance()
			const addressConfigAddress = await upgrader.addressConfig()
			expect(addressConfigAddress).to.be.equal(addressConfig.address)
		})
	})

	describe('constructor', () => {
		it('it can get the set AddressConfig address.', async () => {
			const [upgrader, addressConfig] = await getTestInstance()
			const addressConfigAddress = await upgrader.addressConfig()
			expect(addressConfigAddress).to.be.equal(addressConfig.address)
		})
	})

	describe('forceAttachPolicy', () => {
		describe('success', () => {
			it('policyをセットできる', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader, addressConfig] = await getTestInstance()
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
			it('できない', async () => {
				const [upgrader] = await getTestInstance()
				const result = await upgrader
					.forceAttachPolicy(dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})

	describe('addMinter', () => {
		describe('success', () => {
			it('minterに慣れる', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader, addressConfig] = await getTestInstance()
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

		describe('fail', () => {
			it('できない', async () => {
				const [upgrader] = await getTestInstance()
				const result = await upgrader
					.addMinter(dummy, { from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})
	describe('renounceMinter', () => {
		describe('success', () => {
			it('minterでなくす', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [upgrader, addressConfig] = await getTestInstance()
					const dev = await artifacts.require('Dev').new(addressConfig.address)
					const devMinter = await artifacts
						.require('DevMinter')
						.new(addressConfig.address)
					const lockup = await artifacts
						.require('Lockup')
						.new(addressConfig.address, devMinter.address)
					await dev.addMinter(devMinter.address)
					await addressConfig.setToken(dev.address)
					await addressConfig.setLockup(lockup.address)
					await dev.addMinter(upgrader.address)
					let isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(true)
					await upgrader.renounceMinter({ from: executer })
					isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(false)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
		describe('fail', () => {
			it('できない', async () => {
				const [upgrader] = await getTestInstance()
				const result = await upgrader
					.renounceMinter({ from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})
})
