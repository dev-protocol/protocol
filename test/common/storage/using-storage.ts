import {UsingStorageTestInstance} from '../../../types/truffle-contracts'
import {validateErrorMessage} from '../../test-lib/utils/error'

contract('UsingStorageTest', ([deployer]) => {
	const UsingStorageTestContract = artifacts.require('UsingStorageTest')
	let usingStorageTest: UsingStorageTestInstance
	before(async () => {
		usingStorageTest = await UsingStorageTestContract.new({
			from: deployer
		})
	})
	describe('UsingStorage; hasStorage, createStorage', () => {
		it('If storage has not been created, an error will occur when trying to get the storage address.', async () => {
			const result = await usingStorageTest
				.getStorageAddress()
				.catch((err: Error) => err)
			validateErrorMessage(result, 'storage is not setted', false)
		})
		it('If storage has not been created, an error will occur when accessing storage.', async () => {
			const result = await usingStorageTest.getUInt().catch((err: Error) => err)
			validateErrorMessage(result, 'storage is not setted', false)
		})
		it('If storage has been created, the storage address can be obtained.', async () => {
			await usingStorageTest.createStorage()
			const result = await usingStorageTest.getStorageAddress()
			// eslint-disable-next-line no-undef
			expect(web3.utils.isAddress(result)).to.be.equal(true)
		})
		it('If the storage has been created, you can access the storage.', async () => {
			const result = await usingStorageTest.getUInt()
			expect(result.toNumber()).to.be.equal(0)
		})
		it('Creating storage again after storage has been created results in an error.', async () => {
			const result = await usingStorageTest
				.createStorage()
				.catch((err: Error) => err)
			validateErrorMessage(result, 'storage is setted')
		})
	})

	describe('UsingStorage; getStorageAddress, setStorage, changeOwner', () => {
		let usingStorageTestNext: UsingStorageTestInstance
		before(async () => {
			await usingStorageTest.setUInt(1)
			usingStorageTestNext = await UsingStorageTestContract.new({
				from: deployer
			})
		})
		it('Can get the value set in the storage.', async () => {
			const result = await usingStorageTest.getUInt()
			expect(result.toNumber()).to.be.equal(1)
		})
		it('the storage address is taken over, the same storage can be accessed from the takeover destination.', async () => {
			const storageAddress = await usingStorageTest.getStorageAddress()
			await usingStorageTestNext.setStorage(storageAddress)
			const result = await usingStorageTestNext.getUInt()
			expect(result.toNumber()).to.be.equal(1)
		})
		it('Before delegating authority, you can not write.', async () => {
			const result = await usingStorageTestNext
				.setUInt(2)
				.catch((err: Error) => err)
			validateErrorMessage(result, 'not current owner')
		})
		it('Delegation of authority is not possible from the delegate.', async () => {
			const result = await usingStorageTestNext
				.changeOwner(usingStorageTestNext.address)
				.catch((err: Error) => err)
			validateErrorMessage(result, 'not current owner')
		})
		it('When delegating authority, the delegate can write to storage', async () => {
			await usingStorageTest.changeOwner(usingStorageTestNext.address)
			await usingStorageTestNext.setUInt(2)
			const result = await usingStorageTestNext.getUInt()
			expect(result.toNumber()).to.be.equal(2)
		})
		it('When delegating authority, delegation source can not write to storage.', async () => {
			const result = await usingStorageTest
				.setUInt(2)
				.catch((err: Error) => err)
			validateErrorMessage(result, 'not current owner')
		})
	})
})
