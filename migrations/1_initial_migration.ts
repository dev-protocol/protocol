import '../types/truffle-contracts/merge'

const migrations = artifacts.require('Migrations')
const dev = artifacts.require('Dev')
const project = artifacts.require('Project')

module.exports = (deployer: {
	deploy<T>(contract: Truffle.Contract<T>): void
}): void => {
	deployer.deploy(migrations)
	deployer.deploy(dev)
	deployer.deploy(project)
}
