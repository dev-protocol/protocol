import { validateErrorMessage } from '../../test-lib/utils/error'

contract('AdminAndOperatorRole', ([deployer, user1, user2]) => {
	describe('constructor', () => {
		it('The deployer gets admin privileges.', async () => {
			const role = await artifacts.require('AdminAndOperatorRole').new()
			let hasAdmin = await role.hasAdmin(deployer)
			expect(hasAdmin).to.be.equal(true)
			hasAdmin = await role.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(false)
		})
	})

	describe('addAdmin, removeAdmin, hasAdmin', () => {
		it('Permissions can be added or removed.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			let hasAdmin = await upgraderRole.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(false)
			await upgraderRole.addAdmin(user1)
			hasAdmin = await upgraderRole.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(true)
			await upgraderRole.removeAdmin(user1)
			hasAdmin = await upgraderRole.hasAdmin(user1)
			expect(hasAdmin).to.be.equal(false)
		})
		it('Only administrators can add permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const result = await upgraderRole
				.addAdmin(user1, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have admin role')
		})
		it('Only administrators can remove permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const result = await upgraderRole
				.removeAdmin(user1, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have admin role')
		})
		it('Anyone can check to see if who has permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const hasAdmin = await upgraderRole.hasAdmin(deployer, { from: user1 })
			expect(hasAdmin).to.be.equal(true)
		})
		it('we can not remove all administrators.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const result = await upgraderRole
				.removeAdmin(deployer)
				.catch((err: Error) => err)
			validateErrorMessage(result, 'last administrator can not be removed')
			const hasAdmin = await upgraderRole.hasAdmin(deployer)
			expect(hasAdmin).to.be.equal(true)
		})
	})
	describe('addOperator, removeOperator, hasOperator', () => {
		it('Permissions can be added or removed.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			let hasAdmin = await upgraderRole.hasOperator(user1)
			expect(hasAdmin).to.be.equal(false)
			await upgraderRole.addOperator(user1)
			hasAdmin = await upgraderRole.hasOperator(user1)
			expect(hasAdmin).to.be.equal(true)
			await upgraderRole.removeOperator(user1)
			hasAdmin = await upgraderRole.hasOperator(user1)
			expect(hasAdmin).to.be.equal(false)
		})
		it('Only administrators can add permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			let result = await upgraderRole
				.addOperator(user2, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have admin role')
			await upgraderRole.addOperator(user1)
			result = await upgraderRole
				.addOperator(user2, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have admin role')
		})
		it('Only administrators can remove permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			await upgraderRole.addOperator(user1)
			const result = await upgraderRole
				.removeOperator(user1, { from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have admin role')
		})
		it('Anyone can check to see if who has permissions.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const hasAdmin = await upgraderRole.hasOperator(deployer, { from: user1 })
			expect(hasAdmin).to.be.equal(false)
		})
	})
	describe('hasOperatingPrivilegesTest', () => {
		it('Admin has the operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const isOperator = await upgraderRole.hasOperatingPrivilegesTest(deployer)
			expect(isOperator).to.be.equal(true)
		})
		it('If user do not have operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const isOperator = await upgraderRole.hasOperatingPrivilegesTest(user1)
			expect(isOperator).to.be.equal(false)
		})
		it('Operator has the operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			await upgraderRole.addOperator(user1)
			const isOperator = await upgraderRole.hasOperatingPrivilegesTest(user1)
			expect(isOperator).to.be.equal(true)
		})
	})
	describe('onlyAdminAndOperatorTest', () => {
		it('Admin have the operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const isOperator = await upgraderRole.onlyAdminAndOperatorTest()
			expect(isOperator).to.be.equal(true)
		})
		it('If you do not have operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			const result = await upgraderRole
				.onlyAdminAndOperatorTest({ from: user1 })
				.catch((err: Error) => err)
			validateErrorMessage(result, 'does not have operator role', false)
		})
		it('Operator has the operating privileges.', async () => {
			const upgraderRole = await artifacts.require('AdminAndOperatorRole').new()
			await upgraderRole.addOperator(user1)
			const isOperator = await upgraderRole.onlyAdminAndOperatorTest({
				from: user1,
			})
			expect(isOperator).to.be.equal(true)
		})
	})
})
