contract('AddressConfigTest', ([deployer]) => {
	const addressConfigTestContract = artifacts.require('config/AddressConfig')
	describe('get/set', () => {
		it('allocator', async () => {
			const addressConfigTest = await addressConfigTestContract.new({
				from: deployer
			})
			await addressConfigTest.setAllocator(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			const addresss = await addressConfigTest.allocator()
			expect(addresss).to.be.equal('0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d')
		})
	})
})
