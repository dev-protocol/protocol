/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
require('ts-node/register')
require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')
const {WEB3_PROVIDERS_AZURE, WEB3_WALLET_MNEMONIC} = process.env

module.exports = {
	test_file_extension_regexp: /.*\.ts$/,
	compilers: {
		solc: {
			version: '^0.5.9'
		}
	},
	networks: {
		azure: {
			provider: () =>
				new HDWalletProvider(WEB3_WALLET_MNEMONIC, WEB3_PROVIDERS_AZURE),
			network_id: '*',
			gas: 0,
			gasPrice: 0
		}
	}
}
