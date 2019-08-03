/* eslint-disable @typescript-eslint/camelcase, @typescript-eslint/no-var-requires */
require('ts-node/register')
require('dotenv').config()
const Web3 = require('web3')

const {
	WEB3_PROVIDERS_AZURE,
	WEB3_PROVIDERS_AZURE_ACCOUNT,
	WEB3_PROVIDERS_AZURE_PASSWORD
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
					WEB3_PROVIDERS_AZURE_ACCOUNT,
					WEB3_PROVIDERS_AZURE_PASSWORD
				),
			network_id: '*',
			from: WEB3_PROVIDERS_AZURE_ACCOUNT
		}
	}
}
