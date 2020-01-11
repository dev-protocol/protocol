contract('LockupTest', ([deployer, propertyFactory, property, devToken]) => {
	const addressConfigContract = artifacts.require('AddressConfig')
	const lockupContract = artifacts.require('Lockup')
	const lockupStorageContract = artifacts.require('LockupStorage')
	const propertyGroupContract = artifacts.require('PropertyGroup')
	const decimalsLibrary = artifacts.require('Decimals')
	describe('Lockup; cancel', () => {
		// TODO
	})
	describe('Lockup; lockup', () => {
		it('address is not property contract')
		it('lockup is already canceled')
		it('insufficient balance')
		it('transfer was failed')
		it('success', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const propertyGroup = await propertyGroupContract.new(
				addressConfig.address,
				{from: deployer}
			)
			await propertyGroup.createStorage()
			await addressConfig.setPropertyGroup(propertyGroup.address)
			await addressConfig.setPropertyFactory(propertyFactory)
			await propertyGroup.addGroup(property, {from: propertyFactory})
			const lockupStorage = await lockupStorageContract.new(
				addressConfig.address,
				{from: deployer}
			)
			await lockupStorage.createStorage()
			await addressConfig.setLockupStorage(lockupStorage.address)
			await addressConfig.setToken(devToken, {from: deployer})
			const decimals = await decimalsLibrary.new({from: deployer})
			await lockupContract.link('Decimals', decimals.address)
			const lockup = await lockupContract.new(addressConfig.address, {
				from: deployer
			})
			await addressConfig.setLockup(lockup.address, {from: deployer})
			await lockup.lockup(deployer, property, 100, {from: devToken})
			// eslint-disable-next-line no-warning-comments
			// TODO assert
		})
	})
	describe('Lockup; withdraw', () => {
		it('address is not property contract')
		it('lockup is not canceled')
		it('waiting for release')
		it('dev token is not locked')
		it('success')
	})
	describe('Lockup: withdrawInterest', () => {
		it(`mints 0 DEV when sender's lockup is 0 DEV`)
		describe('scenario: single lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(
				`withdrawInterestmints mints ${(1000000 * 500) /
					(500 + 1000)} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
		describe('scenario: multiple lockup', () => {
			// Should use the same Lockup instance each tests because this is a series of scenarios.
			it(`the sender locks up 500 DEV when the property's total lockup is 1000`)
			it(`the property increments interest 1000000`)
			it(`the sender locks up 800 DEV`)
			it(`the property increments interest 2000000`)
			it(
				`withdrawInterestmints mints ${(() => {
					const firstPrice = 1000000 / (500 + 1000)
					const secondPrice = 2000000 / (800 + 500 + 1000)
					return firstPrice * 500 + (secondPrice - firstPrice) * 800
				})()} DEV to the sender`
			)
			it(`mints 0 DEV when after the withdrawal`)
		})
	})
})
