contract('UtilsTest', ([deployer]) => {
	const addressUintMapContract = artifacts.require('libs/AddressUintMap')
	describe('AddressUintMapTest', () => {
		var addressUintMap: any
		beforeEach(async () => {
			addressUintMap = await addressUintMapContract.new({from: deployer})
			await addressUintMap.add(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d',
				5,
				{from: deployer}
			)
			await addressUintMap.add(
				'0x32a5598b078ad20287f210803a6ad5d96c8df1d1',
				10,
				{from: deployer}
			)
			await addressUintMap.add(
				'0xde7Ed038ce61505803280f514caa75E34EC3719e',
				15,
				{from: deployer}
			)
		})
		it('get', async () => {
			let value = await addressUintMap.get(
				'0xA717AA5E8858cA5836Fef082E6B2965ba0dB615d'
			)
			expect(value.toNumber()).to.be.equal(5)
			value = await addressUintMap.get(
				'0x32a5598b078ad20287f210803a6ad5d96c8df1d1'
			)
			expect(value.toNumber()).to.be.equal(10)
			value = await addressUintMap.get(
				'0xbce7C94B9Ac44f0B6Ea02E506c0F70Eb8f1EaF2C'
			)
			expect(value.toNumber()).to.be.equal(0)
		})
		it('getSumAllValue', async () => {
			let value = await addressUintMap.getSumAllValue()
			expect(value.toNumber()).to.be.equal(30)
			const addressUintMap2 = await addressUintMapContract.new({from: deployer})
			value = await addressUintMap2.getSumAllValue()
			expect(value.toNumber()).to.be.equal(0)
		})
	})
})
