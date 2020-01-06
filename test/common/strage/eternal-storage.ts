import {DevProtocolInstance} from './../../lib/instance'

contract('EternalStorageTest', ([deployer, user1, newOwner, addressValue]) => {
	const dev = new DevProtocolInstance(deployer)
	describe('EternalStorage; getter,setter,deleter', () => {
		// eslint-disable-next-line no-undef
		const key = web3.utils.keccak256('key')
		// eslint-disable-next-line no-undef
		const unsetKey = web3.utils.keccak256('unsetKey')
		before(async () => {
			await dev.generateEternalStorage()
		})
		describe('uint', () => {
			it('get.', async () => {
				await dev.eternalStorage.setUint(key, 10, {from: deployer})
				const result = await dev.eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(10)
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteUint(key)
				const result = await dev.eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getUint(unsetKey)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('cannot be set to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await dev.eternalStorage
					.setUint(key, 10, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteUint(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('byte32', () => {
			let value: string
			before(async () => {
				// eslint-disable-next-line no-undef
				value = web3.utils.keccak256('value')
			})
			it('get.', async () => {
				await dev.eternalStorage.setBytes(key, value, {from: deployer})
				const result = await dev.eternalStorage.getBytes(key)
				expect(result).to.be.equal(value)
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteBytes(key)
				const result = await dev.eternalStorage.getBytes(key)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getBytes(unsetKey)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('cannot be set to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.setBytes(key, value, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteBytes(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('string', () => {
			it('get.', async () => {
				await dev.eternalStorage.setString(key, 'test', {from: deployer})
				const result = await dev.eternalStorage.getString(key)
				expect(result).to.be.equal('test')
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteString(key)
				const result = await dev.eternalStorage.getString(key)
				expect(result).to.be.equal('')
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getString(unsetKey)
				expect(result).to.be.equal('')
			})
			it('cannot be set to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.setString(key, 'test', {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteString(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('bool', () => {
			it('get.', async () => {
				await dev.eternalStorage.setBool(key, true, {from: deployer})
				const result = await dev.eternalStorage.getBool(key)
				expect(result).to.be.equal(true)
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteBool(key)
				const result = await dev.eternalStorage.getBool(key)
				expect(result).to.be.equal(false)
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getBool(unsetKey)
				expect(result).to.be.equal(false)
			})
			it('cannot be set to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.setBool(key, true, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteBool(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('int', () => {
			it('get.', async () => {
				await dev.eternalStorage.setInt(key, -1, {from: deployer})
				const result = await dev.eternalStorage.getInt(key)
				expect(result.toNumber()).to.be.equal(-1)
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteInt(key)
				const result = await dev.eternalStorage.getInt(key)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getInt(unsetKey)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('cannot be set to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.setInt(key, -1, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteInt(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('address', () => {
			it('get.', async () => {
				await dev.eternalStorage.setAddress(key, addressValue, {from: deployer})
				const result = await dev.eternalStorage.getAddress(key)
				expect(result).to.be.equal(addressValue)
			})
			it('delete.', async () => {
				await dev.eternalStorage.deleteAddress(key)
				const result = await dev.eternalStorage.getAddress(key)
				expect(result).to.be.equal('0x0000000000000000000000000000000000000000')
			})
			it('get initial value.', async () => {
				const result = await dev.eternalStorage.getAddress(unsetKey)
				expect(result).to.be.equal('0x0000000000000000000000000000000000000000')
			})
			it('cannot be set to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.setAddress(key, addressValue, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				const result = await dev.eternalStorage
					.deleteAddress(key, {from: user1})
					.catch((err: Error) => err)
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
	})
	describe('EternalStorage; upgradeOwner', () => {
		// eslint-disable-next-line no-undef
		let key = web3.utils.keccak256('key')
		before(async () => {
			await dev.eternalStorage.changeOwner(newOwner, {from: deployer})
		})
		it('If the owner changes, the owner can change the value.', async () => {
			await dev.eternalStorage.setUint(key, 1, {from: newOwner})
			const result = await dev.eternalStorage.getUint(key)
			expect(result.toNumber()).to.be.equal(1)
		})
		it('If the owner changes, the value cannot be changed by the original owner.', async () => {
			const result = await dev.eternalStorage
				.setUint(key, 1, {from: deployer})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
			)
		})
		it('Even if the owner changes, the value cannot be changed from an unrelated address.', async () => {
			const result = await dev.eternalStorage
				.setUint(key, 1, {from: user1})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
			)
		})
		it('Even if the owner changes, owner change is not executed.', async () => {
			const result = await dev.eternalStorage
				.changeOwner(user1, {from: user1})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
			)
		})
	})
})
