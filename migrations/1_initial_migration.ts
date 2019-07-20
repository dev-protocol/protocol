import '../types/truffle-contracts/merge'

const migrations = artifacts.require('Migrations')
const allocator = artifacts.require('Allocator')
const market = artifacts.require('Market')
const marketBehaviorTest = artifacts.require('MarketBehaviorTest')
const marketFactory = artifacts.require('MarketFactory')
const property = artifacts.require('Property')
const propertyFactory = artifacts.require('PropertyFactory')
const state = artifacts.require('State')
const useState = artifacts.require('UseState')
const useStateTest = artifacts.require('UseStateTest')

module.exports = (deployer: {
	deploy<T>(contract: Truffle.Contract<T>): void
}): void => {
	deployer.deploy(migrations)
	deployer.deploy(allocator)
	deployer.deploy(market)
	deployer.deploy(marketBehaviorTest)
	deployer.deploy(marketFactory)
	deployer.deploy(property)
	deployer.deploy(propertyFactory)
	deployer.deploy(state)
	deployer.deploy(useState)
	deployer.deploy(useStateTest)
}
