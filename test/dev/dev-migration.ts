import { DevProtocolInstance } from '../test-lib/instance'
import {
	takeSnapshot,
	revertToSnapshot,
	Snapshot,
} from '../test-lib/utils/snapshot'
import { DevInstance } from '../../types/truffle-contracts'

contract('DevMigration', ([deployer, user1, user2]) => {
	const devMigrationContract = artifacts.require('DevMigration')
	const createDev = async (): Promise<DevInstance> => {
		const dev = new DevProtocolInstance(deployer)
		await dev.generateAddressConfig()
		await dev.generateDev()
		await dev.generateDevMinter()
		return dev.dev
	}

	let legacy: DevInstance
	let next: DevInstance
	let snapshot: Snapshot
	let snapshotId: string

	before(async () => {
		legacy = await createDev()
		next = await createDev()
	})

	beforeEach(async () => {
		snapshot = (await takeSnapshot()) as Snapshot
		snapshotId = snapshot.result
	})

	afterEach(async () => {
		await revertToSnapshot(snapshotId)
	})

	describe('DevMigration; migrate', () => {
		it('migrate balance between ERC20-to-ERC20', async () => {
			await legacy.mint(user1, 100)
			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(100)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)

			const migration = await devMigrationContract.new(
				legacy.address,
				next.address
			)
			await legacy.approve(
				migration.address,
				(await legacy.balanceOf(user1)).toNumber(),
				{ from: user1 }
			)
			await next.addMinter(migration.address)
			await migration.migrate({ from: user1 })

			expect((await legacy.totalSupply()).toNumber()).to.equal(0)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(0)
			expect((await next.totalSupply()).toNumber()).to.equal(100)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(100)
		})
		it('should fail to migrate balance when the contract is not approved', async () => {
			await legacy.mint(user1, 100)
			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(100)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)

			const migration = await devMigrationContract.new(
				legacy.address,
				next.address
			)
			await next.addMinter(migration.address)
			const res = await migration
				.migrate({ from: user1 })
				.catch((err: Error) => err)

			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(100)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
		it('should fail to migrate balance when the contract is not minter', async () => {
			await legacy.mint(user1, 100)
			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(100)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)

			const migration = await devMigrationContract.new(
				legacy.address,
				next.address
			)
			await legacy.approve(
				migration.address,
				(await legacy.balanceOf(user1)).toNumber(),
				{ from: user1 }
			)
			const res = await migration
				.migrate({ from: user1 })
				.catch((err: Error) => err)

			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(100)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)
			expect(res).to.be.an.instanceof(Error)
		})
		it('the balance is not migrating when sent from no balance account', async () => {
			await legacy.mint(user2, 100)
			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(0)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)

			const migration = await devMigrationContract.new(
				legacy.address,
				next.address
			)
			await legacy.approve(
				migration.address,
				(await legacy.balanceOf(user1)).toNumber(),
				{ from: user1 }
			)
			await next.addMinter(migration.address)
			await migration.migrate({ from: user1 })

			expect((await legacy.totalSupply()).toNumber()).to.equal(100)
			expect((await legacy.balanceOf(user1)).toNumber()).to.equal(0)
			expect((await next.totalSupply()).toNumber()).to.equal(0)
			expect((await next.balanceOf(user1)).toNumber()).to.equal(0)
		})
	})
})
