import {addressConfig} from './addresses'

const handler = function(deployer, network) {
	if (network === 'test') {
		return
	}

	deployer.deploy(artifacts.require('PropertyFactory'), addressConfig)
} as Truffle.Migration

export = handler
