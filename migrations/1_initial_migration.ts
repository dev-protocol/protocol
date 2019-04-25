import '../types/truffle-contracts/merge'

const migrations = artifacts.require('Migrations')
const distributor = artifacts.require('Distributor')
const distributorFactory = artifacts.require('DistributorFactory')
const factory = artifacts.require('Factory')
const repository = artifacts.require('Repository')
const state = artifacts.require('State')
const useState = artifacts.require('UseState')

module.exports = (deployer: {
	deploy<T>(contract: Truffle.Contract<T>): void
}): void => {
	deployer.deploy(migrations)
	deployer.deploy(distributor)
	deployer.deploy(distributorFactory)
	deployer.deploy(factory)
	deployer.deploy(repository)
	deployer.deploy(state)
	deployer.deploy(useState)
}
