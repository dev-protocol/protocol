const handler = function (deployer, network) {
	if (network === 'test') {
		return
	}

	const lockup = artifacts.require('Lockup')
	const devMigration = artifacts.require('DevMigration')
	const withdraw = artifacts.require('Withdraw')
	;(deployer as unknown as Promise<void>)
		.then(async () => {
			return artifacts.require('Dev').deployed()
		})
		.then(async (dev) => {
			return Promise.all([
				dev.addMinter(devMigration.address),
				dev.addMinter(lockup.address),
				dev.addMinter(withdraw.address),
			])
		})
		.then(() => {
			console.log(
				'*** The addition of the address of the contract to mint is completed ***'
			)
		})
		.catch((err) => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
