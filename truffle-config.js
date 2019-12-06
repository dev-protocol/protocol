/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
require('ts-node/register')
require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')
const {ETHEREUM_PROVIDERS_AZURE, ETHEREUM_WALLET_MNEMONIC} = process.env

module.exports = {
	test_file_extension_regexp: /.*\.ts$/,
	compilers: {
		solc: {
			version: '^0.5.9'
		}
	},
	networks: {
		mock: {
			host: '127.0.0.1',
			port: 7545,
			network_id: '*'
		},
		azure: {
			provider: () =>
				new HDWalletProvider(
					ETHEREUM_WALLET_MNEMONIC,
					ETHEREUM_PROVIDERS_AZURE
				),
			network_id: '*',
			gas: 0,
			gasPrice: 0
		}
	}
}
