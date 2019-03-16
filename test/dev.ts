// tslint:disable:no-unsafe-any
const dev = artifacts.require('Dev')

contract('Dev', ([deployer, account1]) => {
	it('Should return the value set by the deployer initially', async () => {
		const contract = await dev.new(123, { from: deployer })
		const results = await contract.get({ from: deployer })
		expect(results.toString()).to.be.deep.eq('123')
	})

	it('Should return the value set by the account itself', async () => {
		const contract = await dev.new(123, { from: deployer })
		await contract.set(999, { from: account1 })
		const results = await contract.get({ from: account1 })
		expect(results.toString()).to.be.deep.eq('999')
	})
})
