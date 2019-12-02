contract('EternalStorageTest', ([deployer, user1, newOwner]) => {
	const eternalStorageContract = artifacts.require(
		'common/storage/EternalStorage'
	)
	describe('EternalStorage; getter,setter,deleter', () => {
		let eternalStorage: any
		let key: any
		let unsetkey: any
		beforeEach(async () => {
			eternalStorage = await eternalStorageContract.new({from: deployer})
			// eslint-disable-next-line no-undef
			key = web3.utils.keccak256('key')
			// eslint-disable-next-line no-undef
			unsetkey = web3.utils.keccak256('unsetKey')
		})
		describe('uint', () => {
			it('get.', async () => {
				await eternalStorage.setUint(key, 10, {from: deployer})
				const result = await eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(10)
			})
			it('delete.', async () => {
				await eternalStorage.setUint(key, 10, {from: deployer})
				await eternalStorage.deleteUint(key)
				const result = await eternalStorage.getUint(key)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getUint(unsetkey)
				expect(result.toNumber()).to.be.equal(0)
			})
			it('cannot be set to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.setUint(key, 10, {from: user1})
					.catch((err: Error) => err)
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.deleteUint(key, {from: user1})
					.catch((err: Error) => err)
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('byte32', () => {
			let value: any
			beforeEach(async () => {
				// eslint-disable-next-line no-undef
				value = web3.utils.keccak256('value')
			})
			it('get.', async () => {
				await eternalStorage.setBytes(key, value, {from: deployer})
				const result = await eternalStorage.getBytes(key)
				expect(result).to.be.equal(value)
			})
			it('delete.', async () => {
				await eternalStorage.setBytes(key, value, {from: deployer})
				await eternalStorage.deleteBytes(key)
				const result = await eternalStorage.getBytes(key)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getBytes(unsetkey)
				expect(result).to.be.equal(
					'0x0000000000000000000000000000000000000000000000000000000000000000'
				)
			})
			it('cannot be set to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.setBytes(key, value, {from: user1}) // eslint-disable max-nested-callbacks
					.catch((err: Error) => err) // eslint-disable max-nested-callbacks
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.deleteBytes(key, {from: user1})
					.catch((err: Error) => err)
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('string', () => {
			it('get.', async () => {
				await eternalStorage.setString(key, 'test', {from: deployer})
				const result = await eternalStorage.getString(key)
				expect(result).to.be.equal('test')
			})
			it('delete.', async () => {
				await eternalStorage.setString(key, 'test', {from: deployer})
				await eternalStorage.deleteString(key)
				const result = await eternalStorage.getString(key)
				expect(result).to.be.equal('')
			})
			it('get initial value.', async () => {
				const result = await eternalStorage.getString(unsetkey)
				expect(result).to.be.equal('')
			})
			it('cannot be set to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.setString(key, 'test', {from: user1})
					.catch((err: Error) => err)
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
			it('cannot be delete to other than the owner.', async () => {
				/* eslint-disable max-nested-callbacks */
				const result = await eternalStorage
					.deleteString(key, {from: user1})
					.catch((err: Error) => err)
				/* eslint-disable max-nested-callbacks */
				expect((result as Error).message).to.be.equal(
					'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
				)
			})
		})
		describe('bool', () => {
			it('get.', async () => {})
			it('delete.', async () => {})
			it('get initial value.', async () => {})
			it('cannot be set to other than the owner.', async () => {})
			it('cannot be delete to other than the owner.', async () => {})
		})
		describe('int', () => {
			it('get.', async () => {})
			it('delete.', async () => {})
			it('get initial value.', async () => {})
			it('cannot be set to other than the owner.', async () => {})
			it('cannot be delete to other than the owner.', async () => {})
		})
		describe('address', () => {
			it('get.', async () => {})
			it('delete.', async () => {})
			it('get initial value.', async () => {})
			it('cannot be set to other than the owner.', async () => {})
			it('cannot be delete to other than the owner.', async () => {})
		})
	})
	describe('EternalStrage; upgradeOwner', () => {
		let eternalStorage: any
		let key: any
		beforeEach(async () => {
			eternalStorage = await eternalStorageContract.new({from: deployer})
			// eslint-disable-next-line no-undef
			key = web3.utils.keccak256('key')
			await eternalStorage.changeOwner(newOwner)
		})
		it('If the owner changes, the owner can change the value.', async () => {
			await eternalStorage.setUint(key, 1, {from: newOwner})
			const result = await eternalStorage.getUint(key)
			expect(result.toNumber()).to.be.equal(1)
		})
		it('If the owner changes, the value cannot be changed by the original owner.', async () => {
			const result = await eternalStorage
				.setUint(key, 1, {from: deployer})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
			)
		})
		it('Even if the owner changes, the value cannot be changed from an unrelated address.', async () => {
			const result = await eternalStorage
				.setUint(key, 1, {from: user1})
				.catch((err: Error) => err)
			expect((result as Error).message).to.be.equal(
				'Returned error: VM Exception while processing transaction: revert not current owner -- Reason given: not current owner.'
			)
		})
	})
})
