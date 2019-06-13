/* eslint-disable @typescript-eslint/camelcase */
require('ts-node/register')

module.exports = {
	test_file_extension_regexp: /.*\.ts$/,
	compilers: {
		solc: {
			version: '^0.5.2'
		}
	}
}
