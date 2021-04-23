import {
	AddressConfigInstance,
	DevProtocolAccessInstance,
} from '../../../types/truffle-contracts'
import { validateErrorMessage } from '../../test-lib/utils/error'

contract('DevProtocolAccess', ([admin, operator, user1, dummy]) => {
	const getTestInstance = async (): Promise<
		[DevProtocolAccessInstance, AddressConfigInstance]
	> => {
		const addressConfig = await artifacts.require('AddressConfig').new()
		const devProtocolAccess = await artifacts
			.require('DevProtocolAccess')
			.new(addressConfig.address)
		await devProtocolAccess.addOperator(operator)
		return [devProtocolAccess, addressConfig]
	}

	const getAdminAndOperatorAddresses = (): string[] => {
		return [admin, operator]
	}

	describe('constructor', () => {
		it('it can get the set AddressConfig address.', async () => {
			const [devProtocolAccess, addressConfig] = await getTestInstance()
			const addressConfigAddress = await devProtocolAccess.addressConfig()
			expect(addressConfigAddress).to.be.equal(addressConfig.address)
		})
	})

	describe('constructor', () => {
		it('it can get the set AddressConfig address.', async () => {
			const [devProtocolAccess, addressConfig] = await getTestInstance()
			const addressConfigAddress = await devProtocolAccess.addressConfig()
			expect(addressConfigAddress).to.be.equal(addressConfig.address)
		})
	})

	describe('forceAttachPolicy', () => {
		describe('success', () => {
			it('we can set policy contract', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [devProtocolAccess, addressConfig] = await getTestInstance()
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
					await policyFactory.transferOwnership(devProtocolAccess.address)
					await policyGroup.transferOwnership(devProtocolAccess.address)
					await policyFactory.create(dip1.address)
					await policyFactory.create(dip7.address)
					expect(await addressConfig.policy()).to.be.equal(dip1.address)
					await devProtocolAccess.forceAttachPolicy(dip7.address, {
						from: executer,
					})
					expect(await addressConfig.policy()).to.be.equal(dip7.address)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
		describe('fail', () => {
			it('Cannot be executed if not authorized', async () => {
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
			it('we can grant mint privileges.', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [devProtocolAccess, addressConfig] = await getTestInstance()
					const dev = await artifacts.require('Dev').new(addressConfig.address)
					const devMinter = await artifacts
						.require('DevMinter')
						.new(addressConfig.address)
					const lockup = await artifacts
						.require('Lockup')
						.new(addressConfig.address, devMinter.address)
					await addressConfig.setToken(dev.address)
					await addressConfig.setLockup(lockup.address)
					await dev.addMinter(devProtocolAccess.address)
					let isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(false)
					await devProtocolAccess.addMinter({ from: executer })
					isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(true)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})

		describe('fail', () => {
			it('Cannot be executed if not authorized', async () => {
				const [devProtocolAccess] = await getTestInstance()
				const result = await devProtocolAccess
					.addMinter({ from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})
	describe('renounceMinter', () => {
		describe('success', () => {
			it('We can take away mint privileges.', async () => {
				const testFunc = async (executer: string): Promise<void> => {
					const [devProtocolAccess, addressConfig] = await getTestInstance()
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
					await dev.addMinter(devProtocolAccess.address)
					await devMinter.transferOwnership(devProtocolAccess.address)
					let isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(true)
					await devProtocolAccess.renounceMinter({ from: executer })
					isMinter = await dev.isMinter(devMinter.address)
					expect(isMinter).to.be.equal(false)
				}

				for await (const executer of getAdminAndOperatorAddresses()) {
					await testFunc(executer)
				}
			})
		})
		describe('fail', () => {
			it('Cannot be executed if not authorized', async () => {
				const [devProtocolAccess] = await getTestInstance()
				const result = await devProtocolAccess
					.renounceMinter({ from: user1 })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'does not have operator role')
			})
		})
	})
})
