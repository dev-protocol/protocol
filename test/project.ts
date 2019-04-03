// tslint:disable:no-unsafe-any
import { values } from 'ramda'
const project = artifacts.require('Project')

contract('Project', ([deployer, relayer, backlog, user1]) => {
	it('Store option data when deployed', async () => {
		const contract = await project.new(relayer, backlog, 'UUID', 'github', {
			from: deployer
		})
		const results = await contract.options()
		const [xRelayer, xBacklog, xId, xSource] = values(results)
		expect(xRelayer).to.be.deep.eq(relayer)
		expect(xBacklog).to.be.deep.eq(backlog)
		expect(xId).to.be.deep.eq('UUID')
		expect(xSource).to.be.deep.eq('github')
	})

	describe('Entry user', () => {
		it('Save a map of the user and relayer addresses when the user enters')

		it('Should be users have no duplicates')
	})

	describe('Run evaluate', () => {
		it('Emit "StartEvaluate" event when execute evaluate function')

		it('Should be evaluation keys have no duplicates')
	})

	describe('Set score', () => {
		it('Save evaluation key and score array')
	})

	describe('Get score', () => {
		it('Should "getScore" function returns is the total and all subtotal')

		it('Should "getTotalScore" function returns is the total')

		it('Should "getUserScore" function returns is the specified user score')
	})

	it('Should be can execute self-destruction only by an owner')
})
