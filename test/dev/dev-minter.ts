import { DevProtocolInstance } from '../test-lib/instance'
import {
	DevInstance,
	AddressConfigInstance,
	DevMinterInstance,
} from '../../types/truffle-contracts'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('DevMinter', ([deployer, user1, user2, marketFactory, market]) => {
	const createDevInstance = async (): Promise<DevProtocolInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		return dev
	}

	const createDevInstanceNotAddMinter = async (): Promise<DevMinterInstance> => {
		const contract = artifacts.require

		const addressConfig = await contract('AddressConfig').new({
			from: deployer,
		})
		const dev = await contract('Dev').new(addressConfig.address, {
			from: deployer,
		})
		await addressConfig.setToken(dev.address, {
			from: deployer,
		})
		const devMinter = await contract('DevMinter').new(addressConfig.address, {
			from: deployer,
		})
		return devMinter
	}

	describe('mint', () => {
		it('mint', async () => {
			const dev = await createDevInstance()
			const before = await dev.dev.balanceOf(user1)
			expect(before.toString()).to.equal('0')
			await dev.devMinter.mint(user1, 100)
			const after = await dev.dev.balanceOf(user1)
			expect(after.toString()).to.equal('100')
		})

		it('not mint', async () => {
			const devMinter = await createDevInstanceNotAddMinter()
			const result = await devMinter.mint(user1, 100).catch((err: Error) => err)
			validateErrorMessage(
				result,
				'MinterRole: caller does not have the Minter role'
			)
		})
	})
})
