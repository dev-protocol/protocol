contract('StorageProxyTest', ([deployer]) => {
	const storageProxyContract = artifacts.require('storage/StorageProxy')
	describe('Property; withdrawDev', () => {
		let storageProxy: any
		beforeEach(async () => {
			storageProxy = await storageProxyContract.new({from: deployer})
		})
		it('New storage can be created', async () => {
			const result = await storageProxy.getStorage(
				// eslint-disable-next-line no-undef
				web3.utils.fromAscii('20160528')
			)
			console.log(result)
		})
		it('we can get existing storage', async () => {})
	})
})
