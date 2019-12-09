const handler = function(deployer, network) {
	if (network !== 'mock') {
		return
	}

	// Write some code that creates a mockup here.
	console.log(network)
} as Truffle.Migration

export = handler
