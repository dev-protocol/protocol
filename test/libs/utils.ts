contract('UtilsTest', ([key1, key2, key3, key4]) => {
	const addressUintMapContract = artifacts.require('libs/AddressUintMap2')
	describe('AddressUintMap2; add,get', () => {
		let addressUintMap: any
		beforeEach(async () => {
			addressUintMap = await addressUintMapContract.new()
			await addressUintMap.add(key1, 5)
			await addressUintMap.add(key2, 10)
			await addressUintMap.add(key3, 15)
		})
		it('The set value is taken', async () => {
			let value = await addressUintMap.get(key1)
			expect(value.toNumber()).to.be.equal(5)
			value = await addressUintMap.get(key2)
			expect(value.toNumber()).to.be.equal(10)
		})
		it('If not set, value cannot be obtained', async () => {
			const value = await addressUintMap.get(key4)
			expect(value.toNumber()).to.be.equal(0)
		})
	})
	describe('AddressUintMap2; getSumAllValue', () => {
		let addressUintMap: any
		beforeEach(async () => {
			addressUintMap = await addressUintMapContract.new()
			await addressUintMap.add(key1, 5)
			await addressUintMap.add(key2, 10)
			await addressUintMap.add(key3, 15)
		})
		it('Total value can be acquired', async () => {
			const value = await addressUintMap.getSumAllValue()
			expect(value.toNumber()).to.be.equal(30)
		})
		it('If not set, the value will be 0', async () => {
			const addressUintMap2 = await addressUintMapContract.new()
			const value = await addressUintMap2.getSumAllValue()
			expect(value.toNumber()).to.be.equal(0)
		})
	})
})
