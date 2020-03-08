const addressConfig = '0x1D415aa39D647834786EB9B5a333A50e9935b796'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	;((deployer as unknown) as Promise<void>)
		.then(async () => {
			return Promise.all([
				artifacts.require('AddressConfig').at(addressConfig),
				artifacts.require('Allocator').deployed(),
				artifacts.require('MarketFactory').deployed()
			])
		})
		.then(async ([addressConfig, allocator, marketFactory]) => {
			return Promise.all([
				addressConfig.setAllocator(allocator.address),
				addressConfig.setMarketFactory(marketFactory.address)
			])
		})
		.then(() => {
			console.log('*** completed ***')
		})
		.catch(err => {
			console.error('*** ERROR! ***', err)
		})
} as Truffle.Migration

export = handler
