/* eslint-disable no-unused-expressions */

contract('State', ([deployer, u1, u2]) => {
	const stateContract = artifacts.require('State')
	const repositoryContract = artifacts.require('Repository')

	describe('Roles; addOperator', () => {
		it('Add operators', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(u1, {from: deployer})
			const results = await contract.isOperator({from: u1})
			expect(results).to.be.equal(true)
		})

		it('Should fail to add operator when sent from the non-owner account', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract
				.addOperator(u1, {from: u2})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})
	})

	describe('Roles; isOperator', () => {
		it('Verifying the passed address is an operator address', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(u1, {from: deployer})
			const results = await contract.isOperator({from: u1})
			expect(results).to.be.equal(true)
		})

		it('Should fail to verify the passed address is an operator address when not exists in operators', async () => {
			const contract = await stateContract.new({from: deployer})
			const results = await contract.isOperator({from: u2})
			expect(results).to.be.equal(false)
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

	describe('Repository token; addRepository', () => {
		it('Add Repository Contract token address', async () => {
			const repository = await repositoryContract.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			const results = await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			expect(results).to.be.ok
		})

		it('Should fail to add Repository Contract token address when sent from the non-operator account', async () => {
			const repository = await repositoryContract.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await stateContract.new({from: deployer})
			const results = await contract
				.addRepository('pkg', repository.address, {from: deployer})
				.catch((err: Error) => err)
			expect(results).to.instanceOf(Error)
		})

		it('Should fail to add Repository Contract token address when the exists same package name', async () => {
			const repository = await repositoryContract.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await stateContract.new({from: deployer})
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
	})

	describe('Repository token; getRepository', () => {
		it('Get the repository address by package name', async () => {
			const repository = await repositoryContract.new(
				'pkg',
				'pkg_token',
				'PKG',
				18,
				10000,
				{
					from: deployer
				}
			)
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			await contract.addRepository('pkg', repository.address, {
				from: deployer
			})
			const results = await contract.getRepository('pkg')
			expect(results.toString()).to.be.equal(repository.address)
		})
	})

	describe('Repository token; isRepository', () => {
		it('Verifying the passed address is a Repository Contract address', async () => {
			const address = '0x111122223333444455556666777788889999aAaa'
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			await contract.addRepository('pkg', address, {
				from: deployer
			})
			const results = await contract.isRepository(address)
			expect(results).to.be.equal(true)
		})

		it('Should fail to verify the passed address is a Repository Contract address when not exists Repository Contract', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.addOperator(deployer, {from: deployer})
			await contract.addRepository(
				'pkg',
				'0x40da26927c9d53106c0ca47608a4fdadf1ab6d29',
				{
					from: deployer
				}
			)
			const results = await contract.isRepository(
				'0x111122223333444455556666777788889999aAaa'
			)
			expect(results).to.be.equal(false)
		})
	})

	describe('Distributor; getDistributor', () => {
		it('Get a Distributor Contract address', async () => {
			const contract = await stateContract.new({from: deployer})
			await contract.setDistributor(
				'0x111122223333444455556666777788889999aAaa',
				{from: deployer}
			)
			const result = await contract.getDistributor({from: deployer})
			expect(result).to.be.equal('0x111122223333444455556666777788889999aAaa')
		})
	})

	describe('Distributor; setDistributor', () => {
		it('Change a Distributor Contract address', async () => {
			const contract = await stateContract.new({from: deployer})

			const distributorAddress = await contract.getDistributor({
				from: deployer
			})

			expect(distributorAddress).to.be.equal(
				'0x0000000000000000000000000000000000000000'
			)

			await contract.setDistributor(
				'0x111122223333444455556666777788889999aAaa',
				{
					from: deployer
				}
			)

			const changedDistributorAddress = await contract.getDistributor({
				from: deployer
			})

			expect(changedDistributorAddress).to.be.equal(
				'0x111122223333444455556666777788889999aAaa'
			)
		})

		it('Should fail to change a Distributor Contract address when sent from the non-owner account', async () => {
			const contract = await stateContract.new({from: deployer})
			const result = await contract
				.setDistributor('0x111122223333444455556666777788889999aAaa', {
					from: u1
				})
				.catch((err: Error) => err)
			expect(result).to.instanceOf(Error)

			const distributorAddress = await contract.getDistributor({
				from: deployer
			})

			expect(distributorAddress).to.be.equal(
				'0x0000000000000000000000000000000000000000'
			)
		})
	})
})
