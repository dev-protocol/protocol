import '../types/truffle-contracts/merge'

const migrations = artifacts.require('Migrations')
const dev = artifacts.require('Dev')

module.exports = (deployer: {
	deploy<T>(contract: Truffle.Contract<T>): void
}): void => {
	deployer.deploy(migrations)
	deployer.deploy(dev)
}
