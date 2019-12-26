contract('Dev', ([deployer, user1, user2]) => {
	const devContract = artifacts.require('Dev')
	const addressConfigContract = artifacts.require('AddressConfig')
	describe('Dev; detail', () => {
		it('the name is Dev', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			expect(await dev.name()).to.equal('Dev')
		})

		it('the symbol is DEV', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			expect(await dev.symbol()).to.equal('DEV')
		})

		it('the decimals is 18', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			expect((await dev.decimals()).toNumber()).to.equal(18)
		})
	})
	describe('Dev; mint', () => {
		it('the initial balance is 0', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			expect((await dev.totalSupply()).toNumber()).to.equal(0)
		})
		it('increase the balance by running the mint', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
		})
		it('fail to run mint when sent from other than minter', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			await dev.mint(deployer, 100, {from: user1}).catch((err: Error) => err)
			expect((await dev.totalSupply()).toNumber()).to.equal(0)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(0)
		})
		it('if the sender is minter, can add a new minter by addMinter', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			await dev.addMinter(user1)
			expect(await dev.isMinter(user1)).to.equal(true)

			await dev.addMinter(user2, {from: user1})
			expect(await dev.isMinter(user2)).to.equal(true)
		})
		it('renounce minter by running renounceMinter', async () => {
			const addressConfig = await addressConfigContract.new({from: deployer})
			const dev = await devContract.new(addressConfig.address)
			await dev.addMinter(user1)
			expect(await dev.isMinter(user1)).to.equal(true)
			await dev.renounceMinter({from: user1})
			expect(await dev.isMinter(user1)).to.equal(false)
		})
	})
})
