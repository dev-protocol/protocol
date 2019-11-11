/* eslint-disable no-unused-expressions */

contract('State', ([deployer, u1, u2]) => {
	const stateContract = artifacts.require('StateTest')
	const propertyContract = artifacts.require('Property')

	describe('Roles; addMarket', () => {
		it('Set Market Factory', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.setMarketFactory(u1, {from: deployer})
			const results = await contract.marketFactory({from: deployer})
			expect(results).to.be.equal(u1)
		})

		it('Should fail to set Market Factory when sent from the non-owner account', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract
				.setMarketFactory(u1, {from: u2})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Add market', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.setMarketFactory(u1, {from: deployer})
			await contract.addMarket(u2, {from: u1})
			const results = await contract.containsMarket(u2, {from: u1})
			expect(results).to.be.equal(true)
		})

		it('Should fail to add Market when sent from the non-Market Factory account', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract
				.addMarket(u1, {from: deployer})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Utility token; getToken', () => {
		it('Token default value is 0x98626E2C9231f03504273d55f397409deFD4a093.', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract.getToken({from: deployer})
			expect(results.toString()).to.be.equal(
				'0x98626E2C9231f03504273d55f397409deFD4a093'
			)
		})
	})

	describe('Utility token; setToken', () => {
		it('Change the value of the token address', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.setToken(u1, {from: deployer})
			const results = await contract.getToken({from: deployer})
			expect(results.toString()).to.be.equal(u1)
		})

		it('Should fail to change the utility token address when sent from the non-owner account', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract
				.setToken(u1, {from: u2})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Property token; addProperty', () => {
		it('Add Property Contract token address', async () => {
			const contract = await stateContract.new({from: deployer})
			// Use u1 address as dummy PropertyFactory's address
			await contract.setPropertyFactory(u1, {
				from: deployer
			})
			const property = await propertyContract.new(
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const results = await contract.addProperty(property.address, {
				from: u1
			})
			expect(results).to.be.ok
		})

		it('Should fail to add Property Contract token address when sent from the non-Property Factory Contract', async () => {
			const property = await propertyContract.new(
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await stateContract.new({from: deployer})
			await contract.setPropertyFactory(u1, {from: deployer})
			const results = await contract
				.addProperty(property.address, {from: property.address})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Property token; isProperty', () => {
		it('Verifying the passed address is a Property Contract address', async () => {
			const address = '0x111122223333444455556666777788889999aAaa'
			const contract = await stateContract.new({from: deployer})
			await contract.setPropertyFactory(u1, {
				from: deployer
			})
			await contract.addProperty(address, {
				from: u1
			})
			const results = await contract.isProperty(address)
			expect(results).to.be.equal(true)
		})

		it('Should fail to verify the passed address is a Property Contract address when not exists Property Contract', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.setPropertyFactory(u1, {
				from: deployer
			})
			await contract.addProperty('0x40da26927c9d53106c0ca47608a4fdadf1ab6d29', {
				from: u1
			})
			const results = await contract
				.isProperty('0x111122223333444455556666777788889999aAaa')
				.catch((err: Error) => err)
			expect(results).to.be.equal(false)
		})
	})

	describe('Allocator; setAllocator', () => {
		it('Change a Allocator Contract address', async () => {
			const contract = await stateContract.new({from: deployer})

			const allocatorAddress = await contract.allocator({
				from: deployer
			})

			expect(allocatorAddress).to.be.equal(
				'0x0000000000000000000000000000000000000000'
			)

			await contract.setAllocator(
				'0x111122223333444455556666777788889999aAaa',
				{
					from: deployer
				}
			)

			const changedAllocatorAddress = await contract.allocator({
				from: deployer
			})

			expect(changedAllocatorAddress).to.be.equal(
				'0x111122223333444455556666777788889999aAaa'
			)
		})

		it('Should fail to change a Allocator Contract address when sent from the non-owner account', async () => {
			const contract = await stateContract.new({from: deployer})
			const result = await contract
				.setAllocator('0x111122223333444455556666777788889999aAaa', {
					from: u1
				})
				.catch((err: Error) => err)
			expect(result).to.instanceOf(Error)

			const allocatorAddress = await contract.allocator({
				from: deployer
			})

			expect(allocatorAddress).to.be.equal(
				'0x0000000000000000000000000000000000000000'
			)
		})
	})

	describe('Metrics Contract; addMetrics', () => {
		it('Add Metrics Contract token address')

		it(
			'Should fail to add Metrics Contract address when sent from the non-Market Contract'
		)
	})

	describe('Metrics Contract; isMetrics', () => {
		it('Verifying the passed address is a Metrics Contract address')

		it(
			'Should fail to verify the passed address is a Metrics Contract address when not exists Metrics Contract'
		)
	})
})
