import {DevProtocolInstance} from '../../test-lib/instance'

contract('UsingConfigTest', ([deployer]) => {
	const usingConfigContract = artifacts.require('UsingConfigTest')
	const dev = new DevProtocolInstance(deployer)
	before(async () => {
		await dev.generateAddressConfig()
	})
	describe('UsingConfig; config', () => {
		it('You can get the address of config by setting it in the constructor.', async () => {
			const usingConfigTest = await usingConfigContract.new(
				dev.addressConfig.address,
				{from: deployer}
			)
			const config = await usingConfigTest.getConfig()

			expect(config).to.be.equal(dev.addressConfig.address)
		})
	})
})
