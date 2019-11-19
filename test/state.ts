/* eslint-disable no-unused-expressions */

contract('State', ([deployer, u1, u2]) => {
	const stateContract = artifacts.require('State')

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
})
