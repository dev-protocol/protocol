contract('Reposiory', ([deployer]) => {
	const repositoryContract = artifacts.require('Repository')

	describe('getPackage', () => {
		it('Get a mapped package name', async () => {
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
			const results = await repository.package()
			expect(results.toString()).to.be.equal('pkg')
		})
	})

	describe('transfer', () => {
		it(
			"Execute the Distributor Contract's 'beforeBalanceChange' function before the 'transfer' function changes the balance"
		)
	})
})
