// tslint:disable:file-name-casing
const migrations = artifacts.require('Migrations')
const dev = artifacts.require('Dev')

module.exports = (deployer: {
	deploy: {
		(arg0: import('../types/truffle-contracts').MigrationsContract): void
		(arg0: import('../types/truffle-contracts').DevContract, arg1: string): void
	}
}): void => {
	deployer.deploy(migrations)
	deployer.deploy(dev, 'test')
}

export {}
