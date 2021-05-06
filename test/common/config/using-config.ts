import { DevProtocolInstance } from '../../test-lib/instance'

contract('UsingConfigTest', ([deployer]) => {
	const usingConfigContract = artifacts.require('UsingConfigTest')
	const dev = new DevProtocolInstance(deployer)
	before(async () => {
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
	})
	describe('UsingConfig; config', () => {
		it('You can get the address of config by setting it in the constructor.', async () => {
			const usingConfigTest = await usingConfigContract.new(
				dev.addressConfig.address,
				{ from: deployer }
			)
			const tokenAddress = await usingConfigTest.getToken()

			expect(tokenAddress).to.be.equal(await dev.addressConfig.token())
		})
	})
	describe('UsingConfig; configAddress', () => {
		it('You can get the address of config .', async () => {
			const usingConfigTest = await usingConfigContract.new(
				dev.addressConfig.address,
				{ from: deployer }
			)
			const configAddress = await usingConfigTest.configAddress()

			expect(configAddress).to.be.equal(dev.addressConfig.address)
		})
	})
})
