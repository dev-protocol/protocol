// tslint:disable:no-unsafe-any
// tslint:disable:no-unused-expression
const state = artifacts.require('State')
const repositoryContractState = artifacts.require('Repository')

contract('State', ([deployer, u1, u2]) => {
	describe('Roles', () => {
		it('Add operators', async () => {
			const contract = await state.new({ from: deployer })
			await contract.addOperator(u1, { from: deployer })
			const results = await contract.isOperator({ from: u1 })
			expect(results).to.be.equal(true)
		})

		it('Should fail to add operator from a non-owner account', async () => {
			const contract = await state.new({ from: deployer })
			const results = await contract
				.addOperator(u1, { from: u2 })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Add distributor')

		it('Should fail to add distributor from a non-operator account')
	})

	describe('Utility token', () => {
		it('Token default value is 0x98626E2C9231f03504273d55f397409deFD4a093.', async () => {
			const contract = await state.new({ from: deployer })
			const results = await contract.getToken({ from: deployer })
			expect(results.toString()).to.be.equal(
				'0x98626E2C9231f03504273d55f397409deFD4a093'
			)
		})

		it('Change the utility token address', async () => {
			const contract = await state.new({ from: deployer })
			await contract.setToken(u1, { from: deployer })
			const results = await contract.getToken({ from: deployer })
			expect(results.toString()).to.be.equal(u1)
		})

		it('Should fail to change the utility token address from a non-owner account', async () => {
			const contract = await state.new({ from: deployer })
			const results = await contract
				.setToken(u1, { from: u2 })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Repository token', () => {
		it('Add repository token address', async () => {
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
			const contract = await state.new({ from: deployer })
			await contract.addOperator(deployer, { from: deployer })
			const results = await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			expect(results).to.be.ok
		})

		it('Fail to add repository token address from a non-operator account', async () => {
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
			const contract = await state.new({ from: deployer })
			const results = await contract
				.addRepository('pkg', repository.address, { from: deployer })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Fail to add repository token address when the exists same repository', async () => {
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
			const contract = await state.new({ from: deployer })
			await contract.addOperator(deployer, { from: deployer })
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
			const contract = await state.new({ from: deployer })
			await contract.addOperator(deployer, { from: deployer })
			await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await contract.getRepository('pkg')
			expect(results.toString()).to.be.equal(repository.address)
		})

		it('Get all repositories address', async () => {
			const a = await repositoryContractState.new('a', 'a', 'PKGA', 18, 10000, {
				from: deployer
			})
			const b = await repositoryContractState.new('b', 'b', 'PKGB', 18, 10000, {
				from: deployer
			})
			const c = await repositoryContractState.new('c', 'c', 'PKGC', 18, 10000, {
				from: deployer
			})
			const contract = await state.new({ from: deployer })
			await contract.addOperator(deployer, { from: deployer })
			await contract.addRepository('a', a.address, {
				from: deployer
			})
			await contract.addRepository('b', b.address, {
				from: deployer
			})
			await contract.addRepository('c', c.address, {
				from: deployer
			})
			const results = await contract.getRepositories({
				from: deployer
			})
			expect(results).to.be.deep.equal([a.address, b.address, c.address])
		})
	})

	describe('Validating distributors', () => {
		it('Valid distributor address')

		it('Should returns false when invalid distributor address')
	})
})
