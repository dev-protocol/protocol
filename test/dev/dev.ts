import { DevProtocolInstance } from '../test-lib/instance'
import { DevInstance } from '../../types/truffle-contracts'
import { validateErrorMessage } from '../test-lib/utils/error'

contract('Dev', ([deployer, user1, user2, marketFactory, market]) => {
	const createDev = async (): Promise<DevInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		return dev.dev
	}

	describe('Dev; detail', () => {
		it('the name is Dev', async () => {
			const dev = await createDev()
			expect(await dev.name()).to.equal('Dev')
		})

		it('the symbol is DEV', async () => {
			const dev = await createDev()
			expect(await dev.symbol()).to.equal('DEV')
		})

		it('the decimals is 18', async () => {
			const dev = await createDev()
			expect((await dev.decimals()).toNumber()).to.equal(18)
		})
	})
	describe('Dev; mint', () => {
		it('the initial balance is 0', async () => {
			const dev = await createDev()
			expect((await dev.totalSupply()).toNumber()).to.equal(0)
		})
		it('increase the balance by running the mint', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
		})
		it('running with 0', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			await dev.mint(deployer, 0)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
		})
		it('should fail to run mint when sent from other than minter', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100, { from: user1 }).catch((err: Error) => err)
			expect((await dev.totalSupply()).toNumber()).to.equal(0)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(0)
		})
		it('if the sender is minter, can add a new minter by addMinter', async () => {
			const dev = await createDev()
			await dev.addMinter(user1)
			expect(await dev.isMinter(user1)).to.equal(true)

			await dev.addMinter(user2, { from: user1 })
			expect(await dev.isMinter(user2)).to.equal(true)
		})
		it('renounce minter by running renounceMinter', async () => {
			const dev = await createDev()
			await dev.addMinter(user1)
			expect(await dev.isMinter(user1)).to.equal(true)
			await dev.renounceMinter({ from: user1 })
			expect(await dev.isMinter(user1)).to.equal(false)
		})
	})
	describe('Dev; burn', () => {
		it('decrease the balance by running the burn', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			await dev.burn(50)
			expect((await dev.totalSupply()).toNumber()).to.equal(50)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(50)
		})
		it('running with 0', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			await dev.burn(0)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
		})
		it('should fail to decrease the balance when sent from no balance account', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			const res = await dev.burn(50, { from: user1 }).catch((err: Error) => err)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect(res).to.be.an.instanceof(Error)
		})
		it('decrease the balance by running the burnFrom from another account after approved', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			await dev.approve(user1, 50)
			await dev.burnFrom(deployer, 50, { from: user1 })
			expect((await dev.totalSupply()).toNumber()).to.equal(50)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(50)
		})
		it('should fail to if over decrease the balance by running the burnFrom from another account after approved', async () => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)

			await dev.approve(user1, 50)
			const res = await dev
				.burnFrom(deployer, 51, { from: user1 })
				.catch((err: Error) => err)
			expect((await dev.totalSupply()).toNumber()).to.equal(100)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect(res).to.be.an.instanceof(Error)
		})
	})
	describe('Dev; transfer', () => {
		const createMintedDev = async (): Promise<DevInstance> => {
			const dev = await createDev()
			await dev.mint(deployer, 100)
			return dev
		}

		it('transfer token from user-to-user', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.transfer(user1, 50)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(50)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(50)
		})
		it('transfer 0 tokens from user-to-user', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.transfer(user1, 0)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)
		})
		it('should fail to transfer token when sent from no balance account', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(0)

			const res = await dev
				.transfer(user2, 50, { from: user1 })
				.catch((err: Error) => err)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
		it('should fail to transfer token when sent from an insufficient balance account', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			const res = await dev.transfer(user1, 101).catch((err: Error) => err)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
		it('transfer token from user-to-user by running the transferFrom from another account after approved', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.approve(user1, 50)
			await dev.transferFrom(deployer, user2, 50, { from: user1 })
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(50)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(50)
		})
		it('should fail to transfer token from user-to-user when running the transferFrom of over than approved amount from another account after approved', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.approve(user1, 50)
			const res = await dev
				.transferFrom(deployer, user2, 51, { from: user1 })
				.catch((err: Error) => err)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
		it('increase the approved amount after approved', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.approve(user1, 50)
			const res = await dev
				.transferFrom(deployer, user2, 51, { from: user1 })
				.catch((err: Error) => err)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)

			await dev.increaseAllowance(user1, 1)
			await dev.transferFrom(deployer, user2, 50, { from: user1 })
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(50)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(50)
		})
		it('decrease the approved amount after approved', async () => {
			const dev = await createMintedDev()
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user1)).toNumber()).to.equal(0)

			await dev.approve(user1, 50)
			await dev.decreaseAllowance(user1, 1)
			const res = await dev
				.transferFrom(deployer, user2, 50, { from: user1 })
				.catch((err: Error) => err)
			expect((await dev.balanceOf(deployer)).toNumber()).to.equal(100)
			expect((await dev.balanceOf(user2)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
	})
	describe('Dev; deposit', () => {
		const generateEnv = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generateDev()
			await dev.generateDevMinter()
			await Promise.all([
				dev.generateLockup(),
				dev.generatePropertyFactory(),
				dev.generatePropertyGroup(),
				dev.generateAllocator(),
				dev.generateMetricsGroup(),
				dev.generateWithdraw(),
				dev.generatePolicyFactory(),
				dev.generatePolicyGroup(),
			])
			await dev.generatePolicy('PolicyTest1')
			return dev
		}

		const createProperty = async (dev: DevProtocolInstance): Promise<string> =>
			dev.propertyFactory
				.create('test', 'test', deployer)
				.then(
					(res) => res.logs.find((x) => x.event === 'Create')?.args._property
				)

		it('lockup token to properties', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.metricsGroup.__setMetricsCountPerProperty(prop, 1)
			await dev.dev.mint(user1, 100)
			await dev.dev.deposit(prop, 50, { from: user1 })
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(50)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(
				50
			)
		})
		it('check gas used', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.metricsGroup.__setMetricsCountPerProperty(prop, 1)
			await dev.dev.mint(user1, 100)
			const transaction = await dev.dev.deposit(prop, 50, { from: user1 })
			const gasPrice = Number(transaction.receipt.gasUsed)
			console.log(gasPrice)
			expect(gasPrice <= 849424).to.be.equal(true)
		})
		it('should fail to lock up token when 0 amount', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.metricsGroup.__setMetricsCountPerProperty(prop, 1)
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.deposit(prop, 0, { from: user1 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(100)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
			validateErrorMessage(res, 'illegal lockup value')
		})
		it('should fail to lockup token when sent from no balance account', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			const res = await dev.dev
				.deposit(prop, 100, { from: user1 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(0)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to lockup token when sent from an insufficient balance account', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.deposit(prop, 101, { from: user1 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(100)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to lockup token when the destination is other than property', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.deposit(user2, 50, { from: user1 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(100)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to lockup token when the lockup amount is 0', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.deposit(prop, 0, { from: user1 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(100)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('lockup token by running the depositFrom from another account after approved', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.metricsGroup.__setMetricsCountPerProperty(prop, 1)
			await dev.dev.mint(user1, 100)
			await dev.dev.approve(user2, 50, { from: user1 })
			await dev.dev.depositFrom(user1, prop, 50, { from: user2 })
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(50)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(
				50
			)
		})
		it('should fail to lockup token when running the depositFrom of over than approved amount from another account after approved', async () => {
			const dev = await generateEnv()
			const prop = await createProperty(dev)
			await dev.dev.mint(user1, 100)
			await dev.dev.approve(user2, 50, { from: user1 })
			const res = await dev.dev
				.depositFrom(user1, prop, 51, { from: user2 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)

			expect(balance.toNumber()).to.be.equal(100)
			expect((await dev.lockup.getValue(prop, user1)).toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
	})
	describe('Dev; fee', () => {
		const generateEnv = async (): Promise<DevProtocolInstance> => {
			const dev = new DevProtocolInstance(deployer)
			await dev.generateAddressConfig()
			await dev.generateDev()
			await dev.generateDevMinter()
			await dev.generateMarketGroup()
			return dev
		}

		it('burn token as a fee', async () => {
			const dev = await generateEnv()
			await dev.addressConfig.setMarketFactory(marketFactory)
			await dev.marketGroup.addGroup(market, { from: marketFactory })
			await dev.dev.mint(user1, 100)
			await dev.dev.fee(user1, 1, { from: market })
			const balance = await dev.dev.balanceOf(user1)
			expect(balance.toNumber()).to.be.equal(99)
		})
		it('burn 0 tokens as a fee', async () => {
			const dev = await generateEnv()
			await dev.addressConfig.setMarketFactory(marketFactory)
			await dev.marketGroup.addGroup(market, { from: marketFactory })
			await dev.dev.mint(user1, 100)
			await dev.dev.fee(user1, 0, { from: market })
			const balance = await dev.dev.balanceOf(user1)
			expect(balance.toNumber()).to.be.equal(100)
		})
		it('should fail to burn when sent from no balance account', async () => {
			const dev = await generateEnv()
			await dev.addressConfig.setMarketFactory(marketFactory)
			await dev.marketGroup.addGroup(market, { from: marketFactory })
			const balance = await dev.dev.balanceOf(user1)
			const res = await dev.dev
				.fee(user1, 1, { from: market })
				.catch((err: Error) => err)
			expect(balance.toNumber()).to.be.equal(0)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to burn when sent from an insufficient balance account', async () => {
			const dev = await generateEnv()
			await dev.addressConfig.setMarketFactory(marketFactory)
			await dev.marketGroup.addGroup(market, { from: marketFactory })
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.fee(user1, 101, { from: market })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)
			expect(balance.toNumber()).to.be.equal(100)
			expect(res).to.be.an.instanceOf(Error)
		})
		it('should fail to burn when sent from other than market contract', async () => {
			const dev = await generateEnv()
			await dev.addressConfig.setMarketFactory(marketFactory)
			await dev.marketGroup.addGroup(market, { from: marketFactory })
			await dev.dev.mint(user1, 100)
			const res = await dev.dev
				.fee(user1, 1, { from: user2 })
				.catch((err: Error) => err)
			const balance = await dev.dev.balanceOf(user1)
			expect(balance.toNumber()).to.be.equal(100)
			expect(res).to.be.an.instanceOf(Error)
		})
	})
})
