/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */

require('ts-node/register')
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const {
	ETHEREUM_PROVIDERS_MAINNET,
	ETHEREUM_PROVIDERS_ROPSTEN,
	ETHEREUM_PROVIDERS_AZURE,
	ETHEREUM_WALLET_MNEMONIC,
	ETHEREUM_MOCK_HOST,
	ETHEREUM_MOCK_PORT,
	ETHEREUM_ETHERSCAN_API_KEY,
} = process.env

module.exports = {
	test_file_extension_regexp: /.*\.ts$/,
	compilers: {
		solc: {
			version: '^0.5.16',
			settings: {
				optimizer: {
					enabled: true,
				},
			},
		},
	},
	networks: {
		mainnet: {
			provider: () =>
				new HDWalletProvider(
					ETHEREUM_WALLET_MNEMONIC,
					ETHEREUM_PROVIDERS_MAINNET
				),
			network_id: 1,
			gas: 4000000,
			gasPrice: 10000000000,
		},
		ropsten: {
			provider: () =>
				new HDWalletProvider(
					ETHEREUM_WALLET_MNEMONIC,
					ETHEREUM_PROVIDERS_ROPSTEN
				),
			network_id: 3,
			gas: 4000000,
			gasPrice: 10000000000,
		},
		mock: {
			host: ETHEREUM_MOCK_HOST,
			port: ETHEREUM_MOCK_PORT,
			network_id: '*',
		},
		azure: {
			provider: () =>
				new HDWalletProvider(
					ETHEREUM_WALLET_MNEMONIC,
					ETHEREUM_PROVIDERS_AZURE
				),
			network_id: '*',
			gas: 0,
			gasPrice: 0,
		},
	},
	plugins: ['truffle-plugin-verify'],
	api_keys: {
		etherscan: ETHEREUM_ETHERSCAN_API_KEY,
	},
	mocha: {
		enableTimeouts: false
	}
}
