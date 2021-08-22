import { validateErrorMessage } from '../../test-lib/utils/error'
import { DEFAULT_ADDRESS } from '../../test-lib/const'
import { EternalStorageInstance } from '../../../types/truffle-contracts'

contract('EternalStorageTest', ([deployer, user1, newOwner, addressValue]) => {
	let eternalStorage: EternalStorageInstance
	before(async () => {
		const eternalStorageContract = artifacts.require('EternalStorage')
		eternalStorage = await eternalStorageContract.new({
			from: deployer,
		})
	})
	describe('EternalStorage; getter,setter,deleter', () => {
		const key: string = web3.utils.keccak256('key') as string
		const unsetKey: string = web3.utils.keccak256('unsetKey') as string
		describe('uint', () => {
			it('get.', async () => {
				await eternalStorage.setUint(key, 10, { from: deployer })
				const result = await eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(10)
			})
			it('delete.', async () => {
				await eternalStorage.deleteUint(key)
				const result = await eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getUint(unsetKey)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('cannot be set to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				await eternalStorage
					.setUint(key, 10, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteUint(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
		describe('byte32', () => {
			let value: string
			before(async () => {
				value = web3.utils.keccak256('value') as string
			})
			it('get.', async () => {
				await eternalStorage.setBytes(key, value, { from: deployer })
				const result = await eternalStorage.getBytes(key)
				expect(result).to.be.equal(value)
			})
			it('delete.', async () => {
				await eternalStorage.deleteBytes(key)
				const result = await eternalStorage.getBytes(key)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getBytes(unsetKey)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('cannot be set to other than the owner.', async () => {
				await eternalStorage
					.setBytes(key, value, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteBytes(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
		describe('string', () => {
			it('get.', async () => {
				await eternalStorage.setString(key, 'test', { from: deployer })
				const result = await eternalStorage.getString(key)
				expect(result).to.be.equal('test')
			})
			it('delete.', async () => {
				await eternalStorage.deleteString(key)
				const result = await eternalStorage.getString(key)
				expect(result).to.be.equal('')
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getString(unsetKey)
				expect(result).to.be.equal('')
			})
			it('cannot be set to other than the owner.', async () => {
				await eternalStorage
					.setString(key, 'test', { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteString(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
		describe('bool', () => {
			it('get.', async () => {
				await eternalStorage.setBool(key, true, { from: deployer })
				const result = await eternalStorage.getBool(key)
				expect(result).to.be.equal(true)
			})
			it('delete.', async () => {
				await eternalStorage.deleteBool(key)
				const result = await eternalStorage.getBool(key)
				expect(result).to.be.equal(false)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getBool(unsetKey)
				expect(result).to.be.equal(false)
			})
			it('cannot be set to other than the owner.', async () => {
				await eternalStorage
					.setBool(key, true, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteBool(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
		describe('int', () => {
			it('get.', async () => {
				await eternalStorage.setInt(key, -1, { from: deployer })
				const result = await eternalStorage.getInt(key)
				expect(result.toNumber()).to.be.equal(-1)
			})
			it('delete.', async () => {
				await eternalStorage.deleteInt(key)
				const result = await eternalStorage.getInt(key)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getInt(unsetKey)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('cannot be set to other than the owner.', async () => {
				await eternalStorage
					.setInt(key, -1, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteInt(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
		describe('address', () => {
			it('get.', async () => {
				await eternalStorage.setAddress(key, addressValue, { from: deployer })
				const result = await eternalStorage.getAddress(key)
				expect(result).to.be.equal(addressValue)
			})
			it('delete.', async () => {
				await eternalStorage.deleteAddress(key)
				const result = await eternalStorage.getAddress(key)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getAddress(unsetKey)
				expect(result).to.be.equal(DEFAULT_ADDRESS)
			})
			it('cannot be set to other than the owner.', async () => {
				await eternalStorage
					.setAddress(key, addressValue, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
			it('cannot be delete to other than the owner.', async () => {
				await eternalStorage
					.deleteAddress(key, { from: user1 })
					.catch((err: Error) => {
						validateErrorMessage(err, 'not current owner')
					})
			})
		})
	})
	describe('EternalStorage; upgradeOwner', () => {
		const key: string = web3.utils.keccak256('key') as string
		before(async () => {
			await eternalStorage.changeOwner(newOwner, { from: deployer })
		})
		it('If the owner changes, the owner can change the value.', async () => {
			await eternalStorage.setUint(key, 1, { from: newOwner })
			const result = await eternalStorage.getUint(key)
			expect(result.toNumber()).to.be.equal(1)
		})
		it('If the owner changes, the value cannot be changed by the original owner.', async () => {
			await eternalStorage
				.setUint(key, 1, { from: deployer })
				.catch((err: Error) => {
					validateErrorMessage(err, 'not current owner')
				})
		})
		it('Even if the owner changes, the value cannot be changed from an unrelated address.', async () => {
			await eternalStorage
				.setUint(key, 1, { from: user1 })
				.catch((err: Error) => {
					validateErrorMessage(err, 'not current owner')
				})
		})
		it('Even if the owner changes, owner change is not executed.', async () => {
			await eternalStorage
				.changeOwner(user1, { from: user1 })
				.catch((err: Error) => {
					validateErrorMessage(err, 'not current owner')
				})
		})
	})
})
