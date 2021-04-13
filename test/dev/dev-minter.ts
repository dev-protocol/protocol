import { DevProtocolInstance } from '../test-lib/instance'
import { DevMinterInstance } from '../../types/truffle-contracts'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('DevMinter', ([deployer, user1, lockup, withdraw]) => {
	const createDevInstance = async (): Promise<DevProtocolInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		await dev.addressConfig.setLockup(lockup)
		await dev.addressConfig.setWithdraw(withdraw)
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
		await addressConfig.setLockup(lockup, {
			from: deployer,
		})
		await addressConfig.setWithdraw(withdraw, {
			from: deployer,
		})
		return devMinter
	}

	describe('mint', () => {
		describe('success', () => {
			it('If DevMinter has minter privileges, it can mint Dev tokens.(Lockup)', async () => {
				const dev = await createDevInstance()
				const before = await dev.dev.balanceOf(user1)
				expect(before.toString()).to.equal('0')
				await dev.devMinter.mint(user1, 100, { from: lockup })
				const after = await dev.dev.balanceOf(user1)
				expect(after.toString()).to.equal('100')
			})
			it('If DevMinter has minter privileges, it can mint Dev tokens.(withdraw)', async () => {
				const dev = await createDevInstance()
				const before = await dev.dev.balanceOf(user1)
				expect(before.toString()).to.equal('0')
				await dev.devMinter.mint(user1, 100, { from: withdraw })
				const after = await dev.dev.balanceOf(user1)
				expect(after.toString()).to.equal('100')
			})
		})
		describe('fail', () => {
			it('If DevMinter does not has minter privileges, it can not mint Dev tokens', async () => {
				const devMinter = await createDevInstanceNotAddMinter()
				const result = await devMinter
					.mint(user1, 100, { from: withdraw })
					.catch((err: Error) => err)
				validateErrorMessage(
					result,
					'MinterRole: caller does not have the Minter role'
				)
			})
			it('Cannot mint Dev token when DevMinter is in pause, even if DevMinter has minter privilege.', async () => {
				const dev = await createDevInstance()
				await dev.devMinter.pause()
				const result = await dev.devMinter
					.mint(user1, 100, { from: withdraw })
					.catch((err: Error) => err)
				validateErrorMessage(result, 'Pausable: paused')
			})
			it('Error when minting from other than Lockup and Withdraw contracts', async () => {
				const dev = await createDevInstance()
				const result = await dev.devMinter
					.mint(user1, 100)
					.catch((err: Error) => err)
				validateErrorMessage(result, 'illegal access')
			})
		})
	})
})
