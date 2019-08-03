/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
require('ts-node/register')
require('dotenv').config()
const Web3 = require('web3')
const {
	WEB3_PROVIDERS_AZURE,
	WEB3_PROVIDERS_AZURE_FROM,
	WEB3_PROVIDERS_AZURE_ACCOUNT_PASSPHRASE
} = process.env
const createProvider = (node, account, password) => {
	const prov = new Web3.providers.HttpProvider(node)
	const web3 = new Web3(prov)
	web3.eth.personal.unlockAccount(account, password)
	return prov
}

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
				createProvider(
					WEB3_PROVIDERS_AZURE,
					WEB3_PROVIDERS_AZURE_FROM,
					WEB3_PROVIDERS_AZURE_ACCOUNT_PASSPHRASE
				),
			from: WEB3_PROVIDERS_AZURE_FROM,
			network_id: '*',
			gas: 0,
			gasPrice: 0
		}
	}
}
