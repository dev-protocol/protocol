// tslint:disable:no-unsafe-any
// tslint:disable:no-unused-expression
const state = artifacts.require('State')
const securityContract = artifacts.require('Security')

contract('State', ([deployer, u1, u2]) => {
	describe('Roles', () => {
		it('Add operators', async () => {
			const contract = await state.new({ from: deployer })
			await contract.addOperator(u1, { from: deployer })
			const results = await contract.isOperator(u1, { from: deployer })
			expect(results).to.be.equal(true)
		})

		it('Fail to add operator from a non-owner account', async () => {
			const contract = await state.new({ from: deployer })
			const results = await contract
				.addOperator(u1, { from: u2 })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
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

		it('Fail to change the utility token address from a non-owner account', async () => {
			const contract = await state.new({ from: deployer })
			const results = await contract
				.setToken(u1, { from: u2 })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Security token', () => {
		it('Add security token address', async () => {
			const security = await securityContract.new(
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
			const results = await contract.addSecurity('pkg', security.address, {
				from: deployer
			})
			expect(results).to.be.ok
		})

		it('Fail to add security token address from a non-operator account', async () => {
			const security = await securityContract.new(
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
				.addSecurity('pkg', security.address, { from: deployer })
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Fail to add security token address when the exists same security', async () => {
			const security = await securityContract.new(
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
			await contract.addSecurity('pkg', security.address, { from: deployer })
			const results = await contract
				.addSecurity('pkg', security.address, {
					from: deployer
				})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Get the security address by package name', async () => {
			const security = await securityContract.new(
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
			await contract.addSecurity('pkg', security.address, { from: deployer })
			const results = await contract.getSecurity('pkg')
			expect(results.toString()).to.be.equal(security.address)
		})

		it('Get all securities address', async () => {
			const a = await securityContract.new('a', 'a', 'PKGA', 18, 10000, {
				from: deployer
			})
			const b = await securityContract.new('b', 'b', 'PKGB', 18, 10000, {
				from: deployer
			})
			const c = await securityContract.new('c', 'c', 'PKGC', 18, 10000, {
				from: deployer
			})
			const contract = await state.new({ from: deployer })
			await contract.addOperator(deployer, { from: deployer })
			await contract.addSecurity('a', a.address, {
				from: deployer
			})
			await contract.addSecurity('b', b.address, {
				from: deployer
			})
			await contract.addSecurity('c', c.address, {
				from: deployer
			})
			const results = await contract.getSecurities({
				from: deployer
			})
			expect(results).to.be.deep.equal([a.address, b.address, c.address])
		})
	})

	describe('Balance', () => {
		it('Get the utility tokens balance of all holders from a security address.')
	})
})
