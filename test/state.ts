/* eslint-disable no-unused-expressions */
const state = artifacts.require('State')
const repositoryContractState = artifacts.require('Repository')

contract('State', ([deployer, u1, u2]) => {
	describe('Roles', () => {
		it('Add operators', async () => {
			const contract = await state.new({from: deployer})
			await contract.addOperator(u1, {from: deployer})
			const results = await contract.isOperator({from: u1})
			expect(results).to.be.equal(true)
		})

		it('Should fail to add operator when sent from the non-owner account', async () => {
			const contract = await state.new({from: deployer})
			const results = await contract
				.addOperator(u1, {from: u2})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Utility token', () => {
		it('Token default value is 0x98626E2C9231f03504273d55f397409deFD4a093.', async () => {
			const contract = await state.new({from: deployer})
			const results = await contract.getToken({from: deployer})
			expect(results.toString()).to.be.equal(
				'0x98626E2C9231f03504273d55f397409deFD4a093'
			)
		})

		it('Change the value of the token address', async () => {
			const contract = await state.new({from: deployer})
			await contract.setToken(u1, {from: deployer})
			const results = await contract.getToken({from: deployer})
			expect(results.toString()).to.be.equal(u1)
		})

		it('Should fail to change the utility token address when sent from the non-owner account', async () => {
			const contract = await state.new({from: deployer})
			const results = await contract
				.setToken(u1, {from: u2})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Repository token', () => {
		it('Add Repository Contract token address', async () => {
			const repository = await repositoryContractState.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await state.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			const results = await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			expect(results).to.be.ok
		})

		it('Should fail to add Repository Contract token address when sent from the non-operator account', async () => {
			const repository = await repositoryContractState.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await state.new({from: deployer})
			const results = await contract
				.addRepository('pkg', repository.address, {from: deployer})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Should fail to add Repository Contract token address when the exists same package name', async () => {
			const repository = await repositoryContractState.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await state.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await contract
				.addRepository('pkg', repository.address, {
					from: deployer
				})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Get the repository address by package name', async () => {
			const repository = await repositoryContractState.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await state.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await contract.getRepository('pkg')
			expect(results.toString()).to.be.equal(repository.address)
		})

		it('Verifying the passed address is a Repository Contract address')

		it(
			'Should fail to verify the passed address is a Repository Contract address when not exists Repository Contract'
		)
	})

	describe('Distributor', () => {
		it('Change a Distributor Contract address')

		it('Get a Distributor Contract address')

		it(
			'Should fail to change a Distributor Contract address when sent from the non-owner account'
		)
	})
})
